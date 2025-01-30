"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Listing } from "@/types/listing";
import { formatPrice } from "@/lib/utils";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { BedDouble, Bath, Square, MapPin } from "lucide-react";

interface MapListingCardProps {
  listing: Listing;
  isActive?: boolean;
  onClick?: () => void;
}

export function MapListingCard({ listing, isActive, onClick }: MapListingCardProps) {
  const featuredImage = listing.images?.find(img => img.is_featured) || listing.images?.[0];
  
  // Format address
  const address = [
    listing.address_street_number,
    listing.address_street_name,
    listing.address_unit && `Unit ${listing.address_unit}`,
    listing.city,
    listing.state,
    listing.zip_code
  ].filter(Boolean).join(' ');

  return (
    <Card 
      className={`overflow-hidden cursor-pointer bg-card transition-all ${
        isActive ? 'ring-2 ring-primary' : 'hover:border-primary'
      }`}
      onClick={onClick}
    >
      <div className="flex gap-3 p-3">
        {/* Image */}
        <div className="relative w-24 h-24 flex-shrink-0 rounded-md overflow-hidden bg-muted">
          {featuredImage ? (
            <Image
              src={featuredImage.url}
              alt={listing.title}
              fill
              className="object-cover"
              sizes="96px"
            />
          ) : (
            <div className="w-full h-full bg-muted" />
          )}
          <Badge 
            variant={listing.status === 'active' ? 'default' : 'secondary'}
            className="absolute right-1 top-1 text-xs bg-background/80 backdrop-blur-sm"
          >
            {listing.status}
          </Badge>
        </div>

        {/* Content */}
        <CardContent className="p-0 flex-1">
          <div className="space-y-1.5">
            <h3 className="font-semibold line-clamp-1 text-sm">{listing.title}</h3>
            <p className="text-base font-bold text-primary">
              {formatPrice(listing.price)}
            </p>
            {address && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span className="line-clamp-1">{address}</span>
              </p>
            )}
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {listing.bedrooms && (
                <span className="flex items-center gap-1">
                  <BedDouble className="h-3 w-3" />
                  {listing.bedrooms}
                </span>
              )}
              {listing.bathrooms && (
                <span className="flex items-center gap-1">
                  <Bath className="h-3 w-3" />
                  {listing.bathrooms}
                </span>
              )}
              {listing.square_feet && (
                <span className="flex items-center gap-1">
                  <Square className="h-3 w-3" />
                  {listing.square_feet.toLocaleString()}
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
} 