-- Create listings table
CREATE TABLE listings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  mls_number TEXT,
  description TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  property_type TEXT NOT NULL,
  status TEXT DEFAULT 'draft',
  bedrooms INTEGER NOT NULL,
  bathrooms DECIMAL(3, 1) NOT NULL,
  address TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  user_id UUID REFERENCES auth.users(id)
);

-- Create enum for property types
CREATE TYPE property_type AS ENUM (
  'single_family_home',
  'condo',
  'townhouse',
  'multi_family',
  'land',
  'commercial'
);

-- Create enum for listing status
CREATE TYPE listing_status AS ENUM (
  'draft',
  'active',
  'pending',
  'sold',
  'withdrawn'
);

-- Modify columns to use enums
ALTER TABLE listings 
  ALTER COLUMN property_type TYPE property_type USING property_type::property_type,
  ALTER COLUMN status TYPE listing_status USING status::listing_status;

-- Enable Row Level Security
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read all listings
CREATE POLICY "Allow read access for all users" ON listings
  FOR SELECT USING (true);

-- Create policy to allow authenticated users to insert their own listings
CREATE POLICY "Allow insert for authenticated users only" ON listings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to update their own listings
CREATE POLICY "Allow update for users based on user_id" ON listings
  FOR UPDATE USING (auth.uid() = user_id);

-- Create policy to allow users to delete their own listings
CREATE POLICY "Allow delete for users based on user_id" ON listings
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to automatically update the updated_at column
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to call the update_modified_column function
CREATE TRIGGER update_listings_modtime
BEFORE UPDATE ON listings
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();