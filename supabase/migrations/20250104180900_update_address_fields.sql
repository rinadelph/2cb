-- Alter address_street_number column to allow longer values
ALTER TABLE listings 
ALTER COLUMN address_street_number TYPE varchar(100);

-- Add comment explaining the change
COMMENT ON COLUMN listings.address_street_number IS 'Street number and any prefix/suffix, max 100 characters'; 