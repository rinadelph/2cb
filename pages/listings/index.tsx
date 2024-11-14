import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { Layout } from '@/components/Layout';
import { useListings } from '@/hooks/useListings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Search, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

const ListingsPage: NextPage = () => {
  const router = useRouter();
  const { listings, isLoading, error } = useListings();

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="text-center text-red-600">
          Error: {error instanceof Error ? error.message : 'Something went wrong'}
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Listings</h1>
            <p className="text-muted-foreground mt-1">
              Browse and search through available properties
            </p>
          </div>
          <div className="flex gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search listings..."
                className="pl-10 w-[300px]"
              />
            </div>
            <Button
              onClick={() => router.push('/listings/create')}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" /> New Listing
            </Button>
          </div>
        </div>

        {/* Listings Grid */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {listings && listings.length > 0 ? (
            listings.map((listing) => (
              <Card 
                key={listing.id}
                className="group hover:shadow-lg transition-shadow duration-200"
              >
                {listing.image_url && (
                  <div className="relative h-48 overflow-hidden rounded-t-lg">
                    <img
                      src={listing.image_url}
                      alt={listing.title}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-200"
                    />
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="line-clamp-1">{listing.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-primary">
                    ${listing.price.toLocaleString()}
                  </p>
                  <p className="text-muted-foreground line-clamp-2 mt-2">
                    {listing.description}
                  </p>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => router.push(`/listings/${listing.id}`)}
                  >
                    View Details
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => router.push(`/listings/manage`)}
                  >
                    Manage
                  </Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <div className="max-w-sm mx-auto">
                <h3 className="text-lg font-semibold mb-2">No listings found</h3>
                <p className="text-muted-foreground mb-4">
                  Get started by creating your first property listing
                </p>
                <Button onClick={() => router.push('/listings/create')}>
                  Create Listing
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </Layout>
  );
};

export default ListingsPage;
