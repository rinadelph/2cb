import { Layout } from '../../components/Layout';
import { ListingItem } from '../../components/ListingItem';
import { useListings } from '../../hooks/useListings';
import { Listing } from '../../types/listing';
import Link from 'next/link';
import { Button } from '../../components/ui/Button'; // Make sure this import is correct

export default function ListingsPage() {
  const { listings, isLoading, error } = useListings();

  if (isLoading) return <Layout><div>Loading...</div></Layout>;
  if (error) return <Layout><div>Error: {error.message}</div></Layout>;

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Listings</h1>
        <Link href="/listings/create" passHref legacyBehavior>
          <Button as="a">Create Listing</Button>
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {listings.map((listing: Listing) => (
          <ListingItem key={listing.id} listing={listing} />
        ))}
      </div>
    </Layout>
  );
}