-- Create listings table
CREATE TABLE IF NOT EXISTS listings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    mls_number TEXT,
    status TEXT NOT NULL DEFAULT 'draft',
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    zip_code TEXT NOT NULL,
    county TEXT,
    folio_number TEXT,
    parcel_number TEXT,
    legal_description TEXT,
    property_type TEXT NOT NULL,
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
    price TEXT,
    tax_amount TEXT,
    tax_year TEXT,
    maintenance_fee TEXT,
    special_assessment BOOLEAN DEFAULT false,
    virtual_tour_url TEXT,
    broker_remarks TEXT,
    showing_instructions TEXT,
    listing_office TEXT,
    listing_agent_name TEXT,
    listing_agent_phone TEXT,
    listing_agent_email TEXT,
    listing_agent_license TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create listing_images table for storing image URLs
CREATE TABLE IF NOT EXISTS listing_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    position INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create listing_features table for storing feature arrays
CREATE TABLE IF NOT EXISTS listing_features (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
    construction_type TEXT[] DEFAULT '{}',
    interior_features TEXT[] DEFAULT '{}',
    exterior_features TEXT[] DEFAULT '{}',
    parking_description TEXT[] DEFAULT '{}',
    lot_description TEXT[] DEFAULT '{}'
);

-- Create RLS policies
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_features ENABLE ROW LEVEL SECURITY;

-- Policies for listings table
CREATE POLICY "Listings are viewable by everyone" ON listings
    FOR SELECT USING (true);

CREATE POLICY "Users can create their own listings" ON listings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own listings" ON listings
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own listings" ON listings
    FOR DELETE USING (auth.uid() = user_id);

-- Policies for listing_images table
CREATE POLICY "Images are viewable by everyone" ON listing_images
    FOR SELECT USING (true);

CREATE POLICY "Users can manage images for their listings" ON listing_images
    FOR ALL USING (
        auth.uid() IN (
            SELECT user_id FROM listings WHERE id = listing_images.listing_id
        )
    );

-- Policies for listing_features table
CREATE POLICY "Features are viewable by everyone" ON listing_features
    FOR SELECT USING (true);

CREATE POLICY "Users can manage features for their listings" ON listing_features
    FOR ALL USING (
        auth.uid() IN (
            SELECT user_id FROM listings WHERE id = listing_features.listing_id
        )
    );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updating timestamp
CREATE TRIGGER update_listings_updated_at
    BEFORE UPDATE ON listings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 