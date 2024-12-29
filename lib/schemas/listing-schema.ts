import * as z from "zod";

export const listingSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  mls_number: z.string().optional(),
  status: z.enum(["draft", "active", "pending", "sold", "archived"]).default("draft"),
  
  // Location
  address: z.string().min(1, "Address is required"),
  address_unit: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zip_code: z.string().min(1, "ZIP code is required"),
  county: z.string().min(1, "County is required"),
  folio_number: z.string().optional(),
  parcel_number: z.string().optional(),
  legal_description: z.string().optional(),

  // Property Details
  property_type: z.enum([
    "single_family",
    "condo",
    "townhouse",
    "multi_family",
    "land",
    "commercial"
  ]),
  year_built: z.string().optional(),
  bedrooms: z.number().min(0).optional(),
  bathrooms_full: z.number().min(0).optional(),
  bathrooms_half: z.number().min(0).optional(),
  square_feet_living: z.number().min(0).optional(),
  square_feet_total: z.number().min(0).optional(),
  lot_size_sf: z.number().min(0).optional(),
  garage_spaces: z.number().min(0).optional(),
  carport_spaces: z.number().min(0).optional(),

  // Features
  furnished: z.boolean().default(false),
  pool: z.boolean().default(false),
  waterfront: z.boolean().default(false),
  water_access: z.boolean().default(false),
  construction_type: z.array(z.string()).default([]),
  interior_features: z.array(z.string()).default([]),
  exterior_features: z.array(z.string()).default([]),
  parking_description: z.array(z.string()).default([]),
  lot_description: z.array(z.string()).default([]),

  // Financial
  price: z.number().min(0, "Price is required"),
  tax_amount: z.number().min(0).optional(),
  tax_year: z.string().optional(),
  maintenance_fee: z.number().min(0).optional(),
  special_assessment: z.boolean().default(false),

  // Media
  images: z.array(z.string()).default([]),
  virtual_tour_url: z.string().url().optional(),

  // Agent Info
  broker_remarks: z.string().optional(),
  showing_instructions: z.string().optional(),
  listing_office: z.string().min(1, "Listing office is required"),
  listing_agent_name: z.string().min(1, "Agent name is required"),
  listing_agent_phone: z.string().min(1, "Agent phone is required"),
  listing_agent_email: z.string().email("Invalid email address"),
  listing_agent_license: z.string().min(1, "Agent license is required"),
});

export type ListingFormValues = z.infer<typeof listingSchema>;

export type ListingStatus = "draft" | "active" | "pending" | "sold" | "archived";
export type PropertyType = "single_family" | "condo" | "townhouse" | "multi_family" | "land" | "commercial"; 