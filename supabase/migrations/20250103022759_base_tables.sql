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
CREATE TYPE listing_status AS ENUM ('draft', 'published', 'archived', 'sold');
CREATE TYPE property_type AS ENUM ('house', 'apartment', 'land', 'commercial');
CREATE TYPE listing_type AS ENUM ('sale', 'rent');

-- Create address type
CREATE TYPE address_components AS (
    street_number text,
    street_name text,
    unit_number text,
    suburb text,
    city text,
    state text,
    postcode text,
    country text,
    formatted_address text,
    latitude float,
    longitude float
);

-- Create listings table
CREATE TABLE listings (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    title text NOT NULL,
    description text,
    price decimal(12,2) NOT NULL,
    status listing_status NOT NULL DEFAULT 'draft',
    property_type property_type NOT NULL,
    listing_type listing_type NOT NULL,
    bedrooms smallint,
    bathrooms smallint,
    parking_spaces smallint,
    land_size decimal(10,2),
    floor_size decimal(10,2),
    address address_components NOT NULL,
    features text[],
    images text[],
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    published_at timestamptz,
    created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    agency_id uuid NOT NULL
);

-- Create commission_structures table
CREATE TABLE commission_structures (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id uuid NOT NULL,
    name text NOT NULL,
    description text,
    base_rate decimal(5,2) NOT NULL,
    bonus_rate decimal(5,2),
    bonus_threshold decimal(12,2),
    is_default boolean DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT commission_structures_base_rate_check CHECK (base_rate >= 0 AND base_rate <= 100),
    CONSTRAINT commission_structures_bonus_rate_check CHECK (bonus_rate >= 0 AND bonus_rate <= 100),
    CONSTRAINT commission_structures_bonus_threshold_check CHECK (bonus_threshold > 0)
);

-- Add RLS policies
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE commission_structures ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX listings_status_idx ON listings(status);
CREATE INDEX listings_property_type_idx ON listings(property_type);
CREATE INDEX listings_listing_type_idx ON listings(listing_type);
CREATE INDEX listings_agency_id_idx ON listings(agency_id);
CREATE INDEX listings_created_by_idx ON listings(created_by);
CREATE INDEX commission_structures_agency_id_idx ON commission_structures(agency_id);

-- Add triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_listings_updated_at
    BEFORE UPDATE ON listings
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_commission_structures_updated_at
    BEFORE UPDATE ON commission_structures
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
