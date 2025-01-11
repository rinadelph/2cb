import { ListingFormValues } from '@/schemas/listing';

export interface Address {
  street_number: string;
  street_name: string;
  unit?: string;
  city: string;
  state: string;
  zip: string;
}

export interface ListingImage {
  id?: string;
  url: string;
  position: number;
  is_featured?: boolean;
}

export interface ListingFeatures {
  construction_type?: string[];
  interior_features?: string[];
  exterior_features?: string[];
  parking_description?: string[];
  lot_description?: string[];
}

export interface ListingAmenities {
  pool?: boolean;
  waterfront?: boolean;
  water_access?: boolean;
  furnished?: boolean;
  [key: string]: boolean | undefined;
}

export interface ListingLocation {
  type: "Point";
  coordinates: [number, number];
  lat: number;
  lng: number;
}

export interface ListingFormBase {
  title: string;
  status: "draft" | "pending" | "active" | "inactive" | "expired" | "sold";
  description: string;
  property_type: "single_family" | "multi_family" | "condo" | "townhouse" | "land" | "commercial" | "industrial";
  price: number;
  bedrooms: number;
  bathrooms: number;
  square_feet: number;
  lot_size: number;
  year_built: number;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  location?: ListingLocation;
  listing_office: string;
  listing_agent_name: string;
  listing_agent_phone: string;
  listing_agent_email: string;
  listing_agent_license: string;
  showing_instructions?: string;
  broker_remarks?: string;
  mls_number: string;
  virtual_tour_url?: string;
  property_tax?: number;
  maintenance_fee?: number;
  construction_type?: string;
  interior_features?: string[];
  exterior_features?: string[];
  parking?: string;
  lot_features?: string[];
  view?: string;
  waterfront?: boolean;
  pool?: boolean;
  commission_amount?: string;
  commission_type?: string;
  commission_terms?: string;
  commission_status?: string;
  commission_visibility?: string;
}

export interface ListingBase extends ListingFormBase {
  id: string;
  user_id?: string;
  organization_id?: string;
  created_at: string;
  updated_at: string;
  location?: ListingLocation;
  features?: ListingFeatures;
  amenities?: ListingAmenities;
}

export interface Listing extends ListingBase {
  images: ListingImage[];
}
