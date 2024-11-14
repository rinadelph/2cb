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
          price: number
          user_id: string
          image_url?: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          created_at?: string
          title: string
          description: string
          price: number
          user_id: string
          image_url?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          created_at?: string
          title?: string
          description?: string
          price?: number
          user_id?: string
          image_url?: string | null
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
