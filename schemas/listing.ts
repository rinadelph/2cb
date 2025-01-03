import { z } from 'zod';
import { ListingStatus, PropertyType, ListingType, CommissionType, CommissionStatus, CommissionVisibility } from '@/types/core';

// GeoJSON Point schema
const geoJSONPointSchema = z.object({
  type: z.literal('Point'),
  coordinates: z.tuple([
    z.number().min(-180).max(180), // longitude
    z.number().min(-90).max(90)    // latitude
  ])
});

const listingImageSchema = z.object({
  id: z.string().uuid(),
  url: z.string().url(),
  width: z.number().positive(),
  height: z.number().positive(),
  size: z.number().positive(),
  type: z.string(),
  is_featured: z.boolean(),
  order: z.number().nonnegative(),
  meta_data: z.record(z.unknown()).optional(),
});

const listingDocumentSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  url: z.string().url(),
  type: z.string(),
  size: z.number().positive(),
  meta_data: z.record(z.unknown()).optional(),
});

export const listingSchema = z.object({
  id: z.string().uuid().optional(),
  user_id: z.string().uuid(),
  organization_id: z.string().uuid().optional(),
  title: z.string().max(100),
  slug: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  status: z.enum(['draft', 'pending', 'active', 'inactive', 'expired', 'sold'] as const),
  property_type: z.enum(['single_family', 'multi_family', 'condo', 'townhouse', 'land', 'commercial', 'industrial'] as const),
  listing_type: z.enum(['sale', 'rent', 'lease', 'auction'] as const),
  price: z.number().min(0),

  // Address fields with proper validation
  address_street_number: z.coerce.string().max(20),  // Convert numbers to strings
  address_street_name: z.string().max(100),
  address_unit: z.string().max(20).optional(),
  city: z.string().max(100),
  state: z.string().length(2),
  zip_code: z.string().max(10),
  country: z.string().length(2).default('US'),

  // Location fields
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  location: z.object({
    type: z.literal('Point'),
    coordinates: z.tuple([
      z.number().min(-180).max(180), // longitude
      z.number().min(-90).max(90)    // latitude
    ]),
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180)
  }),

  // Property details
  square_feet: z.number().min(0).optional(),
  bedrooms: z.number().min(0).optional(),
  bathrooms: z.number().min(0).optional(),
  year_built: z.number().min(1800).max(new Date().getFullYear()).optional(),
  lot_size: z.number().min(0).optional(),
  parking_spaces: z.number().min(0).optional(),
  stories: z.number().min(0).optional(),

  // JSON fields
  features: z.record(z.boolean()).default({}),
  amenities: z.record(z.boolean()).default({}),
  images: z.array(listingImageSchema).default([]),
  documents: z.array(listingDocumentSchema).default([]),
  meta_data: z.record(z.unknown()).default({}),

  // Commission fields
  commission_amount: z.number().positive().optional(),
  commission_type: z.enum(['percentage', 'flat'] as const).optional(),
  commission_terms: z.string().optional(),
  commission_status: z.enum(['draft', 'pending', 'approved', 'rejected'] as const).default('draft'),
  commission_visibility: z.enum(['private', 'public', 'verified_only'] as const).default('private'),
  commission_signature_data: z.record(z.unknown()).optional(),
  commission_signed_at: z.string().datetime().optional(),
  commission_signed_by: z.string().uuid().optional(),
  commission_locked_at: z.string().datetime().optional(),
  commission_locked_by: z.string().uuid().optional(),

  // Timestamps
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
  published_at: z.string().datetime().optional(),
  expires_at: z.string().datetime().optional(),
});

export type ListingFormValues = z.infer<typeof listingSchema>; 