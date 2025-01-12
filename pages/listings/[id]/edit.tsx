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
import { ImageGrid } from '@/components/listing/ImageGrid';
import { useListingImages } from '@/hooks/useListingImages';
import { Database } from '@/types/supabase';
import { SupabaseClient } from '@supabase/supabase-js';

type DbClient = SupabaseClient<Database>;
type ListingRow = Database['public']['Tables']['listings']['Row'];

export default function EditListingPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const { toast } = useToast();
  const [listing, setListing] = useState<ListingFormValues | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  
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
          toast({
            title: "Error",
            description: "You do not have permission to edit this listing",
            variant: "destructive",
          });
          router.push(`/listings/${id}`);
          return;
        }

        // Transform raw data to match ListingFormValues
        const data: ListingFormValues = {
          id: rawData.id,
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
          features: rawData.features as Record<string, boolean> || {},
          amenities: rawData.amenities as Record<string, boolean> || {},
          meta_data: rawData.meta_data as Record<string, unknown> || {},
          commission_status: rawData.commission_status as string || 'draft',
          commission_type: rawData.commission_type,
          commission_amount: rawData.commission_amount ? Number(rawData.commission_amount) : undefined,
          commission_split: rawData.commission_split,
          commission_notes: rawData.commission_notes,
          commission_visibility: rawData.commission_visibility,
          require_commission_verification: Boolean(rawData.require_commission_verification),
        };

        setIsAuthorized(true);
        setListing(data);
      } catch (error) {
        console.error('Error fetching listing:', error);
        setError(error instanceof Error ? error : new Error('Failed to fetch listing'));
      } finally {
        setIsLoading(false);
      }
    }

    fetchListing();
  }, [id, user, router, toast]);

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
        title: "Success",
        description: "Listing updated successfully",
      });

      router.push(`/listings/${id}`);
    } catch (error) {
      console.error('Error updating listing:', error);
      toast({
        title: "Error",
        description: "Failed to update listing",
        variant: "destructive",
      });
    }
  };

  const handleCommissionSubmit = async (data: CommissionStructure) => {
    // Commission submission logic here
  };

  const handleImageUpload = async () => {
    if (listingImages) {
      await listingImages.refreshImages();
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
            <p className="text-gray-600">{error.message}</p>
            <button 
              onClick={() => router.back()}
              className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
            >
              Go Back
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  if (!listing) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Not Found</h1>
            <p className="text-gray-600">Listing not found</p>
            <button 
              onClick={() => router.back()}
              className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
            >
              Go Back
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-8">Edit Listing</h1>
        <ListingForm
          initialData={listing}
          onSubmit={handleSubmit}
          onCommissionSubmit={handleCommissionSubmit}
          mode="edit"
          onImageUpload={handleImageUpload}
        />
      </div>
    </Layout>
  );
}