export interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  bedrooms?: number | null;
  bathrooms?: number | null;
  image_url?: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export type CreateListingData = Omit<Listing, 'id' | 'user_id' | 'created_at' | 'updated_at'>;