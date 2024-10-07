export interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  // Add the new image property
  image?: string;
  user_id: string;
  created_at: string;
}

export type CreateListingData = Omit<Listing, 'id' | 'user_id' | 'created_at' | 'updated_at'>;