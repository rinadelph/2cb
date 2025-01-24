import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Listing } from "@/types/listing";
import { formatPrice } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { BedDouble, Bath, Square, Building2 } from "lucide-react";

interface ListingCardProps {
  listing: Listing;
}

export function ListingCard({ listing }: ListingCardProps) {
  const featuredImage = listing.images?.find(img => img.is_featured) || listing.images?.[0];

  return (
    <Link href={`/listings/${listing.id}`}>
      <Card className="group h-full overflow-hidden transition-all hover:border-primary bg-card">
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          {featuredImage ? (
            <Image
              src={featuredImage.url}
              alt={listing.title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-accent">
              <Building2 className="h-12 w-12 text-muted-foreground/50" />
            </div>
          )}
          <Badge 
            variant={listing.status === 'active' ? 'default' : 'secondary'}
            className="absolute right-2 top-2 bg-background/80 backdrop-blur-sm"
          >
            {listing.status}
          </Badge>
        </div>
        <CardContent className="space-y-2.5 p-4">
          <div className="space-y-1">
            <h3 className="font-semibold line-clamp-1 text-foreground">{listing.title}</h3>
            <p className="text-2xl font-bold text-primary">
              {formatPrice(listing.price)}
            </p>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {listing.description}
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {listing.bedrooms && (
              <span className="flex items-center gap-1.5">
                <BedDouble className="h-4 w-4" />
                {listing.bedrooms} beds
              </span>
            )}
            {listing.bathrooms && (
              <span className="flex items-center gap-1.5">
                <Bath className="h-4 w-4" />
                {listing.bathrooms} baths
              </span>
            )}
            {listing.square_feet && (
              <span className="flex items-center gap-1.5">
                <Square className="h-4 w-4" />
                {listing.square_feet.toLocaleString()} sqft
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
} 