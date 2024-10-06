import { useRouter } from 'next/router';
import { Button } from '../../components/ui/Button';  // Updated import path
import { useAuth } from '../../hooks/useAuth';
import { getListing } from '../../lib/api/listings';
import { useState, useEffect } from 'react';
import { Listing } from '../../types/listing';

const ListingDetailPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const { id } = router.query;
  const [listing, setListing] = useState<Listing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id && typeof id === 'string') {
      fetchListing(id);
    }
  }, [id]);

  const fetchListing = async (listingId: string) => {
    try {
      const data = await getListing(listingId);
      setListing(data);
    } catch (err) {
      console.error('Error fetching listing:', err);
      setError('Failed to fetch listing');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!listing) return <div>Listing not found</div>;

  return (
    <div>
      <h1>{listing.title}</h1>
      <p>{listing.description}</p>
      <p>Price: ${listing.price}</p>
      <p>Bedrooms: {listing.bedrooms}</p>
      <p>Bathrooms: {listing.bathrooms}</p>
      <p>Square Footage: {listing.square_footage}</p>
      {/* Add more listing details as needed */}
      
      {user && listing.user_id === user.id && (
        <Button onClick={() => router.push(`/listings/edit/${id}`)}>
          Edit Listing
        </Button>
      )}
    </div>
  );
};

export default ListingDetailPage;