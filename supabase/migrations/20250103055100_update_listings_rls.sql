-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert their own listings" ON listings;
DROP POLICY IF EXISTS "Users can view their own listings" ON listings;
DROP POLICY IF EXISTS "Users can update their own listings" ON listings;
DROP POLICY IF EXISTS "Users can delete their own listings" ON listings;

-- Policy for inserting listings
CREATE POLICY "Users can insert their own listings"
ON listings
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id AND (
    -- Allow test listings only in non-production environments
    (meta_data->>'is_test')::boolean = true AND current_setting('app.environment', true) != 'production'
    OR
    -- Regular listings always allowed
    (meta_data->>'is_test') IS NULL OR (meta_data->>'is_test')::boolean = false
  )
);

-- Policy for selecting listings
CREATE POLICY "Users can view their own listings"
ON listings
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id OR
  -- Test listings are viewable by their creator
  ((meta_data->>'is_test')::boolean = true AND (meta_data->>'created_by')::uuid = auth.uid())
);

-- Policy for updating listings
CREATE POLICY "Users can update their own listings"
ON listings
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy for deleting listings
CREATE POLICY "Users can delete their own listings"
ON listings
FOR DELETE
TO authenticated
USING (auth.uid() = user_id); 