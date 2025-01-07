'use client'

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { Listing } from '@/types/listing';
import { ListingStatusBadge } from '@/components/listing/ListingStatusBadge';

interface ListingCardProps {
  listing: Listing;
  href?: string;
}

export function ListingCard({ listing, href }: ListingCardProps) {
  const featuredImage = listing.images?.find(img => img.is_featured) || listing.images?.[0];

  return (
    <Link href={href || `/listings/${listing.id}`}>
      <Card className="group overflow-hidden transition-all hover:border-primary">
        <div className="relative aspect-video overflow-hidden">
          {featuredImage ? (
            <Image
              src={featuredImage.url}
              alt={listing.title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="h-full w-full bg-muted" />
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
            {listing.address_street_number} {listing.address_street_name}
            {listing.address_unit && `, Unit ${listing.address_unit}`}
          </div>
          <div className="text-sm text-muted-foreground">
            {listing.city}, {listing.state} {listing.zip_code}
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