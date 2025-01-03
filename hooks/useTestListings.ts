import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase-client';
import { ListingBase } from '@/types/listing';
import { useAuth } from '@/lib/auth/auth-context';

export function useTestListings() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const fetchTestListings = async (): Promise<ListingBase[]> => {
    if (!user?.id) throw new Error('User must be logged in to fetch test listings');

    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('user_id', user.id)
      .eq('meta_data->is_test', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching test listings:', error);
      throw error;
    }

    return data || [];
  };

  const createTestListing = async (): Promise<ListingBase> => {
    if (!user?.id) throw new Error('User must be logged in to create a test listing');

    const response = await fetch('/api/listings/test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_id: user.id }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create test listing');
    }

    return response.json();
  };

  // Query for test listings
  const { data: testListings, isLoading, error } = useQuery({
    queryKey: ['testListings', user?.id],
    queryFn: fetchTestListings,
    enabled: !!user?.id,
  });

  // Mutation for creating test listings
  const createMutation = useMutation({
    mutationFn: createTestListing,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testListings'] });
    },
  });

  return {
    testListings: testListings || [],
    isLoading,
    error,
    createTestListing: createMutation.mutate,
  };
} 