import { useRouter } from 'next/router';
import { useListings } from '../../../hooks/useListings';
import { useAuth } from '../../../hooks/useAuth';
import ListingForm from '../../../components/ListingForm';
import { useToast } from '@/components/ui/use-toast';
import { useEffect, useState } from 'react';

export default function EditListingPage() {
  const router = useRouter();
  const { id } = router.query;
  const { listing, isLoading, error } = useListings(id as string);
  const { user } = useAuth();
  const { toast } = useToast();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    console.log('EditListingPage useEffect - User ID:', user?.id);
    console.log('EditListingPage useEffect - Listing ID:', id);
    console.log('EditListingPage useEffect - Listing:', listing);

    if (listing && user) {
      console.log('Listing user_id:', listing.user_id);
      console.log('Current user_id:', user.id);
      
      if (listing.user_id !== user.id) {
        console.log('User not authorized to edit this listing');
        setIsAuthorized(false);
        toast({
          title: "Error",
          description: "You do not have permission to edit this listing",
          variant: "destructive",
        });
        router.push(`/listings/${id}`);
      } else {
        console.log('User authorized to edit this listing');
        setIsAuthorized(true);
      }
    } else {
      console.log('Listing or user not available yet');
    }
  }, [listing, user, id, router, toast]);

  if (isLoading) {
    console.log('EditListingPage - Loading');
    return <div>Loading...</div>;
  }
  if (error) {
    console.error('Error in EditListingPage:', error);
    return <div>Error: {error instanceof Error ? error.message : 'An unknown error occurred'}</div>;
  }
  if (!listing) {
    console.log('EditListingPage - Listing not found');
    return <div>Listing not found</div>;
  }
  if (isAuthorized === null) {
    console.log('EditListingPage - Checking authorization');
    return <div>Checking authorization...</div>;
  }
  if (isAuthorized === false) {
    console.log('EditListingPage - User not authorized, redirecting');
    return null; // This will prevent any flicker before redirect
  }

  const handleCancel = () => {
    router.push(`/listings/${id}`);
  };

  console.log('EditListingPage - Rendering form');
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Edit Listing</h1>
      <ListingForm 
        initialData={listing} 
        onCancel={handleCancel} 
      />
    </div>
  );
}