export interface ListingImage {
  id?: string;
  url: string;
  position: number;
  is_featured?: boolean;
}

export interface ListingFeatures {
  construction_type: string[];
  interior_features: string[];
  exterior_features: string[];
  parking_description: string[];
  lot_description: string[];
}

export interface ListingAddress {
  street_number: string;
  street_name: string;
  unit?: string;
  city: string;
  state: string;
  zip: string;
}

export interface ListingAmenities {
  pool?: boolean;
  waterfront?: boolean;
  water_access?: boolean;
  furnished?: boolean;
  [key: string]: boolean | undefined;
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  status: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  bedrooms: number;
  bathrooms: number;
  square_feet: number;
  lot_size: number;
  year_built: number;
  property_type: string;
  listing_office: string;
  listing_agent_name: string;
  listing_agent_phone: string;
  listing_agent_email: string;
  listing_agent_license: string;
  showing_instructions?: string;
  broker_remarks?: string;
  mls_number: string;
  images: ListingImage[];
  virtual_tour_url?: string;
  amenities?: ListingAmenities;
  features?: ListingFeatures;
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
  created_at: string;
  updated_at: string;
}

export interface ListingFormData extends Omit<Listing, 'id' | 'created_at' | 'updated_at' | 'images'> {
  images?: File[];
}

export interface ListingResponse {
  listing: ListingFormData | null;
  error: Error | null;
}

export interface ListingFormValues extends Omit<Listing, 'id' | 'created_at' | 'updated_at'> {
  status: Listing['status'];
} 