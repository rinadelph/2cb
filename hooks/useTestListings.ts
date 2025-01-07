import { useState } from 'react'
import { supabase } from '@/lib/supabase-client'
import { ListingBase } from '@/types/listing'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/lib/auth/auth-context'

// Update the image interface to match ListingBase
interface TestListingImage {
  id: string;
  url: string;
  width: number;
  height: number;
  size: number;
  type: string;
  is_featured: boolean;
  order: number;
  meta_data?: Record<string, unknown>;
}

interface TestListingData {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  status: 'draft' | 'pending' | 'active' | 'inactive' | 'expired' | 'sold';
  property_type: 'single_family' | 'multi_family' | 'condo' | 'townhouse' | 'land' | 'commercial' | 'industrial';
  listing_type: 'sale' | 'rent' | 'lease' | 'auction';
  price: number;
  address_street_number: string;
  address_street_name: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  location: {
    type: 'Point';
    coordinates: [number, number];
    lat: number;
    lng: number;
  };
  square_feet?: number;
  bedrooms?: number;
  bathrooms?: number;
  year_built?: number;
  lot_size?: number;
  parking_spaces?: number;
  stories?: number;
  features: Record<string, boolean>;
  amenities: Record<string, boolean>;
  images: TestListingImage[];
  documents: Array<{
    id: string;
    name: string;
    url: string;
    type: string;
    size: number;
    uploaded_at: string;
  }>;
  meta_data: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}

function transformTestListing(item: TestListingData, userId?: string): ListingBase {
  return {
    id: item.id,
    user_id: item.user_id || userId || '',
    title: item.title || 'Test Listing',
    description: item.description || 'This is a test listing',
    status: item.status || 'draft',
    property_type: item.property_type || 'single_family',
    listing_type: item.listing_type || 'sale',
    price: item.price || 100000,
    address_street_number: item.address_street_number || '123',
    address_street_name: item.address_street_name || 'Test St',
    city: item.city || 'Test City',
    state: item.state || 'TS',
    zip_code: item.zip_code || '12345',
    country: item.country || 'Test Country',
    location: item.location || {
      type: 'Point',
      coordinates: [0, 0],
      lat: 0,
      lng: 0
    },
    square_feet: item.square_feet || 2000,
    bedrooms: item.bedrooms || 3,
    bathrooms: item.bathrooms || 2,
    year_built: item.year_built || 2000,
    lot_size: item.lot_size || 5000,
    parking_spaces: item.parking_spaces || 2,
    stories: item.stories || 1,
    features: item.features || {},
    amenities: item.amenities || {},
    images: item.images.map(img => ({
      ...img,
      position: img.order
    })),
    documents: item.documents || [],
    meta_data: item.meta_data || {},
    created_at: item.created_at || new Date().toISOString(),
    updated_at: item.updated_at || new Date().toISOString()
  }
}

export function useTestListings() {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const { user } = useAuth()

  const getTestListings = async (): Promise<ListingBase[]> => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('test_listings')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      if (!data) return []

      return (data as unknown as TestListingData[]).map(item => transformTestListing(item, user?.id))
    } catch (error) {
      console.error('Error fetching test listings:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch test listings',
        variant: 'destructive'
      })
      return []
    } finally {
      setIsLoading(false)
    }
  }

  const createTestListing = async (): Promise<ListingBase> => {
    try {
      setIsLoading(true)
      const testListing: Omit<TestListingData, 'id'> = {
        user_id: user?.id || '',
        title: 'Test Listing',
        description: 'This is a test listing',
        status: 'draft',
        property_type: 'single_family',
        listing_type: 'sale',
        price: 100000,
        address_street_number: '123',
        address_street_name: 'Test St',
        city: 'Test City',
        state: 'TS',
        zip_code: '12345',
        country: 'Test Country',
        location: {
          type: 'Point',
          coordinates: [0, 0],
          lat: 0,
          lng: 0
        },
        square_feet: 2000,
        bedrooms: 3,
        bathrooms: 2,
        year_built: 2000,
        lot_size: 5000,
        parking_spaces: 2,
        stories: 1,
        features: {},
        amenities: {},
        images: [],
        documents: [],
        meta_data: {}
      }

      const { data, error } = await supabase
        .from('test_listings')
        .insert(testListing)
        .select()
        .single()

      if (error) {
        throw error
      }

      if (!data) {
        throw new Error('No data returned from insert')
      }

      return transformTestListing(data as unknown as TestListingData, user?.id)
    } catch (error) {
      console.error('Error creating test listing:', error)
      toast({
        title: 'Error',
        description: 'Failed to create test listing',
        variant: 'destructive'
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const deleteTestListing = async (id: string): Promise<void> => {
    try {
      setIsLoading(true)
      const { error } = await supabase
        .from('test_listings')
        .delete()
        .eq('id', id)

      if (error) {
        throw error
      }

      toast({
        title: 'Success',
        description: 'Test listing deleted successfully'
      })
    } catch (error) {
      console.error('Error deleting test listing:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete test listing',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return {
    isLoading,
    getTestListings,
    createTestListing,
    deleteTestListing
  }
} 