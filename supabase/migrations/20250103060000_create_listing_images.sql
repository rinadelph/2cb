-- Create listing_images table
CREATE TABLE IF NOT EXISTS listing_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  image_path TEXT NOT NULL,
  display_order INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_listing_images_listing_id ON listing_images(listing_id);
CREATE INDEX idx_listing_images_display_order ON listing_images(display_order);

-- Enable RLS
ALTER TABLE listing_images ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to manage their listing images
CREATE POLICY "Users can manage their listing images"
ON listing_images
FOR ALL
TO authenticated
USING (
  listing_id IN (
    SELECT id FROM listings 
    WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  listing_id IN (
    SELECT id FROM listings 
    WHERE user_id = auth.uid()
  )
);

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_listing_images_updated_at
  BEFORE UPDATE ON listing_images
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column(); 