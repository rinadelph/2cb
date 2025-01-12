import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getSupabaseClient } from '@/lib/supabaseClient';
import { Listing } from '@/types/listing';
import { useAuth } from '@/lib/auth/auth-context';
import { useState } from 'react';

export const useListings = (showMyListings: boolean = false) => {
  const [listingItems, setListingItems] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  const fetchListings = async (): Promise<Listing[]> => {
    try {
      console.log('=== Starting fetchListings ===');
      
      if (!user) {
        console.log('=== No User ===');
        return [];
      }

      const supabase = getSupabaseClient();
      let query = supabase
        .from('listings')
        .select('*')
        .order('created_at', { ascending: false });

      // Only filter by user/org if showMyListings is true
      if (showMyListings) {
        query = query.or(`user_id.eq.${user.id}${user.user_metadata?.organization_id ? `,organization_id.eq.${user.user_metadata.organization_id}` : ''}`);
      }

      const { data, error } = await query;

      // Simple logging
      console.log('=== Query Results ===', {
        success: !error,
        count: data?.length,
        userId: user.id,
        orgId: user.user_metadata?.organization_id,
        showMyListings
      });

      if (error) {
        console.error('=== Query Error ===', error);
        return [];
      }

      // Transform and return the data
      const transformedListings = data.map(item => ({
        ...item,
        features: item.features ? 
          (typeof item.features === 'string' ? JSON.parse(item.features) : item.features) : 
          {},
        amenities: item.amenities ? 
          (typeof item.amenities === 'string' ? JSON.parse(item.amenities) : item.amenities) : 
          {},
        images: item.images ? 
          (typeof item.images === 'string' ? JSON.parse(item.images) : item.images) : 
          []
      }));

      return transformedListings as Listing[];
    } catch (error) {
      console.error('=== Error ===', error);
      return [];
    }
  };

  // Query for all listings
  const { data: listings, isLoading: listingsLoading, error: listingsError } = useQuery({
    queryKey: ['listings', showMyListings],
    queryFn: fetchListings,
    enabled: !!user,
  });

  return {
    listings: listings || [],
    isLoading: listingsLoading,
    error: listingsError,
  };
};
