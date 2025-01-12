import { useState } from 'react';
import { useListings } from '@/hooks/useListings';
import { Layout } from '@/components/Layout';
import { ListingCard } from '@/components/ListingCard';
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuth } from '@/lib/auth/auth-context';

export default function ListingsPage() {
  const [showMyListings, setShowMyListings] = useState(false);
  const { listings, isLoading, error } = useListings();
  const { user } = useAuth();

  console.log('[ListingsPage] Current state:', {
    showMyListings,
    userLoggedIn: !!user,
    userId: user?.id,
    totalListings: listings?.length,
    listingsData: listings
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Listings</h1>
            <div className="flex gap-4">
              <Button disabled variant="secondary">Show My Listings</Button>
              <Button disabled>Create Listing</Button>
            </div>
          </div>
          <div className="text-center py-8">Loading listings...</div>
        </div>
      </Layout>
    );
  }

  if (error) {
    console.error('[ListingsPage] Error loading listings:', error);
    return (
      <Layout>
        <div className="text-center py-8 text-red-500">Error loading listings</div>
      </Layout>
    );
  }

  const filteredListings = showMyListings 
    ? listings.filter(listing => {
        console.log('[ListingsPage] Filtering listing:', {
          listingId: listing.id,
          listingUserId: listing.user_id,
          currentUserId: user?.id,
          isMatch: listing.user_id === user?.id
        });
        return listing.user_id === user?.id;
      })
    : listings;

  console.log('[ListingsPage] Filtered results:', {
    showMyListings,
    totalListings: listings.length,
    filteredCount: filteredListings.length,
    filteredListings
  });

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Listings</h1>
          <div className="flex gap-4">
            <Button
              onClick={() => {
                console.log('[ListingsPage] Toggling view:', {
                  current: showMyListings,
                  switching: !showMyListings
                });
                setShowMyListings(!showMyListings);
              }}
              variant={showMyListings ? "default" : "secondary"}
            >
              {showMyListings ? 'Show All Listings' : 'Show My Listings'}
            </Button>
            <Button asChild>
              <Link href="/listings/create">Create Listing</Link>
            </Button>
          </div>
        </div>

        {filteredListings.length === 0 ? (
          <div className="text-center py-8">
            No listings found
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map(listing => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
