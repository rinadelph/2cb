import { useState } from 'react';
import { MapPin, ChevronLeft, ChevronRight, Expand, Bed, Bath, Square, Car, DollarSign, Droplets, Waves, Anchor, Sofa, ArrowLeft, Edit } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { formatCurrency } from '@/lib/utils';
import { Listing } from '@/types/listing';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';

interface ListingDetailProps {
  listing: Listing | null;
  error?: string;
}

export default function ListingDetail({ listing, error }: ListingDetailProps) {
  const router = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showCommissionModal, setShowCommissionModal] = useState(false);

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-red-600">{error}</h1>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold">Loading...</h1>
        </div>
      </div>
    );
  }

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "active":
        return "default";
      case "pending":
        return "secondary";
      case "sold":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Navigation and action buttons */}
        <div className="flex justify-between items-center">
          <Button
            variant="ghost"
            className="flex items-center gap-2"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Listings
          </Button>
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => router.push(`/listings/${listing.id}/edit`)}
          >
            <Edit className="h-4 w-4" />
            Edit Listing
          </Button>
        </div>

        {/* Header section */}
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-2">
              {listing.mls_number && <Badge variant="outline">{listing.mls_number}</Badge>}
              <Badge variant="outline">{listing.property_type.replace('_', ' ')}</Badge>
            </div>
            <h1 className="text-3xl font-bold">{listing.title}</h1>
            <p className="text-xl text-gray-600 flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              <span>
                {`${listing.address}, ${listing.city}, ${listing.state} ${listing.zip_code}`}
              </span>
            </p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={getStatusVariant(listing.status)}>
                {listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
              </Badge>
            </div>
          </div>
          <div className="text-right">
            <p className="text-4xl font-bold text-gray-900">{formatCurrency(listing.price)}</p>
            {listing.square_feet && (
              <p className="text-lg text-gray-600 mt-1">
                {formatCurrency(Math.round(listing.price / listing.square_feet))} / sqft
              </p>
            )}
          </div>
        </div>

        {/* Image carousel */}
        {listing.images && listing.images.length > 0 ? (
          <Card className="relative overflow-hidden group aspect-video">
            <img
              src={listing.images[currentImageIndex].url}
              alt={`Property image ${currentImageIndex + 1}`}
              className="w-full h-full object-cover"
            />
            {listing.images.length > 1 && (
              <div className="absolute inset-0 flex items-center justify-between p-4">
                <Button
                  variant="outline"
                  size="icon"
                  className="bg-white/80 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => setCurrentImageIndex((prev) => 
                    (prev - 1 + listing.images.length) % listing.images.length
                  )}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="bg-white/80 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => setCurrentImageIndex((prev) => 
                    (prev + 1) % listing.images.length
                  )}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
            <Button
              variant="outline"
              size="icon"
              className="absolute top-4 right-4 bg-white/80 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => setShowImageModal(true)}
            >
              <Expand className="h-4 w-4" />
            </Button>
          </Card>
        ) : (
          <Card className="relative overflow-hidden group aspect-video bg-gray-100 flex items-center justify-center">
            <div className="text-gray-500">No images available</div>
          </Card>
        )}

        {/* Key features */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-2">
            <Bed className="h-6 w-6" />
            <div>
              <p className="font-semibold">{listing.bedrooms} beds</p>
              <p className="text-sm text-gray-500">Bedrooms</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Bath className="h-6 w-6" />
            <div>
              <p className="font-semibold">{listing.bathrooms} baths</p>
              <p className="text-sm text-gray-500">Bathrooms</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Square className="h-6 w-6" />
            <div>
              <p className="font-semibold">{listing.square_feet?.toLocaleString()} sqft</p>
              <p className="text-sm text-gray-500">Living Area</p>
            </div>
          </div>
          {listing.parking && (
            <div className="flex items-center gap-2">
              <Car className="h-6 w-6" />
              <div>
                <p className="font-semibold">Parking</p>
                <p className="text-sm text-gray-500">{listing.parking}</p>
              </div>
            </div>
          )}
        </div>

        {/* Property badges */}
        <div className="flex flex-wrap gap-2">
          {listing.pool && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Droplets className="h-4 w-4" />
              Pool
            </Badge>
          )}
          {listing.waterfront && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Waves className="h-4 w-4" />
              Waterfront
            </Badge>
          )}
          {listing.amenities?.water_access && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Anchor className="h-4 w-4" />
              Water Access
            </Badge>
          )}
          {listing.amenities?.furnished && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Sofa className="h-4 w-4" />
              Furnished
            </Badge>
          )}
        </div>

        {/* Commission button */}
        {(listing.listing_agent_name || listing.listing_office) && (
          <div className="flex justify-center w-full">
            <Button 
              className="bg-blue-600 hover:bg-blue-700 text-white py-6 px-8 text-lg w-full max-w-md flex items-center justify-center gap-3"
              onClick={() => setShowCommissionModal(true)}
            >
              <DollarSign className="h-6 w-6" />
              View Commission Information
            </Button>
          </div>
        )}
      </div>

      {/* Modals */}
      <Dialog open={showImageModal} onOpenChange={setShowImageModal}>
        <DialogContent className="max-w-4xl">
          {listing.images && listing.images.length > 0 && (
            <div className="relative w-full h-full">
              <img
                src={listing.images[currentImageIndex].url}
                alt={`Full-screen property image ${currentImageIndex + 1}`}
                className="w-full h-full object-contain"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showCommissionModal} onOpenChange={setShowCommissionModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Commission Information</DialogTitle>
            <DialogDescription>Details for real estate professionals</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">Agent Information</h3>
              {listing.listing_agent_name && <p>{listing.listing_agent_name}</p>}
              {listing.listing_agent_license && <p>{listing.listing_agent_license}</p>}
              {listing.listing_agent_phone && <p>{listing.listing_agent_phone}</p>}
              {listing.listing_agent_email && <p>{listing.listing_agent_email}</p>}
              {listing.listing_office && <p>{listing.listing_office}</p>}
            </div>
            {listing.showing_instructions && (
              <div>
                <h3 className="font-semibold">Showing Instructions</h3>
                <p>{listing.showing_instructions}</p>
              </div>
            )}
            {listing.broker_remarks && (
              <div>
                <h3 className="font-semibold">Broker Remarks</h3>
                <p>{listing.broker_remarks}</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps<ListingDetailProps> = async (context) => {
  try {
    const { id } = context.params || {};
    
    if (!id) {
      return {
        props: {
          listing: null,
          error: 'Listing ID is required'
        }
      };
    }

    // Use absolute URL for API call
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const host = context.req.headers.host || 'localhost:3000';
    const response = await fetch(`${protocol}://${host}/api/listings/${id}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch listing');
    }

    const listing = await response.json();

    return {
      props: {
        listing,
      }
    };
  } catch (error) {
    console.error('Error in getServerSideProps:', error);
    return {
      props: {
        listing: null,
        error: error instanceof Error ? error.message : 'Failed to fetch listing'
      }
    };
  }
}