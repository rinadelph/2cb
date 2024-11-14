export interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  user_id: string;
  created_at: string;
  updated_at: string;
  // Add other fields as needed
}

export interface CreateListingData {
  title: string;
  description: string;
  price: number;
  // Add other fields as needed
}
