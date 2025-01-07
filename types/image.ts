export interface ListingImage {
  id: string;
  url: string;
  width: number;
  height: number;
  size: number;
  type: string;
  is_featured: boolean;
  position: number;
  meta_data?: Record<string, unknown>;
}

export interface ListingDocument {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
} 
 