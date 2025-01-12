export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      listings: {
        Row: {
          id: string
          created_at: string
          title: string
          description: string
          status: 'draft' | 'pending' | 'active' | 'inactive' | 'expired' | 'sold'
          property_type: 'single_family' | 'multi_family' | 'condo' | 'townhouse' | 'land' | 'commercial' | 'industrial'
          listing_type: 'sale' | 'rent' | 'lease' | 'auction'
          price: number
          square_feet?: number
          bedrooms?: number
          bathrooms?: number
          year_built?: number
          lot_size?: number
          parking_spaces?: number
          stories?: number
          address_street_number: string
          address_street_name: string
          address_unit?: string
          city: string
          state: string
          zip_code: string
          country: string
          features: Json
          amenities: Json
          meta_data: Json
          commission_status: string
          commission_type?: string
          commission_amount?: number
          commission_split?: string
          commission_notes?: string
          commission_visibility?: string
          require_commission_verification: boolean
          user_id: string
          updated_at: string
        }
        Insert: {
          id?: string
          created_at?: string
          title: string
          description: string
          status: 'draft' | 'pending' | 'active' | 'inactive' | 'expired' | 'sold'
          property_type: 'single_family' | 'multi_family' | 'condo' | 'townhouse' | 'land' | 'commercial' | 'industrial'
          listing_type: 'sale' | 'rent' | 'lease' | 'auction'
          price: number
          square_feet?: number
          bedrooms?: number
          bathrooms?: number
          year_built?: number
          lot_size?: number
          parking_spaces?: number
          stories?: number
          address_street_number: string
          address_street_name: string
          address_unit?: string
          city: string
          state: string
          zip_code: string
          country: string
          features?: Json
          amenities?: Json
          meta_data?: Json
          commission_status?: string
          commission_type?: string
          commission_amount?: number
          commission_split?: string
          commission_notes?: string
          commission_visibility?: string
          require_commission_verification?: boolean
          user_id: string
          updated_at?: string
        }
        Update: {
          id?: string
          created_at?: string
          title?: string
          description?: string
          status?: 'draft' | 'pending' | 'active' | 'inactive' | 'expired' | 'sold'
          property_type?: 'single_family' | 'multi_family' | 'condo' | 'townhouse' | 'land' | 'commercial' | 'industrial'
          listing_type?: 'sale' | 'rent' | 'lease' | 'auction'
          price?: number
          square_feet?: number
          bedrooms?: number
          bathrooms?: number
          year_built?: number
          lot_size?: number
          parking_spaces?: number
          stories?: number
          address_street_number?: string
          address_street_name?: string
          address_unit?: string
          city?: string
          state?: string
          zip_code?: string
          country?: string
          features?: Json
          amenities?: Json
          meta_data?: Json
          commission_status?: string
          commission_type?: string
          commission_amount?: number
          commission_split?: string
          commission_notes?: string
          commission_visibility?: string
          require_commission_verification?: boolean
          user_id?: string
          updated_at?: string
        }
      }
      listing_images: {
        Row: {
          id: string
          listing_id: string
          image_path: string
          display_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          listing_id: string
          image_path: string
          display_order: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          listing_id?: string
          image_path?: string
          display_order?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      reorder_listing_images: {
        Args: {
          updates: {
            id: string
            display_order: number
          }[]
        }
        Returns: void
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
