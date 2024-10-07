import { useListings } from '../../hooks/useListings';
import ListingItem from '../../components/ListingItem';
import { Listing } from '../../types/listing';

export default function ListingsPage() {
  const { listings, isLoading, error } = useListings();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {(error as Error).message}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Listings</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings && listings.map((listing: Listing) => (
          <ListingItem key={listing.id} listing={listing} />
        ))}
      </div>
    </div>
  );
}