import { useRouter } from 'next/router';
import { useListings } from '../../hooks/useListings';
import { Button } from '../../components/ui/button';

export default function ListingPage() {
  const router = useRouter();
  const { id } = router.query;
  const { listing, isLoading, error } = useListings(id as string);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {(error as Error).message}</div>;
  if (!listing) return <div>Listing not found</div>;

  const handleEdit = () => {
    router.push(`/listings/edit/${id}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">{listing.title}</h1>
      <p className="text-gray-600 mb-4">{listing.description}</p>
      <p className="text-xl font-semibold mb-4">Price: ${listing.price}</p>
      <p className="mb-2">Bedrooms: {listing.bedrooms ?? 'Not specified'}</p>
      <p className="mb-2">Bathrooms: {listing.bathrooms ?? 'Not specified'}</p>
      {listing.image_url && (
        <img src={listing.image_url} alt={listing.title} className="w-full max-w-2xl mb-4 rounded" />
      )}
      <Button onClick={handleEdit}>Edit Listing</Button>
    </div>
  );
}