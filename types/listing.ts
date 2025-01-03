import { ListingImage, ListingDocument } from './core';

export interface ListingBase {
  id?: string;
  user_id: string;
  organization_id?: string;
  title: string;
  slug?: string;
  description?: string;
  status: 'draft' | 'pending' | 'active' | 'inactive' | 'expired' | 'sold';
  property_type: 'single_family' | 'multi_family' | 'condo' | 'townhouse' | 'land' | 'commercial' | 'industrial';
  listing_type: 'sale' | 'rent' | 'lease' | 'auction';
  price: number;
  
  // Address fields (flat structure)
  address_street_number: string;
  address_street_name: string;
  address_unit?: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  
  // Location fields
  latitude?: number;
  longitude?: number;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
    lat: number;
    lng: number;
  };
  
  // Property details
  square_feet?: number;
  bedrooms?: number;
  bathrooms?: number;
  year_built?: number;
  lot_size?: number;
  parking_spaces?: number;
  stories?: number;
  
  // JSON fields
  features: Record<string, boolean>;
  amenities: Record<string, boolean>;
  images: ListingImage[];
  documents: ListingDocument[];
  meta_data: Record<string, unknown>;
  
  // Form helper (not in database)
  address?: {
    street_number: string;
    street_name: string;
    unit?: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  
  // Timestamps
  created_at?: string;
  updated_at?: string;
  published_at?: string;
  expires_at?: string;
}

// Export the full Listing type that includes commission fields
export interface Listing extends ListingBase {
  commission_amount?: number;
  commission_type?: string;
  commission_terms?: string;
  commission_status?: string;
  commission_visibility?: string;
  commission_signature_data?: Record<string, unknown>;
  commission_signed_at?: string;
  commission_signed_by?: string;
  commission_locked_at?: string;
  commission_locked_by?: string;
}
