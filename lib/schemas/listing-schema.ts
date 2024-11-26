import * as z from "zod";

export const listingSchema = z.object({
  // Basic Information
  title: z.string().min(5, "Title must be at least 5 characters").optional(),
  description: z.string().min(20, "Description must be at least 20 characters").optional(),
  mls_number: z.string().optional(),
  status: z.enum(['draft', 'active', 'pending', 'sold', 'archived']).optional(),

  // Location
  address_street: z.string().min(5, "Street address is required").optional(),
  address_unit: z.string().optional(),
  city: z.string().min(2, "City is required").optional(),
  state: z.string().length(2, "Please use 2-letter state code").optional(),
  zip_code: z.string().min(5, "ZIP code is required").optional(),
  county: z.string().min(2, "County is required").optional(),
  folio_number: z.string().optional(),
  parcel_number: z.string().optional(),
  legal_description: z.string().optional(),

  // Property Details
  property_type: z.enum([
    'single_family',
    'condo',
    'townhouse',
    'multi_family',
    'land',
    'commercial'
  ]).optional(),
  year_built: z.string().regex(/^\d+$/, "Must be a valid year").optional(),
  bedrooms: z.string().regex(/^\d+$/, "Must be a number").optional(),
  bathrooms_full: z.string().regex(/^\d+$/, "Must be a number").optional(),
  bathrooms_half: z.string().regex(/^\d+$/, "Must be a number").optional(),
  square_feet_living: z.string().regex(/^\d+$/, "Must be a number").optional(),
  square_feet_total: z.string().regex(/^\d+$/, "Must be a number").optional(),
  lot_size_sf: z.string().regex(/^\d+$/, "Must be a number").optional(),
  garage_spaces: z.string().regex(/^\d+$/, "Must be a number").optional(),
  carport_spaces: z.string().regex(/^\d+$/, "Must be a number").optional(),

  // Features
  furnished: z.boolean().default(false).optional(),
  pool: z.boolean().default(false).optional(),
  waterfront: z.boolean().default(false).optional(),
  water_access: z.boolean().default(false).optional(),
  construction_type: z.array(z.string()).optional(),
  interior_features: z.array(z.string()).optional(),
  exterior_features: z.array(z.string()).optional(),
  parking_description: z.array(z.string()).optional(),
  lot_description: z.array(z.string()).optional(),

  // Financial
  price: z.string().regex(/^\d+$/, "Price must be a number").optional(),
  tax_amount: z.string().regex(/^\d+$/, "Must be a number").optional(),
  tax_year: z.string().regex(/^\d+$/, "Must be a number").optional(),
  maintenance_fee: z.string().regex(/^\d+$/, "Must be a number").optional(),
  special_assessment: z.boolean().default(false).optional(),

  // Media & Marketing
  images: z.array(z.string()).min(1, "At least one image is required").optional(),
  virtual_tour_url: z.string().url().optional(),
  broker_remarks: z.string().optional(),
  showing_instructions: z.string().optional(),

  // Agent Information
  listing_office: z.string().min(2, "Listing office is required").optional(),
  listing_agent_name: z.string().min(2, "Agent name is required").optional(),
  listing_agent_phone: z.string().min(10, "Valid phone number required").optional(),
  listing_agent_email: z.string().email("Valid email required").optional(),
  listing_agent_license: z.string().min(2, "License number required").optional(),
}).partial();

export type ListingFormValues = z.infer<typeof listingSchema>; 