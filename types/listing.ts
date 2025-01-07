import { ListingFormValues } from '@/schemas/listing';

export interface ListingBase extends ListingFormValues {
  id: string;
  user_id?: string;
  organization_id?: string;
  created_at?: string;
  updated_at?: string;
  location: {
    type: 'Point';
    coordinates: [number, number];
    lat: number;
    lng: number;
  };
  features: Record<string, boolean>;
  amenities: Record<string, boolean>;
  images: Array<{
    id: string;
    url: string;
    width: number;
    height: number;
    size: number;
    type: string;
    is_featured: boolean;
    position: number;
  }>;
  documents: Array<{
    id: string;
    name: string;
    url: string;
    type: string;
    size: number;
  }>;
  meta_data: Record<string, unknown>;
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
