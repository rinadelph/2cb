-- Add RLS policies for listings table

-- Policy for inserting listings (users can only insert their own listings)
CREATE POLICY "Users can insert their own listings"
ON listings
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy for selecting listings (users can view their own listings)
CREATE POLICY "Users can view their own listings"
ON listings
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy for updating listings (users can update their own listings)
CREATE POLICY "Users can update their own listings"
ON listings
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy for deleting listings (users can delete their own listings)
CREATE POLICY "Users can delete their own listings"
ON listings
FOR DELETE
TO authenticated
USING (auth.uid() = user_id); 