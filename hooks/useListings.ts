import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';  // Change from '../lib/supabaseClient'
import { Listing, CreateListingData } from '../types/listing';
import { useAuth } from './useAuth';

export function useListings(id?: string) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const fetchListing = async (id: string): Promise<Listing> => {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  };

  const fetchListings = async (): Promise<Listing[]> => {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching listings:', error);
        throw new Error(error.message);
      }

      return data || [];
    } catch (error) {
      console.error('Error in fetchListings:', error);
      throw error;
    }
  };

  const createListing = async (listingData: CreateListingData): Promise<Listing> => {
    if (!user) throw new Error('User must be logged in to create a listing');

    const { data, error } = await supabase
      .from('listings')
      .insert([{ ...listingData, user_id: user.id }])
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const updateListing = async ({ id, ...updateData }: Partial<Listing> & { id: string }): Promise<Listing> => {
    if (!user) throw new Error('User must be logged in to update a listing');

    const { data, error } = await supabase
      .from('listings')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id) // Ensure user owns the listing
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const deleteListing = async (id: string): Promise<void> => {
    if (!user) throw new Error('User must be logged in to delete a listing');

    const { error } = await supabase
      .from('listings')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id) // Ensure user owns the listing;

    if (error) throw error;
  };

  // Query for a single listing
  const { data: listing, isLoading: singleLoading, error: singleError } = useQuery({
    queryKey: ['listing', id],
    queryFn: () => fetchListing(id!),
    enabled: !!id,
  });

  // Query for all listings
  const { data: listings, isLoading: listingsLoading, error: listingsError } = useQuery({
    queryKey: ['listings'],
    queryFn: fetchListings,
    enabled: !id,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: createListing,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateListing,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      queryClient.invalidateQueries({ queryKey: ['listing', data.id] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteListing,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
    },
  });

  return {
    listing,
    listings: listings || [], // Provide default empty array
    isLoading: id ? singleLoading : listingsLoading,
    error: id ? singleError : listingsError,
    createListing: createMutation.mutate,
    updateListing: updateMutation.mutate,
    deleteListing: deleteMutation.mutate,
  };
}
