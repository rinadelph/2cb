export interface Listing {
  id: string;
  user_id: string;
  title: string;
  description: string;
  mls_number?: string;
  status: "draft" | "active" | "pending" | "sold" | "archived";
  address: string;
  city: string;
  state: string;
  zip_code: string;
  county: string;
  folio_number?: string;
  parcel_number?: string;
  legal_description?: string;
  property_type: "single_family" | "condo" | "townhouse" | "multi_family" | "land" | "commercial";
  year_built?: string;
  bedrooms: number;
  bathrooms_full: number;
  bathrooms_half: number;
  square_feet_living: number;
  square_feet_total: number;
  lot_size_sf: number;
  garage_spaces: number;
  carport_spaces: number;
  furnished: boolean;
  pool: boolean;
  waterfront: boolean;
  water_access: boolean;
  price: number;
  tax_amount?: number;
  tax_year?: string;
  maintenance_fee?: number;
  special_assessment: boolean;
  virtual_tour_url?: string;
  broker_remarks?: string;
  showing_instructions?: string;
  listing_office: string;
  listing_agent_name: string;
  listing_agent_phone: string;
  listing_agent_email: string;
  listing_agent_license: string;
  created_at: string;
  updated_at: string;
  listing_features?: {
    construction_type: string[];
    interior_features: string[];
    exterior_features: string[];
    parking_description: string[];
    lot_description: string[];
  };
  listing_images?: {
    url: string;
    position: number;
  }[];
}

export interface ListingFormData extends Omit<Listing, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'listing_features' | 'listing_images'> {
  construction_type: string[];
  interior_features: string[];
  exterior_features: string[];
  parking_description: string[];
  lot_description: string[];
  images: string[];
}

export interface ListingResponse {
  listing: ListingFormData | null;
  error: Error | null;
} 