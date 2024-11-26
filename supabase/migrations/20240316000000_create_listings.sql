-- Function to check if a table exists
CREATE OR REPLACE FUNCTION table_exists(table_name text) 
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = $1
    );
END;
$$ LANGUAGE plpgsql;

-- Function to check if a column exists
CREATE OR REPLACE FUNCTION column_exists(table_name text, column_name text) 
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public'
        AND table_name = $1
        AND column_name = $2
    );
END;
$$ LANGUAGE plpgsql;

-- Create enum types safely
DO $$ BEGIN
    CREATE TYPE listing_status AS ENUM ('draft', 'active', 'pending', 'sold', 'archived');
EXCEPTION
    WHEN duplicate_object THEN
        -- If type exists, try to add new values safely
        PERFORM t.typname
        FROM pg_type t
        JOIN pg_enum e ON t.oid = e.enumtypid
        WHERE t.typname = 'listing_status'
        AND e.enumlabel NOT IN ('draft', 'active', 'pending', 'sold', 'archived');
END $$;

DO $$ BEGIN
    CREATE TYPE property_type AS ENUM (
        'house',
        'apartment',
        'condo',
        'townhouse',
        'land',
        'commercial',
        'multi_family'
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Create or update listings table with safe column additions
DO $$ BEGIN
    IF NOT table_exists('listings') THEN
        CREATE TABLE listings (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            mls_number TEXT,
            status listing_status DEFAULT 'draft',
            address_street TEXT NOT NULL,
            address_unit TEXT,
            city TEXT NOT NULL,
            state TEXT NOT NULL,
            zip_code TEXT NOT NULL,
            county TEXT NOT NULL,
            folio_number TEXT,
            parcel_number TEXT,
            legal_description TEXT,
            property_type property_type NOT NULL,
            year_built TEXT,
            bedrooms TEXT,
            bathrooms_full TEXT,
            bathrooms_half TEXT,
            square_feet_living TEXT,
            square_feet_total TEXT,
            lot_size_sf TEXT,
            garage_spaces TEXT,
            carport_spaces TEXT,
            furnished BOOLEAN DEFAULT false,
            pool BOOLEAN DEFAULT false,
            waterfront BOOLEAN DEFAULT false,
            water_access BOOLEAN DEFAULT false,
            construction_type TEXT[],
            interior_features TEXT[],
            exterior_features TEXT[],
            parking_description TEXT[],
            lot_description TEXT[],
            price TEXT NOT NULL,
            tax_amount TEXT,
            tax_year TEXT,
            maintenance_fee TEXT,
            special_assessment BOOLEAN DEFAULT false,
            images TEXT[] DEFAULT '{}',
            virtual_tour_url TEXT,
            broker_remarks TEXT,
            showing_instructions TEXT,
            listing_office TEXT NOT NULL,
            listing_agent_name TEXT NOT NULL,
            listing_agent_phone TEXT NOT NULL,
            listing_agent_email TEXT NOT NULL,
            listing_agent_license TEXT NOT NULL,
            features JSONB DEFAULT '{}',
            metadata JSONB DEFAULT '{}',
            created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );
    ELSE
        -- Add new columns safely if they don't exist
        IF NOT column_exists('listings', 'features') THEN
            ALTER TABLE listings ADD COLUMN features JSONB DEFAULT '{}';
        END IF;
        IF NOT column_exists('listings', 'metadata') THEN
            ALTER TABLE listings ADD COLUMN metadata JSONB DEFAULT '{}';
        END IF;
        -- Add more column checks as needed
    END IF;
END $$;

-- Create or update analytics tables safely
DO $$ BEGIN
    IF NOT table_exists('listing_views') THEN
        CREATE TABLE listing_views (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
            viewer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
            ip_address INET,
            user_agent TEXT,
            viewed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );
    END IF;

    IF NOT table_exists('listing_leads') THEN
        CREATE TABLE listing_leads (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            phone TEXT,
            message TEXT,
            status TEXT DEFAULT 'new',
            created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );
    END IF;
END $$;

-- Create indexes safely
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_listings_user_id') THEN
        CREATE INDEX idx_listings_user_id ON listings(user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_listings_status') THEN
        CREATE INDEX idx_listings_status ON listings(status);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_listings_created_at') THEN
        CREATE INDEX idx_listings_created_at ON listings(created_at);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_listings_price') THEN
        CREATE INDEX idx_listings_price ON listings(price);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_listings_location_gin') THEN
        CREATE INDEX idx_listings_location_gin ON listings USING GIN (to_tsvector('english', location));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_listings_property_type') THEN
        CREATE INDEX idx_listings_property_type ON listings(property_type);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_listing_views_listing_id') THEN
        CREATE INDEX idx_listing_views_listing_id ON listing_views(listing_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_listing_views_viewed_at') THEN
        CREATE INDEX idx_listing_views_viewed_at ON listing_views(viewed_at);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_listing_leads_listing_id') THEN
        CREATE INDEX idx_listing_leads_listing_id ON listing_leads(listing_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_listing_leads_user_id') THEN
        CREATE INDEX idx_listing_leads_user_id ON listing_leads(user_id);
    END IF;
END $$;

-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for all users" ON listings;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON listings;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON listings;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON listings;

-- Enable RLS
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for all users"
    ON listings FOR SELECT
    USING (true);

CREATE POLICY "Enable insert for authenticated users"
    ON listings FOR INSERT
    WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

CREATE POLICY "Enable update for users based on user_id"
    ON listings FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Enable delete for users based on user_id"
    ON listings FOR DELETE
    USING (auth.uid() = user_id);

-- Create or replace trigger function
CREATE OR REPLACE FUNCTION update_listing_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger safely
DO $$ BEGIN
    DROP TRIGGER IF EXISTS update_listings_timestamp ON listings;
    CREATE TRIGGER update_listings_timestamp
        BEFORE UPDATE ON listings
        FOR EACH ROW
        EXECUTE FUNCTION update_listing_timestamp();
EXCEPTION
    WHEN others THEN NULL;
END $$;

-- Add storage bucket if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT FROM storage.buckets WHERE id = 'listings'
    ) THEN
        PERFORM storage.create_bucket(
            'listings',
            jsonb_build_object('public', true)
        );
    END IF;
EXCEPTION 
    WHEN others THEN 
        RAISE NOTICE 'Could not create storage bucket: %', SQLERRM;
END $$;

-- Add helpful comments
COMMENT ON TABLE listings IS 'Stores property listings with full details';
COMMENT ON TABLE listing_views IS 'Tracks views and analytics for listings';
COMMENT ON TABLE listing_leads IS 'Stores lead information for listings'; 