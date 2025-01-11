import { useRouter } from 'next/router';
import { useListings } from '../../../hooks/useListings';
import { useAuth } from '../../../hooks/useAuth';
import { ListingForm } from '@/components/listing/ListingForm';
import { useToast } from '@/components/ui/use-toast';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { CommissionStructure } from '@/types/commission';
import type { ListingFormValues } from '@/schemas/listing';

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

  const handleSubmit = async (data: ListingFormValues) => {
    if (!user?.id || !id) {
      toast({
        title: "Error",
        description: "You must be logged in to update a listing",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateListing({
        id: id as string,
        ...data,
      });

      toast({
        title: "Success",
        description: "Listing updated successfully",
      });

      router.push(`/listings/${id}`);
    } catch (error) {
      console.error('Error updating listing:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update listing",
        variant: "destructive",
      });
    }
  };

  const handleCommissionSubmit = async (data: CommissionStructure) => {
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
      console.error('Error updating commission structure:', error);
      toast({
        title: "Error",
        description: "Failed to update commission structure",
        variant: "destructive",
      });
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error instanceof Error ? error.message : 'An unknown error occurred'}</div>;
  if (!listing) return <div>Listing not found</div>;
  if (isAuthorized === null) return <div>Checking authorization...</div>;
  if (isAuthorized === false) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Edit Listing</h1>
        <Button variant="outline" onClick={() => router.push(`/listings/${id}`)}>Cancel</Button>
      </div>
      <ListingForm 
        initialData={listing}
        onSubmit={handleSubmit}
        onCommissionSubmit={handleCommissionSubmit}
        mode="edit"
      />
    </div>
  );
}