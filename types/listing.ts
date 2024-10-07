export interface Listing {
  id: string;
  user_id: string;
  title: string;
  description: string;
  property_type: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  square_feet: number | null;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  latitude?: number;
  longitude?: number;
  location?: {
    type: string;
    coordinates: [number, number];
  }; // More specific type for the geography point
  status: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
  year_built: number | null;
}

export type CreateListingData = Omit<Listing, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'location'>;