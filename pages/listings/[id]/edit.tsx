"use client";

import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { useToast } from '@/components/ui/use-toast';
import { ListingForm } from '@/components/listing/ListingForm';
import { ListingFormValues } from '@/schemas/listing';
import { CommissionStructure } from '@/types/commission';
import { getListing } from '@/lib/api/listings';
import { toFormValues, toDatabaseModel, toCommissionModel } from '@/lib/transformers/listing';
import { updateListing } from '@/lib/api/listings';

export default function EditListingPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const { toast } = useToast();
  const [initialData, setInitialData] = useState<ListingFormValues | undefined>();
  const [initialCommission, setInitialCommission] = useState<Partial<CommissionStructure> | undefined>();

  useEffect(() => {
    const loadListing = async () => {
      if (!id || !user?.id) return;

      try {
        const listing = await getListing(id as string);
        if (!listing) throw new Error('Listing not found');

        // Transform database model to form values and ensure user_id is set
        const formValues = {
          ...toFormValues(listing),
          user_id: user.id // Ensure user_id is set
        };
        
        setInitialData(formValues as ListingFormValues);
        if (listing.id) {
          setInitialCommission(toCommissionModel(formValues as ListingFormValues, listing.id));
        }
      } catch (error) {
        console.error('Error loading listing:', error);
        toast({
          title: 'Error',
          description: 'Failed to load listing',
          variant: 'destructive',
        });
      }
    };

    loadListing();
  }, [id, user?.id, toast]);

  const handleSubmit = async (formData: ListingFormValues): Promise<void> => {
    if (!user?.id || !id) {
      toast({
        title: 'Error',
        description: 'You must be logged in to update a listing',
        variant: 'destructive'
      });
      return;
    }

    try {
      // Ensure user_id is set in form data
      const dataWithUserId = {
        ...formData,
        user_id: user.id
      };

      // Transform form data to database model
      const dbData = toDatabaseModel(dataWithUserId, user.id);
      
      // Update the listing
      const updatedListing = await updateListing(id as string, dbData);

      toast({
        title: 'Success',
        description: 'Listing updated successfully',
      });

      router.push(`/listings/${updatedListing.id}`);
    } catch (error) {
      console.error('Error updating listing:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update listing',
        variant: 'destructive',
      });
    }
  };

  const handleCommissionSubmit = async (data: CommissionStructure): Promise<void> => {
    try {
      // Handle commission submission
      console.log('Commission submitted:', data);
    } catch (error) {
      console.error('Error submitting commission:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit commission',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container max-w-5xl py-8">
      <h1 className="mb-8 text-3xl font-bold">Edit Listing</h1>
      {!initialData ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <ListingForm
          initialData={initialData}
          initialCommission={initialCommission}
          onCommissionSubmit={handleCommissionSubmit}
          onSubmit={handleSubmit}
          mode="edit"
        />
      )}
    </div>
  );
}