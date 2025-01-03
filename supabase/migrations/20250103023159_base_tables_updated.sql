-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Drop existing objects if they exist
DROP TABLE IF EXISTS listings CASCADE;
DROP TABLE IF EXISTS commission_structures CASCADE;
DROP TYPE IF EXISTS listing_status CASCADE;
DROP TYPE IF EXISTS property_type CASCADE;
DROP TYPE IF EXISTS listing_type CASCADE;
DROP TYPE IF EXISTS address_components CASCADE;

-- Create enum types
CREATE TYPE listing_status AS ENUM ('draft', 'pending', 'active', 'inactive', 'expired', 'sold');
CREATE TYPE property_type AS ENUM ('single_family', 'multi_family', 'condo', 'townhouse', 'land', 'commercial', 'industrial');
CREATE TYPE listing_type AS ENUM ('sale', 'rent', 'lease', 'auction');

-- Create listings table
CREATE TABLE listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    organization_id UUID,
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(255) UNIQUE,
    description TEXT,
    status listing_status DEFAULT 'draft',
    property_type property_type NOT NULL,
    listing_type listing_type NOT NULL,
    price DECIMAL(12,2) NOT NULL,
    square_feet INTEGER,
    bedrooms SMALLINT,
    bathrooms DECIMAL(3,1),
    year_built INTEGER,
    lot_size DECIMAL(12,2),
    parking_spaces SMALLINT,
    stories SMALLINT,
    location GEOMETRY(Point, 4326),
    features JSONB DEFAULT '[]',
    amenities JSONB DEFAULT '[]',
    images JSONB DEFAULT '[]',
    documents JSONB DEFAULT '[]',
    meta_data JSONB DEFAULT '{}',
    search_vector tsvector GENERATED ALWAYS AS (
        setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(description, '')), 'B')
    ) STORED,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    published_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    commission_amount DECIMAL(10,2),
    commission_type VARCHAR(20) CHECK (commission_type IN ('percentage', 'flat')),
    commission_terms TEXT,
    commission_signature_data JSONB,
    commission_signed_at TIMESTAMPTZ,
    commission_signed_by UUID REFERENCES auth.users(id),
    commission_locked_at TIMESTAMPTZ,
    commission_locked_by UUID REFERENCES auth.users(id),
    commission_status VARCHAR(20) DEFAULT 'draft',
    commission_visibility_type VARCHAR(20) DEFAULT 'private',
    CONSTRAINT valid_price CHECK (price >= 0),
    CONSTRAINT valid_square_feet CHECK (square_feet IS NULL OR square_feet >= 0),
    CONSTRAINT valid_year CHECK (year_built IS NULL OR year_built BETWEEN 1800 AND EXTRACT(YEAR FROM NOW()) + 1)
);

-- Create commission_changes table
CREATE TABLE commission_changes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID REFERENCES listings(id),
    previous_amount DECIMAL(10,2),
    new_amount DECIMAL(10,2),
    changed_by UUID REFERENCES auth.users(id),
    changed_at TIMESTAMPTZ DEFAULT NOW(),
    signature_data JSONB,
    change_type VARCHAR(50),
    notes TEXT,
    CONSTRAINT fk_listing FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE
);

-- Create indices for performance
CREATE INDEX listings_user_id_idx ON listings(user_id);
CREATE INDEX listings_status_idx ON listings(status);
CREATE INDEX listings_location_idx ON listings USING gist(location);
CREATE INDEX listings_search_idx ON listings USING gin(search_vector);
CREATE INDEX listings_price_idx ON listings(price);
CREATE INDEX listings_created_at_idx ON listings(created_at);
CREATE INDEX commission_changes_listing_idx ON commission_changes(listing_id);
CREATE INDEX commission_changes_changed_at_idx ON commission_changes(changed_at);

-- Add RLS policies
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE commission_changes ENABLE ROW LEVEL SECURITY; 