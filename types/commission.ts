export type CommissionType = 'percentage' | 'flat';
export type CommissionVisibility = 'private' | 'public' | 'verified_only';
export type VerificationStatus = 'pending' | 'approved' | 'rejected';

export interface CommissionStructure {
  id: string;
  listing_id: string;
  type: CommissionType;
  amount: number;
  split_percentage?: number;
  terms?: string;
  verification_required: boolean;
  visibility: CommissionVisibility;
  created_at: string;
  updated_at: string;
  verified_at?: string;
  verified_by?: string;
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