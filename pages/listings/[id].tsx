import type { NextPage } from 'next';
import React from 'react';
import { useRouter } from 'next/router';
import { Layout } from '@/components/Layout';
import { useListings } from '@/hooks/useListings';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { getSupabaseClient } from '@/lib/supabaseClient';
import { Listing } from '@/types/listing';

const fetchListing = async (id: string): Promise<Listing | null> => {
  try {
    const { data: listing, error } = await getSupabaseClient()
      .from('listings')
      .select('*')
      .eq('id', id)
      .is('meta_data->>is_test', false)
      .single();

    if (error) {
      console.error('Error fetching listing:', error);
      return null;
    }

    return listing as Listing;
  } catch (err) {
    console.error('Error:', err);
    return null;
  }
};

const ListingDetailPage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { listing, isLoading, error } = useListings(id as string);
  const { toast } = useToast();

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p>Loading listing...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !listing) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Error</h1>
            <p className="text-red-500">Failed to load listing</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">{listing.title}</h1>
              <p className="text-xl text-gray-600 mb-4">{formatCurrency(listing.price)}</p>
            </div>
            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => router.push(`/listings/${listing.id}/edit`)}
              >
                Edit Listing
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/listings')}
              >
                Back to Listings
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-semibold mb-4">Property Details</h2>
              <div className="space-y-2">
                <p><strong>Status:</strong> <span className="capitalize">{listing.status}</span></p>
                <p><strong>Property Type:</strong> <span className="capitalize">{listing.property_type.replace('_', ' ')}</span></p>
                <p><strong>Listing Type:</strong> <span className="capitalize">{listing.listing_type}</span></p>
                {listing.square_feet && <p><strong>Square Feet:</strong> {listing.square_feet.toLocaleString()}</p>}
                {listing.bedrooms && <p><strong>Bedrooms:</strong> {listing.bedrooms}</p>}
                {listing.bathrooms && <p><strong>Bathrooms:</strong> {listing.bathrooms}</p>}
                {listing.year_built && <p><strong>Year Built:</strong> {listing.year_built}</p>}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Location</h2>
              <div className="space-y-2">
                <p>
                  {listing.address_street_number} {listing.address_street_name}
                  {listing.address_unit && `, Unit ${listing.address_unit}`}
                </p>
                <p>
                  {listing.city}, {listing.state} {listing.zip_code}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Description</h2>
            <p className="whitespace-pre-wrap">{listing.description}</p>
          </div>

          {listing.features && Object.keys(listing.features).length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Features</h2>
              <ul className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(listing.features)
                  .filter(([_, enabled]) => enabled)
                  .map(([feature]) => (
                    <li key={feature} className="flex items-center">
                      <span className="capitalize">{feature.replace('_', ' ')}</span>
                    </li>
                  ))}
              </ul>
            </div>
          )}

          {listing.amenities && Object.keys(listing.amenities).length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Amenities</h2>
              <ul className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(listing.amenities)
                  .filter(([_, enabled]) => enabled)
                  .map(([amenity]) => (
                    <li key={amenity} className="flex items-center">
                      <span className="capitalize">{amenity.replace('_', ' ')}</span>
                    </li>
                  ))}
              </ul>
            </div>
          )}

          {listing.images.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Images</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {listing.images.map((image) => (
                  <div key={image.id} className="aspect-w-16 aspect-h-9">
                    <img
                      src={image.url}
                      alt={`Property image ${image.id}`}
                      className="object-cover rounded-lg"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ListingDetailPage;