-- First drop the existing property_type column and type
ALTER TABLE listings DROP COLUMN IF EXISTS property_type;
DROP TYPE IF EXISTS property_type;

-- Create ENUM type for property_type
CREATE TYPE property_type AS ENUM (
  'single_family',
  'multi_family',
  'condo',
  'townhouse',
  'land',
  'commercial'
);

-- Add property_type column with ENUM type and handle virtual_tour_url
DO $$
BEGIN
  -- Add property_type column
  ALTER TABLE listings 
    ADD COLUMN property_type property_type DEFAULT 'single_family';

  -- Make virtual_tour_url nullable if it exists
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'listings' 
    AND column_name = 'virtual_tour_url'
  ) THEN
    ALTER TABLE listings 
      ALTER COLUMN virtual_tour_url DROP NOT NULL;
  ELSE
    -- Add virtual_tour_url column if it doesn't exist
    ALTER TABLE listings 
      ADD COLUMN virtual_tour_url TEXT NULL;
  END IF;
END$$;

-- Drop existing RLS policies if they exist
DROP POLICY IF EXISTS "Users can view their own listings" ON listings;
DROP POLICY IF EXISTS "Users can create their own listings" ON listings;
DROP POLICY IF EXISTS "Users can update their own listings" ON listings;
DROP POLICY IF EXISTS "Users can delete their own listings" ON listings;

-- Enable RLS on listings table
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for listings
CREATE POLICY "Users can view their own listings"
  ON listings
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own listings"
  ON listings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own listings"
  ON listings
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own listings"
  ON listings
  FOR DELETE
  USING (auth.uid() = user_id);

-- Add service role policy for listings
CREATE POLICY "Service role can manage all listings"
  ON listings
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Remove duplicate feature columns from listings table
ALTER TABLE listings
DROP COLUMN IF EXISTS construction_type,
DROP COLUMN IF EXISTS interior_features,
DROP COLUMN IF EXISTS exterior_features,
DROP COLUMN IF EXISTS parking_description,
DROP COLUMN IF EXISTS lot_description;

-- Convert text fields to appropriate numeric types
ALTER TABLE listings
ALTER COLUMN bedrooms TYPE integer USING (bedrooms::integer),
ALTER COLUMN bathrooms_full TYPE integer USING (bathrooms_full::integer),
ALTER COLUMN bathrooms_half TYPE integer USING (bathrooms_half::integer),
ALTER COLUMN square_feet_living TYPE numeric USING (square_feet_living::numeric),
ALTER COLUMN square_feet_total TYPE numeric USING (square_feet_total::numeric),
ALTER COLUMN lot_size_sf TYPE numeric USING (lot_size_sf::numeric),
ALTER COLUMN garage_spaces TYPE integer USING (garage_spaces::integer),
ALTER COLUMN carport_spaces TYPE integer USING (carport_spaces::integer),
ALTER COLUMN price TYPE numeric USING (price::numeric),
ALTER COLUMN tax_amount TYPE numeric USING (tax_amount::numeric),
ALTER COLUMN maintenance_fee TYPE numeric USING (maintenance_fee::numeric);

-- Fix address fields
DO $$
BEGIN
    -- Check if the column exists and hasn't been renamed yet
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'listings'
        AND column_name = 'address_street'
    ) THEN
        ALTER TABLE listings RENAME COLUMN address_street TO address;
    END IF;
END$$;

-- Add indexes for better performance (if they don't exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_listings_user_id') THEN
        CREATE INDEX idx_listings_user_id ON listings(user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_listings_status') THEN
        CREATE INDEX idx_listings_status ON listings(status);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_listings_property_type') THEN
        CREATE INDEX idx_listings_property_type ON listings(property_type);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_listings_price') THEN
        CREATE INDEX idx_listings_price ON listings(price);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_listings_created_at') THEN
        CREATE INDEX idx_listings_created_at ON listings(created_at);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_listing_features_listing_id') THEN
        CREATE INDEX idx_listing_features_listing_id ON listing_features(listing_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_listing_images_listing_id') THEN
        CREATE INDEX idx_listing_images_listing_id ON listing_images(listing_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_listing_views_listing_id') THEN
        CREATE INDEX idx_listing_views_listing_id ON listing_views(listing_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_listing_views_viewer_id') THEN
        CREATE INDEX idx_listing_views_viewer_id ON listing_views(viewer_id);
    END IF;
END$$;

-- Add constraints (if they don't exist)
DO $$
BEGIN
    -- Set NOT NULL constraint if not already set
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'listing_features' 
        AND column_name = 'listing_id' 
        AND is_nullable = 'YES'
    ) THEN
        ALTER TABLE listing_features ALTER COLUMN listing_id SET NOT NULL;
    END IF;

    -- Add unique constraint if not exists
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_constraint 
        WHERE conname = 'unique_listing_features'
    ) THEN
        ALTER TABLE listing_features ADD CONSTRAINT unique_listing_features UNIQUE (listing_id);
    END IF;

    -- Set NOT NULL constraint for listing_images if not already set
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'listing_images' 
        AND column_name = 'listing_id' 
        AND is_nullable = 'YES'
    ) THEN
        ALTER TABLE listing_images ALTER COLUMN listing_id SET NOT NULL;
    END IF;

    -- Add unique constraint for listing_images if not exists
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_constraint 
        WHERE conname = 'unique_image_position'
    ) THEN
        ALTER TABLE listing_images ADD CONSTRAINT unique_image_position UNIQUE (listing_id, position);
    END IF;
END$$;

-- Update timestamp handling
DO $$
BEGIN
    -- Set NOT NULL and default for created_at if not already set
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'listings' 
        AND column_name = 'created_at' 
        AND (is_nullable = 'YES' OR column_default IS NULL)
    ) THEN
        ALTER TABLE listings
        ALTER COLUMN created_at SET NOT NULL,
        ALTER COLUMN created_at SET DEFAULT timezone('utc'::text, now());
    END IF;

    -- Set NOT NULL and default for updated_at if not already set
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'listings' 
        AND column_name = 'updated_at' 
        AND (is_nullable = 'YES' OR column_default IS NULL)
    ) THEN
        ALTER TABLE listings
        ALTER COLUMN updated_at SET NOT NULL,
        ALTER COLUMN updated_at SET DEFAULT timezone('utc'::text, now());
    END IF;
END$$; 