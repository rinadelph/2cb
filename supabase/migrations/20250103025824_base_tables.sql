-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create enum types with IF NOT EXISTS
DO $$ BEGIN
    -- Listing status enum
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'listing_status') THEN
        CREATE TYPE listing_status AS ENUM (
            'draft',
            'pending',
            'active',
            'inactive',
            'expired',
            'sold'
        );
    END IF;

    -- Property type enum with expanded options
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'property_type') THEN
        CREATE TYPE property_type AS ENUM (
            'single_family',
            'multi_family',
            'condo',
            'townhouse',
            'land',
            'commercial',
            'industrial',
            'apartment',
            'mobile_home',
            'farm_ranch',
            'mixed_use'
        );
    END IF;

    -- Listing type enum
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'listing_type') THEN
        CREATE TYPE listing_type AS ENUM (
            'sale',
            'rent',
            'lease',
            'auction'
        );
    END IF;
END $$;

-- Create composite type for address components
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'address_components') THEN
        CREATE TYPE address_components AS (
            street_number VARCHAR(20),
            street_name VARCHAR(100),
            unit VARCHAR(20),
            city VARCHAR(100),
            state VARCHAR(2),
            zip VARCHAR(10),
            country VARCHAR(2)
        );
    END IF;
END $$;
