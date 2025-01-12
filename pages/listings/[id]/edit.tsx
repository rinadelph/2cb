"use client";

import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { useToast } from '@/components/ui/use-toast';
import { ListingForm } from '@/components/listing/ListingForm';
import { ListingFormValues } from '@/schemas/listing';
import { CommissionStructure } from '@/types/commission';
import { Layout } from '@/components/Layout';
import { getSupabaseClient } from '@/lib/supabase-client';
import { useListingImages } from '@/hooks/useListingImages';
import { Database } from '@/types/supabase';
import { SupabaseClient } from '@supabase/supabase-js';

type DbClient = SupabaseClient<Database>;

export default function EditListingPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const { toast } = useToast();
  const [listing, setListing] = useState<ListingFormValues | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [_isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  
  const listingImages = useListingImages(
    typeof id === 'string' ? { listingId: id } : null
  );

  useEffect(() => {
    async function fetchListing() {
      if (!id || !user) return;

      try {
        setIsLoading(true);
        const supabase = getSupabaseClient() as DbClient;
        const { data: rawData, error } = await supabase
          .from('listings')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        if (!rawData) throw new Error('Listing not found');

        // Check authorization
        if (rawData.user_id !== user.id) {
          setIsAuthorized(false);
          throw new Error('You do not have permission to edit this listing');
        }

        setIsAuthorized(true);
        const formData: ListingFormValues = {
          id: rawData.id,
          user_id: rawData.user_id,
          title: rawData.title,
          description: rawData.description,
          status: rawData.status as ListingFormValues['status'],
          property_type: rawData.property_type as ListingFormValues['property_type'],
          listing_type: rawData.listing_type as ListingFormValues['listing_type'],
          price: Number(rawData.price),
          square_feet: rawData.square_feet ? Number(rawData.square_feet) : undefined,
          bedrooms: rawData.bedrooms ? Number(rawData.bedrooms) : undefined,
          bathrooms: rawData.bathrooms ? Number(rawData.bathrooms) : undefined,
          year_built: rawData.year_built ? Number(rawData.year_built) : undefined,
          lot_size: rawData.lot_size ? Number(rawData.lot_size) : undefined,
          parking_spaces: rawData.parking_spaces ? Number(rawData.parking_spaces) : undefined,
          stories: rawData.stories ? Number(rawData.stories) : undefined,
          address_street_number: rawData.address_street_number,
          address_street_name: rawData.address_street_name,
          address_unit: rawData.address_unit,
          city: rawData.city,
          state: rawData.state,
          zip_code: rawData.zip_code,
          country: rawData.country || 'US',
          location: rawData.location || {
            type: 'Point',
            coordinates: [0, 0],
            lat: 0,
            lng: 0
          },
          features: rawData.features || {},
          amenities: rawData.amenities || {},
          images: listingImages.images.map(img => ({
            id: img.id,
            url: img.url,
            type: 'image/jpeg', // Default type
            height: 0, // These will be updated when images are loaded
            width: 0,
            size: 0,
            is_featured: false,
            position: img.display_order
          })),
          commission_amount: rawData.commission_amount ? Number(rawData.commission_amount) : undefined,
          commission_type: rawData.commission_type,
          commission_terms: rawData.commission_terms,
          commission_status: rawData.commission_status,
          commission_visibility: rawData.commission_visibility,
          meta_data: rawData.meta_data || {}
        };
        setListing(formData);
      } catch (err) {
        setError(err as Error);
        toast({
          title: 'Error',
          description: err instanceof Error ? err.message : 'Failed to fetch listing',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchListing();
  }, [id, user, toast, listingImages.images]);

  const handleSubmit = async (data: ListingFormValues) => {
    if (!id || !user) return;

    try {
      const supabase = getSupabaseClient() as DbClient;
      const { error } = await supabase
        .from('listings')
        .update(data)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Listing updated successfully'
      });

      router.push(`/listings/${id}`);
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to update listing',
        variant: 'destructive'
      });
    }
  };

  const handleCommissionSubmit = async (_data: CommissionStructure) => {
    // Commission submission logic here
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!listing) {
    return <div>Listing not found</div>;
  }

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6">Edit Listing</h1>
        <ListingForm
          initialData={listing}
          onSubmit={handleSubmit}
          onCommissionSubmit={handleCommissionSubmit}
          mode="edit"
        />
      </div>
    </Layout>
  );
}