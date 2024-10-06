import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { Button } from '@/components/ui/button';
import { Layout } from '@/components/Layout';
import { useListings } from '@/hooks/useListings';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';

const ManageListingsPage: NextPage = () => {
  const router = useRouter();
  const { listings, isLoading, error } = useListings();

  if (isLoading) return <Layout><div>Loading...</div></Layout>;
  if (error) return <Layout><div>Error: {error.message}</div></Layout>;

  const handleEdit = (listingId: string) => {
    router.push(`/listings/edit/${listingId}`);
  };

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Manage Listings</h1>
        <Button onClick={() => router.push('/listings/create')}>
          Create New Listing
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings.map((listing) => (
          <Card key={listing.id}>
            <CardHeader>
              <CardTitle className="text-xl font-semibold">{listing.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">{listing.description.substring(0, 100)}...</p>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => handleEdit(listing.id)}>
                Edit
              </Button>
              <Button variant="destructive" onClick={() => handleDeleteListing(listing.id)}>
                Delete
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </Layout>
  );
};

export default ManageListingsPage;