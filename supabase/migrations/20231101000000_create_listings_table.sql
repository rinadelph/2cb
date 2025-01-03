-- Create listings table
CREATE TABLE IF NOT EXISTS listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  mls_number VARCHAR(50),
  status VARCHAR(20) NOT NULL DEFAULT 'draft',
  
  -- Location
  address VARCHAR(255) NOT NULL,
  address_unit VARCHAR(50),
  city VARCHAR(100) NOT NULL,
  state VARCHAR(2) NOT NULL,
  zip_code VARCHAR(10) NOT NULL,
  county VARCHAR(100) NOT NULL,
  folio_number VARCHAR(50),
  parcel_number VARCHAR(50),
  legal_description TEXT,
  
  -- Property Details
  property_type VARCHAR(20) NOT NULL,
  year_built VARCHAR(4),
  bedrooms INTEGER,
  bathrooms_full INTEGER,
  bathrooms_half INTEGER,
  square_feet_living INTEGER,
  square_feet_total INTEGER,
  lot_size_sf INTEGER,
  garage_spaces INTEGER,
  carport_spaces INTEGER,
  
  -- Features
  furnished BOOLEAN DEFAULT FALSE,
  pool BOOLEAN DEFAULT FALSE,
  waterfront BOOLEAN DEFAULT FALSE,
  water_access BOOLEAN DEFAULT FALSE,
  
  -- Financial
  price DECIMAL(12,2) NOT NULL,
  tax_amount DECIMAL(12,2),
  tax_year VARCHAR(4),
  maintenance_fee DECIMAL(12,2),
  special_assessment BOOLEAN DEFAULT FALSE,
  
  -- Media
  virtual_tour_url TEXT,
  
  -- Agent Info
  broker_remarks TEXT,
  showing_instructions TEXT,
  listing_office VARCHAR(255) NOT NULL,
  listing_agent_name VARCHAR(255) NOT NULL,
  listing_agent_phone VARCHAR(20) NOT NULL,
  listing_agent_email VARCHAR(255) NOT NULL,
  listing_agent_license VARCHAR(50) NOT NULL,
  
  -- Metadata
  meta_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create listing_images table
CREATE TABLE IF NOT EXISTS listing_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  position INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS listings_user_id_idx ON listings(user_id);
CREATE INDEX IF NOT EXISTS listings_status_idx ON listings(status);
CREATE INDEX IF NOT EXISTS listings_property_type_idx ON listings(property_type);
CREATE INDEX IF NOT EXISTS listings_price_idx ON listings(price);
CREATE INDEX IF NOT EXISTS listings_created_at_idx ON listings(created_at);
CREATE INDEX IF NOT EXISTS listing_images_listing_id_idx ON listing_images(listing_id);
CREATE INDEX IF NOT EXISTS listing_images_position_idx ON listing_images(position);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_listings_updated_at
  BEFORE UPDATE ON listings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column(); 