import * as z from "zod";

export const commissionSchema = z.object({
  type: z.enum(["percentage", "flat"]),
  amount: z.number().min(0, "Amount is required"),
  split_percentage: z.number().min(0).max(100).optional(),
  terms: z.string().optional(),
  verification_required: z.boolean().default(false),
  visibility: z.enum(["private", "public", "verified_only"]).default("private"),
});

export type CommissionFormValues = z.infer<typeof commissionSchema>;
export type CommissionType = "percentage" | "flat";
export type CommissionVisibility = "private" | "public" | "verified_only";

export const commissionVerificationSchema = z.object({
  verification_type: z.string().min(1, "Verification type is required"),
  verification_data: z.record(z.unknown()).optional(),
  expires_at: z.string().datetime().optional(),
  notes: z.string().optional(),
});

export type CommissionVerificationFormValues = z.infer<typeof commissionVerificationSchema>;
export type VerificationStatus = "pending" | "approved" | "rejected"; 