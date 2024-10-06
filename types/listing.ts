export interface Listing {
  id: string;
  user_id: string;
  title: string;
  description: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  square_footage: number;
  property_type: string;
  front_exposure: string;
  hopa: boolean;
  for_lease: boolean;
  year_built: number;
  lot_size: number;
  created_at: string;
  updated_at: string;
}

export type CreateListingData = Omit<Listing, 'id' | 'user_id' | 'created_at' | 'updated_at'>;