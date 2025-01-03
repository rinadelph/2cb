import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { Listing } from '@/types/listing';
import { useAuth } from '@/lib/auth/auth-context';

export function useListings(id?: string) {
  const queryClient = useQueryClient();
  const { user, isLoading: authLoading } = useAuth();

  const fetchListing = async (id: string): Promise<Listing | null> => {
    try {
      console.log('=== Starting fetchListing ===', { 
        id,
        userId: user?.id,
        isAuthenticated: !!user 
      });
      
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      console.log('=== Query Result ===', {
        success: !error,
        error,
        hasData: !!data,
        data: data ? {
          id: data.id,
          title: data.title,
          user_id: data.user_id,
          is_test: data.meta_data?.is_test,
          status: data.status
        } : null
      });

      if (error) {
        console.error('=== Query Error ===', error);
        return null;
      }

      if (!data) {
        console.log('=== No Listing Found ===');
        return null;
      }

      try {
        // Parse JSONB fields if needed
        let features = {};
        try {
          features = data.features ? 
            (typeof data.features === 'string' ? JSON.parse(data.features) : data.features) : 
            {};
          console.log('Parsed features:', features);
        } catch (err) {
          console.error('Error parsing features:', err);
        }
        
        let amenities = {};
        try {
          amenities = data.amenities ? 
            (typeof data.amenities === 'string' ? JSON.parse(data.amenities) : data.amenities) : 
            {};
          console.log('Parsed amenities:', amenities);
        } catch (err) {
          console.error('Error parsing amenities:', err);
        }
        
        let images = [];
        try {
          images = data.images ? 
            (typeof data.images === 'string' ? JSON.parse(data.images) : data.images) : 
            [];
          console.log('Parsed images:', images);
        } catch (err) {
          console.error('Error parsing images:', err);
        }

        const transformedListing = {
          ...data,
          features,
          amenities,
          images,
          address: {
            street_number: data.address_street_number || '',
            street_name: data.address_street_name || '',
            unit: data.address_unit,
            city: data.city || '',
            state: data.state || '',
            zip: data.zip_code || ''
          }
        };

        console.log('=== Transformed Listing ===', {
          id: transformedListing.id,
          title: transformedListing.title,
          status: transformedListing.status,
          address: transformedListing.address,
          featuresCount: Object.keys(transformedListing.features).length,
          amenitiesCount: Object.keys(transformedListing.amenities).length,
          imagesCount: transformedListing.images.length
        });

        return transformedListing as Listing;
      } catch (err) {
        console.error('=== Error Processing Listing ===', err);
        return null;
      }
    } catch (err) {
      console.error('=== Fatal Error in fetchListing ===', {
        error: err,
        id,
        userId: user?.id
      });
      return null;
    }
  };

  const fetchListings = async (): Promise<Listing[]> => {
    try {
      console.log('=== Starting fetchListings ===');
      
      if (!user) {
        console.log('=== No User ===');
        return [];
      }

      // Query for user's listings and org listings
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .or(`user_id.eq.${user.id}${user.user_metadata?.organization_id ? `,organization_id.eq.${user.user_metadata.organization_id}` : ''}`)
        .order('created_at', { ascending: false });

      // Simple logging
      console.log('=== Query Results ===', {
        success: !error,
        count: data?.length,
        userId: user.id,
        orgId: user.user_metadata?.organization_id
      });

      if (error) {
        console.error('=== Query Error ===', error);
        return [];
      }

      // Transform and return the data
      const listings = data.map(item => ({
        ...item,
        features: item.features ? 
          (typeof item.features === 'string' ? JSON.parse(item.features) : item.features) : 
          {},
        amenities: item.amenities ? 
          (typeof item.amenities === 'string' ? JSON.parse(item.amenities) : item.amenities) : 
          {},
        images: item.images ? 
          (typeof item.images === 'string' ? JSON.parse(item.images) : item.images) : 
          [],
        address: {
          street_number: item.address_street_number || '',
          street_name: item.address_street_name || '',
          unit: item.address_unit,
          city: item.city || '',
          state: item.state || '',
          zip: item.zip_code || ''
        }
      }));

      return listings as Listing[];
    } catch (error) {
      console.error('=== Error ===', error);
      return [];
    }
  };

  const createListing = async (listingData: Partial<Listing>): Promise<Listing> => {
    if (!user) throw new Error('User must be logged in to create a listing');

    // Extract address fields from the input data
    const { address, ...rest } = listingData;
    
    // Prepare the data for insertion
    const dataToInsert = {
      ...rest,
      user_id: user.id,
      // Flatten address fields
      address_street_number: address?.street_number,
      address_street_name: address?.street_name,
      address_unit: address?.unit,
      city: address?.city,
      state: address?.state,
      zip_code: address?.zip,
      meta_data: {
        ...rest.meta_data,
        is_test: false,
      }
    };

    const { data, error } = await supabase
      .from('listings')
      .insert([dataToInsert])
      .select(`
        id,
        user_id,
        organization_id,
        title,
        slug,
        description,
        status,
        property_type,
        listing_type,
        price,
        address_street_number,
        address_street_name,
        address_unit,
        city,
        state,
        zip_code,
        country,
        latitude,
        longitude,
        location,
        square_feet,
        bedrooms,
        bathrooms,
        year_built,
        lot_size,
        parking_spaces,
        stories,
        features,
        amenities,
        images,
        documents,
        meta_data,
        created_at,
        updated_at,
        published_at,
        expires_at
      `)
      .single();

    if (error) throw error;

    // Transform the data back to the UI format
    return {
      ...data,
      address: {
        street_number: data.address_street_number || '',
        street_name: data.address_street_name || '',
        unit: data.address_unit,
        city: data.city || '',
        state: data.state || '',
        zip: data.zip_code || ''
      }
    } as Listing;
  };

  const updateListing = async ({ id, address, ...updateData }: Partial<Listing> & { id: string }): Promise<Listing> => {
    if (!user) throw new Error('User must be logged in to update a listing');

    // Prepare the data for update
    const dataToUpdate = {
      ...updateData,
      // Flatten address fields if provided
      ...(address && {
        address_street_number: address.street_number,
        address_street_name: address.street_name,
        address_unit: address.unit,
        city: address.city,
        state: address.state,
        zip_code: address.zip
      })
    };

    const { data, error } = await supabase
      .from('listings')
      .update(dataToUpdate)
      .eq('id', id)
      .eq('user_id', user.id)
      .select(`
        id,
        user_id,
        organization_id,
        title,
        slug,
        description,
        status,
        property_type,
        listing_type,
        price,
        address_street_number,
        address_street_name,
        address_unit,
        city,
        state,
        zip_code,
        country,
        latitude,
        longitude,
        location,
        square_feet,
        bedrooms,
        bathrooms,
        year_built,
        lot_size,
        parking_spaces,
        stories,
        features,
        amenities,
        images,
        documents,
        meta_data,
        created_at,
        updated_at,
        published_at,
        expires_at
      `)
      .single();

    if (error) throw error;

    // Transform the data back to the UI format
    return {
      ...data,
      address: {
        street_number: data.address_street_number || '',
        street_name: data.address_street_name || '',
        unit: data.address_unit,
        city: data.city || '',
        state: data.state || '',
        zip: data.zip_code || ''
      }
    } as Listing;
  };

  const deleteListing = async (id: string): Promise<void> => {
    if (!user) throw new Error('User must be logged in to delete a listing');

    const { error } = await supabase
      .from('listings')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id); // Ensure user owns the listing

    if (error) throw error;
  };

  // Query for a single listing
  const { data: listing, isLoading, error } = useQuery<Listing | null>({
    queryKey: ['listing', id],
    queryFn: () => fetchListing(id!),
    enabled: !!id && !authLoading && !!user,
  });

  // Query for all listings
  const { data: listings, isLoading: listingsLoading, error: listingsError } = useQuery({
    queryKey: ['listings'],
    queryFn: fetchListings,
    enabled: !id && !authLoading && !!user,
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
    listings: listings || [],
    isLoading: authLoading || (id ? isLoading : listingsLoading),
    error: id ? error : listingsError,
    createListing: createMutation.mutate,
    updateListing: updateMutation.mutate,
    deleteListing: deleteMutation.mutate,
  };
}
