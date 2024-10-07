import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';
import { Listing, CreateListingData } from '../types/listing';
import { useAuth } from './useAuth';

const fetchAllListings = async (): Promise<Listing[]> => {
  console.log('Fetching all listings');
  const { data, error } = await supabase
    .from('listings')
    .select('*');
  if (error) throw new Error(`Failed to fetch listings: ${error.message}`);
  return data;
};

const fetchListing = async (id: string): Promise<Listing> => {
  console.log(`Fetching listing with id: ${id}`);
  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw new Error(`Failed to fetch listing: ${error.message}`);
  return data;
};

export function useListings(id?: string) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const createListing = async (listingData: Omit<Listing, 'id' | 'user_id' | 'created_at'>): Promise<Listing> => {
    console.log('Creating new listing');
    if (!user) throw new Error('You must be logged in to create a listing');
    const { data, error } = await supabase
      .from('listings')
      .insert({ ...listingData, user_id: user.id })
      .select();
    if (error) throw new Error(`Failed to create listing: ${error.message}`);
    return data;
  };

  const updateListing = async ({ id, ...listingData }: Partial<Listing> & { id: string }): Promise<Listing> => {
    console.log(`Updating listing with id: ${id}`, listingData);
    if (!user) throw new Error('You must be logged in to update a listing');
    const { data: existingListing, error: fetchError } = await supabase
      .from('listings')
      .select('user_id')
      .eq('id', id)
      .single();
    if (fetchError) throw new Error(`Failed to fetch existing listing: ${fetchError.message}`);
    if (existingListing && existingListing.user_id !== user.id) {
      throw new Error('You do not have permission to edit this listing');
    }
    const { data, error } = await supabase
      .from('listings')
      .update(listingData)
      .eq('id', id)
      .select();
    if (error) throw new Error(`Failed to update listing: ${error.message}`);
    console.log('Listing updated successfully:', data);
    return data;
  };

  const listingsQuery = useQuery({
    queryKey: ['listings'],
    queryFn: fetchAllListings,
    staleTime: 60000, // 1 minute
  });

  const listingQuery = useQuery({
    queryKey: ['listing', id],
    queryFn: () => fetchListing(id!),
    enabled: !!id,
    staleTime: 60000, // 1 minute
  });

  const createMutation = useMutation({
    mutationFn: createListing,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateListing,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['listing', data.id] });
      queryClient.invalidateQueries({ queryKey: ['listings'] });
    },
  });

  return {
    listing: listingQuery.data,
    listings: listingsQuery.data,
    isLoading: listingQuery.isLoading || listingsQuery.isLoading,
    error: listingQuery.error || listingsQuery.error,
    createListing: createMutation.mutateAsync,
    updateListing: updateMutation.mutateAsync,
  };
}