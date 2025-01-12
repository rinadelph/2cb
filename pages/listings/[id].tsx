import { useState, useEffect } from 'react';
import { MapPin, ChevronLeft, ChevronRight, Expand, Bed, Bath, Square, Car, DollarSign, Droplets, Waves, Anchor, Sofa, ArrowLeft, Edit } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { formatCurrency } from '@/lib/utils';
import { Listing } from '@/types/listing';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { getSupabaseClient } from '@/lib/supabase-client';
import Image from 'next/image';
import { useAuth } from '@/lib/auth/auth-context';

interface ListingDetailProps {
  listing: Listing | null;
  error?: string;
}

export default function ListingDetail({ listing, error }: ListingDetailProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showCommissionModal, setShowCommissionModal] = useState(false);
  const [images, setImages] = useState<{ url: string }[]>([]);
  const [isLoadingImages, setIsLoadingImages] = useState(true);

  useEffect(() => {
    async function fetchImages() {
      if (!listing?.id) return;

      try {
        setIsLoadingImages(true);
        const supabase = getSupabaseClient();

        // List all files in the listing's folder
        const { data: files, error } = await supabase.storage
          .from('listing-images')
          .list(listing.id);

        if (error) {
          console.error('[ListingDetail] Error fetching images:', error);
          return;
        }

        console.log('[ListingDetail] Found images:', files);

        // Get public URLs for all images
        const imageUrls = await Promise.all(
          files.map(async (file) => {
            const { data: { publicUrl } } = supabase.storage
              .from('listing-images')
              .getPublicUrl(`${listing.id}/${file.name}`);
            return { url: publicUrl };
          })
        );

        console.log('[ListingDetail] Image URLs:', imageUrls);
        setImages(imageUrls);
      } catch (error) {
        console.error('[ListingDetail] Error processing images:', error);
      } finally {
        setIsLoadingImages(false);
      }
    }

    fetchImages();
  }, [listing?.id]);

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

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const previousImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
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
          {user && listing && user.id === listing.user_id && (
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => router.push(`/listings/${listing.id}/edit`)}
            >
              <Edit className="h-4 w-4" />
              Edit Listing
            </Button>
          )}
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
            <p className="text-4xl font-bold text-white">{formatCurrency(listing.price)}</p>
            {listing.square_feet && (
              <p className="text-lg text-gray-600 mt-1">
                {formatCurrency(Math.round(listing.price / listing.square_feet))} / sqft
              </p>
            )}
          </div>
        </div>

        {/* Image carousel */}
        {isLoadingImages ? (
          <Card className="relative overflow-hidden group aspect-video bg-gray-100 flex items-center justify-center">
            <div className="animate-pulse">Loading images...</div>
          </Card>
        ) : images.length > 0 ? (
          <Card className="relative overflow-hidden group aspect-video">
            <div className="relative w-full h-full">
              <Image
                src={images[currentImageIndex].url}
                alt={`Property image ${currentImageIndex + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
                priority={currentImageIndex === 0}
              />
            </div>
            {images.length > 1 && (
              <>
                <div className="absolute inset-y-0 left-0 flex items-center">
                  <Button
                    variant="outline"
                    size="icon"
                    className="ml-4 bg-white/80 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={previousImage}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                </div>
                <div className="absolute inset-y-0 right-0 flex items-center">
                  <Button
                    variant="outline"
                    size="icon"
                    className="mr-4 bg-white/80 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={nextImage}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </>
            )}
            <Button
              variant="outline"
              size="icon"
              className="absolute top-4 right-4 bg-white/80 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => setShowImageModal(true)}
            >
              <Expand className="h-4 w-4" />
            </Button>
            <div className="absolute bottom-4 right-4 bg-black/50 text-white px-2 py-1 rounded text-sm">
              {currentImageIndex + 1} / {images.length}
            </div>
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
          {images.length > 0 && (
            <div className="relative aspect-video">
              <Image
                src={images[currentImageIndex].url}
                alt={`Full-screen property image ${currentImageIndex + 1}`}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
              />
              {images.length > 1 && (
                <div className="absolute inset-0 flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="icon"
                    className="ml-4 bg-white/80 hover:bg-white"
                    onClick={previousImage}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="mr-4 bg-white/80 hover:bg-white"
                    onClick={nextImage}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
              <div className="absolute bottom-4 right-4 bg-black/50 text-white px-2 py-1 rounded text-sm">
                {currentImageIndex + 1} / {images.length}
              </div>
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