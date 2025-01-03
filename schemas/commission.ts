import { z } from 'zod';
import { CommissionType, CommissionVisibility, VerificationStatus } from '@/types/commission';

export const commissionSchema = z.object({
  id: z.string().uuid().optional(),
  listing_id: z.string().uuid(),
  type: z.enum(['percentage', 'flat'] as const),
  amount: z.number()
    .positive('Amount must be greater than 0')
    .refine(
      (val) => val <= 100,
      { message: 'Percentage must be between 0 and 100' }
    ),
  split_percentage: z.number()
    .min(0, 'Split percentage must be between 0 and 100')
    .max(100, 'Split percentage must be between 0 and 100')
    .optional(),
  terms: z.string().optional(),
  verification_required: z.boolean().default(true),
  visibility: z.enum(['private', 'public', 'verified_only'] as const).default('private'),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
  verified_at: z.string().datetime().optional(),
  verified_by: z.string().uuid().optional(),
});

export const commissionVerificationSchema = z.object({
  id: z.string().uuid().optional(),
  commission_id: z.string().uuid(),
  verified_by: z.string().uuid(),
  verification_type: z.string(),
  verification_data: z.record(z.unknown()).optional(),
  verified_at: z.string().datetime(),
  expires_at: z.string().datetime().optional(),
  status: z.enum(['pending', 'approved', 'rejected'] as const),
  notes: z.string().optional(),
}); 