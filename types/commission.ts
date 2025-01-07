export type CommissionType = 'percentage' | 'flat';
export type CommissionVisibility = 'private' | 'public' | 'verified_only';
export type VerificationStatus = 'pending' | 'approved' | 'rejected';

export interface CommissionStructure {
  amount: number;
  type: string;
  status: string;
  visibility: string;
  listing_id: string;
}

export interface CommissionVerification {
  id: string;
  commission_id: string;
  verified_by: string;
  verification_type: string;
  verification_data?: Record<string, unknown>;
  verified_at: string;
  expires_at?: string;
  status: VerificationStatus;
  notes?: string;
} 