-- Create a type for the image updates
CREATE TYPE image_update AS (
  id UUID,
  display_order INTEGER
);

-- Create the stored procedure for reordering images
CREATE OR REPLACE FUNCTION reorder_listing_images(image_updates image_update[])
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  update_record image_update;
BEGIN
  -- Verify that the user has permission to update these images
  IF NOT EXISTS (
    SELECT 1 FROM listing_images li
    JOIN listings l ON l.id = li.listing_id
    WHERE li.id = ANY(SELECT (u.id) FROM UNNEST(image_updates) u)
    AND l.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Update the display order for each image
  FOREACH update_record IN ARRAY image_updates
  LOOP
    UPDATE listing_images
    SET display_order = update_record.display_order,
        updated_at = NOW()
    WHERE id = update_record.id;
  END LOOP;
END;
$$; 