-- Create commission_structures table
CREATE TABLE IF NOT EXISTS commission_structures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('percentage', 'flat')),
  amount DECIMAL(12,2) NOT NULL,
  split_percentage DECIMAL(5,2),
  terms TEXT,
  verification_required BOOLEAN NOT NULL DEFAULT FALSE,
  visibility VARCHAR(20) NOT NULL DEFAULT 'private' CHECK (visibility IN ('private', 'public', 'verified_only')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create commission_verifications table
CREATE TABLE IF NOT EXISTS commission_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  commission_id UUID NOT NULL REFERENCES commission_structures(id) ON DELETE CASCADE,
  verified_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  verification_type VARCHAR(50) NOT NULL,
  verification_data JSONB DEFAULT '{}'::jsonb,
  verified_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  notes TEXT
);

-- Create commission_history table
CREATE TABLE IF NOT EXISTS commission_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  commission_id UUID NOT NULL REFERENCES commission_structures(id) ON DELETE CASCADE,
  changed_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  change_type VARCHAR(20) NOT NULL,
  old_data JSONB,
  new_data JSONB,
  notes TEXT
);

-- Create indexes
CREATE INDEX IF NOT EXISTS commission_listing_idx ON commission_structures(listing_id);
CREATE INDEX IF NOT EXISTS commission_verified_idx ON commission_structures(verified_at);
CREATE INDEX IF NOT EXISTS commission_history_time_idx ON commission_history(changed_at);
CREATE INDEX IF NOT EXISTS commission_verification_status_idx ON commission_verifications(status);

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_commission_structures_updated_at
  BEFORE UPDATE ON commission_structures
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column(); 