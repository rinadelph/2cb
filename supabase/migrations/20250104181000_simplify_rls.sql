-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert their own listings" ON listings;
DROP POLICY IF EXISTS "Users can view their own listings" ON listings;
DROP POLICY IF EXISTS "Users can update their own listings" ON listings;
DROP POLICY IF EXISTS "Users can delete their own listings" ON listings;

-- Simple insert policy
CREATE POLICY "Users can insert their own listings"
ON listings
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Simple select policy
CREATE POLICY "Users can view their own listings"
ON listings
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Simple update policy
CREATE POLICY "Users can update their own listings"
ON listings
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Simple delete policy
CREATE POLICY "Users can delete their own listings"
ON listings
FOR DELETE
TO authenticated
USING (auth.uid() = user_id); 