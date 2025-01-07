import { z } from 'zod';

export const listingSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  description: z.string(),
  status: z.enum(['draft', 'pending', 'active', 'inactive', 'expired', 'sold']),
  property_type: z.enum(['single_family', 'multi_family', 'condo', 'townhouse', 'land', 'commercial', 'industrial']),
  listing_type: z.enum(['sale', 'rent', 'lease', 'auction']),
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
    coordinates: z.tuple([z.number(), z.number()]),
    lat: z.number(),
    lng: z.number()
  }).optional(),
  
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
  
  // Commission fields
  commission_amount: z.number().optional(),
  commission_type: z.string().optional(),
  commission_terms: z.string().optional(),
  commission_status: z.string().optional(),
  commission_visibility: z.string().optional(),
  
  // Optional fields
  meta_data: z.record(z.unknown()).default({})
});

export type ListingFormValues = z.infer<typeof listingSchema>; 