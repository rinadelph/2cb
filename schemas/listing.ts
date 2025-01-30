import { z } from 'zod';

// Add commission type enum
const CommissionType = z.enum(['percentage', 'fixed']);
const CommissionVisibility = z.enum(['public', 'private']);
const CommissionStatus = z.enum(['pending', 'approved', 'rejected']);

export const listingSchema = z.object({
  id: z.string().optional(),
  user_id: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  property_type: z.enum([
    "single_family",
    "multi_family",
    "condo",
    "townhouse",
    "land",
    "commercial"
  ]),
  listing_type: z.enum(["sale", "rent", "both"]),
  price: z.number().min(0),
  
  // Address fields
  address_street_number: z.string(),
  address_street_name: z.string(),
  address_unit: z.string().optional(),
  city: z.string(),
  state: z.string(),
  zip_code: z.string(),
  country: z.string().default('US'),
  
  // Property details
  square_feet: z.number().optional(),
  bedrooms: z.number().optional(),
  bathrooms: z.number().optional(),
  year_built: z.number().min(1800).max(new Date().getFullYear()).optional(),
  lot_size: z.number().optional(),
  parking_spaces: z.number().optional(),
  stories: z.number().optional(),
  
  // Location fields
  location: z.object({
    type: z.literal('Point'),
    coordinates: z.tuple([z.number(), z.number()]).default([0, 0]),
    lat: z.number().default(0),
    lng: z.number().default(0)
  }).default({
    type: 'Point',
    coordinates: [0, 0],
    lat: 0,
    lng: 0
  }),
  
  // Features and amenities
  features: z.record(z.boolean()).default({}),
  amenities: z.record(z.boolean()).default({}),
  
  // Media
  images: z.array(z.object({
    id: z.string(),
    url: z.string(),
    width: z.number(),
    height: z.number(),
    size: z.number(),
    type: z.string(),
    is_featured: z.boolean(),
    position: z.number()
  })).default([]),
  
  // Commission fields with proper validation
  commission_type: CommissionType.optional(),
  commission_amount: z.number()
    .min(0, "Commission amount must be positive")
    .optional()
    .transform(val => val === null ? undefined : val),
  commission_terms: z.string()
    .max(1000, "Commission terms cannot exceed 1000 characters")
    .optional(),
  commission_visibility: CommissionVisibility
    .default('private'),
  commission_status: CommissionStatus
    .default('pending'),
  
  // Optional fields
  meta_data: z.record(z.unknown()).default({})
});

// Export types
export type ListingFormValues = z.infer<typeof listingSchema>;
export type CommissionTypeValue = z.infer<typeof CommissionType>;
export type CommissionVisibilityValue = z.infer<typeof CommissionVisibility>;
export type CommissionStatusValue = z.infer<typeof CommissionStatus>; 