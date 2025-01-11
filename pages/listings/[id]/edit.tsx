"use client";

import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { useToast } from '@/components/ui/use-toast';
import { ListingForm } from '@/components/listing/ListingForm';
import { ListingFormValues } from '@/schemas/listing';
import { CommissionStructure } from '@/types/commission';
import { useListings } from '@/hooks/useListings';
import { Layout } from '@/components/Layout';

export default function EditListingPage() {
  const router = useRouter();
  const { id } = router.query;
  const { listing, isLoading, error, updateListing } = useListings(id as string);
  const { user } = useAuth();
  const { toast } = useToast();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    if (listing && user) {
      if (listing.user_id !== user.id) {
        setIsAuthorized(false);
        toast({
          title: "Error",
          description: "You do not have permission to edit this listing",
          variant: "destructive",
        });
        router.push(`/listings/${id}`);
      } else {
        setIsAuthorized(true);
      }
    }
  }, [listing, user, id, router, toast]);

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
      await updateListing({
        id: id as string,
        ...formData,
      });

      toast({
        title: 'Success',
        description: 'Listing updated successfully',
      });

      router.push(`/listings/${id}`);
    } catch (error) {
      console.error('[EditListingPage] Error updating listing:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update listing',
        variant: 'destructive',
      });
    }
  };

  const handleCommissionSubmit = async (data: CommissionStructure): Promise<void> => {
    try {
      const response = await fetch('/api/commissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...data, listing_id: id }),
      });

      if (!response.ok) {
        throw new Error('Failed to update commission structure');
      }

      toast({
        title: "Success",
        description: "Commission structure updated successfully",
      });
    } catch (error) {
      console.error('[EditListingPage] Error updating commission structure:', error);
      toast({
        title: "Error",
        description: "Failed to update commission structure",
        variant: "destructive",
      });
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
            <p className="text-gray-600">{error instanceof Error ? error.message : 'An unknown error occurred'}</p>
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

  if (isAuthorized === null) {
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

  if (isAuthorized === false) return null;

  return (
    <Layout>
      <div className="container max-w-5xl py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Edit Listing</h1>
          <button 
            onClick={() => router.push(`/listings/${id}`)}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            Cancel
          </button>
        </div>
        <ListingForm
          key={listing.id}
          initialData={listing}
          onSubmit={handleSubmit}
          onCommissionSubmit={handleCommissionSubmit}
          mode="edit"
        />
      </div>
    </Layout>
  );
}