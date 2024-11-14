import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { Layout } from '@/components/Layout';
import { useListings } from '@/hooks/useListings';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Plus, Pencil, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const ManageListingsPage: NextPage = () => {
  const router = useRouter();
  const { listings, isLoading, error, deleteListing } = useListings();

  const handleDelete = async (listingId: string) => {
    try {
      await deleteListing(listingId);
    } catch (error) {
      console.error('Error deleting listing:', error);
    }
  };

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
        <div className="text-center text-destructive">
          Error: {error instanceof Error ? error.message : 'Something went wrong'}
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Manage Listings</h1>
            <p className="text-muted-foreground mt-1">
              Create, edit, and manage your property listings
            </p>
          </div>
          <Button
            onClick={() => router.push('/listings/create')}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" /> New Listing
          </Button>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {listings && listings.length > 0 ? (
            listings.map((listing) => (
              <Card key={listing.id} className="flex flex-col">
                <CardHeader>
                  <CardTitle className="line-clamp-1">{listing.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-2xl font-bold text-primary">
                    ${listing.price.toLocaleString()}
                  </p>
                  <p className="text-muted-foreground line-clamp-2 mt-2">
                    {listing.description}
                  </p>
                </CardContent>
                <CardFooter className="flex justify-between gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 flex items-center gap-2"
                    onClick={() => router.push(`/listings/edit/${listing.id}`)}
                  >
                    <Pencil className="h-4 w-4" /> Edit
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        className="flex-1 flex items-center gap-2"
                      >
                        <Trash2 className="h-4 w-4" /> Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the
                          listing and remove it from our servers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(listing.id)}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <div className="max-w-sm mx-auto">
                <h3 className="text-lg font-semibold mb-2">No listings yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first listing to get started
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

export default ManageListingsPage;
