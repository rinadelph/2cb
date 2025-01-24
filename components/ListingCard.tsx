'use client'

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { Listing } from '@/types/listing';
import { ListingStatusBadge } from '@/components/listing/ListingStatusBadge';
import { getSupabaseClient } from '@/lib/supabase-client';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ListingCardProps {
  listing: Listing;
  href?: string;
}

export function ListingCard({ listing, href }: ListingCardProps) {
  const [images, setImages] = useState<{ url: string }[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoadingImage, setIsLoadingImage] = useState(true);

  useEffect(() => {
    async function fetchImages() {
      if (!listing?.id) return;

      try {
        setIsLoadingImage(true);
        const supabase = getSupabaseClient();

        // List all files in the listing's folder
        const { data: files, error } = await supabase.storage
          .from('listing-images')
          .list(listing.id);

        if (error || !files?.length) {
          console.error('[ListingCard] Error fetching images:', error);
          setIsLoadingImage(false);
          return;
        }

        // Get public URLs for all images
        const imageUrls = await Promise.all(
          files.map(async (file) => {
            const { data: { publicUrl } } = supabase.storage
              .from('listing-images')
              .getPublicUrl(`${listing.id}/${file.name}`);
            return { url: publicUrl };
          })
        );

        setImages(imageUrls);
      } catch (error) {
        console.error('[ListingCard] Error processing images:', error);
      } finally {
        setIsLoadingImage(false);
      }
    }

    fetchImages();
  }, [listing?.id]);

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const previousImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <Link href={href || `/listings/${listing.id}`}>
      <Card className="group overflow-hidden transition-all hover:border-primary">
        <div className="relative aspect-video overflow-hidden">
          {isLoadingImage ? (
            <div className="h-full w-full bg-muted animate-pulse" />
          ) : images.length > 0 ? (
            <>
              <Image
                src={images[currentImageIndex].url}
                alt={listing.title}
                fill
                className="object-cover transition-transform group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              {images.length > 1 && (
                <>
                  <div className="absolute inset-y-0 left-0 flex items-center">
                    <Button
                      variant="outline"
                      size="icon"
                      className="ml-2 bg-white/80 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={previousImage}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="absolute inset-y-0 right-0 flex items-center">
                    <Button
                      variant="outline"
                      size="icon"
                      className="mr-2 bg-white/80 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={nextImage}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
                    {currentImageIndex + 1} / {images.length}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="h-full w-full bg-muted flex items-center justify-center">
              <span className="text-muted-foreground">No image</span>
            </div>
          )}
          <div className="absolute right-2 top-2">
            <ListingStatusBadge status={listing.status} />
          </div>
        </div>
        <CardContent className="grid gap-2 p-4">
          <div className="flex items-center justify-between gap-4">
            <h3 className="font-semibold line-clamp-1">{listing.title}</h3>
            <div className="text-right font-medium">
              {formatCurrency(listing.price)}
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            {typeof listing.address === 'string' 
              ? listing.address 
              : `${listing.address_street_number} ${listing.address_street_name}${listing.address_unit ? `, Unit ${listing.address_unit}` : ''}`
            }, {listing.city}, {listing.state} {listing.zip_code}
          </div>
          <div className="flex flex-wrap gap-2">
            {listing.property_type && (
              <Badge variant="secondary" className="capitalize">
                {listing.property_type.replace('_', ' ')}
              </Badge>
            )}
            {listing.listing_type && (
              <Badge variant="secondary" className="capitalize">
                For {listing.listing_type}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {listing.bedrooms && (
              <div>{listing.bedrooms} {listing.bedrooms === 1 ? 'bed' : 'beds'}</div>
            )}
            {listing.bathrooms && (
              <div>{listing.bathrooms} {listing.bathrooms === 1 ? 'bath' : 'baths'}</div>
            )}
            {listing.square_feet && (
              <div>{listing.square_feet.toLocaleString()} sqft</div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}