import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Listing } from "@/types/listing";
import { Badge } from "@/components/ui/badge";

interface ListingCardProps {
  listing: Listing;
}

export function ListingCard({ listing }: ListingCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="relative h-48 w-full">
        {listing.images?.[0] ? (
          <Image
            src={listing.images[0]}
            alt={listing.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="h-full w-full bg-muted flex items-center justify-center">
            No image available
          </div>
        )}
      </div>
      
      <CardHeader>
        <div className="flex justify-between items-start gap-4">
          <CardTitle className="line-clamp-2">{listing.title}</CardTitle>
          <Badge variant={listing.status === 'active' ? 'default' : 'secondary'}>
            {listing.status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-2">
          <div className="text-lg font-bold">
            ${listing.price?.toLocaleString()}
          </div>
          <div className="text-sm text-muted-foreground">
            {listing.address.street_number} {listing.address.street_name}
            {listing.address.unit && `, Unit ${listing.address.unit}`}
          </div>
          <div className="text-sm text-muted-foreground">
            {listing.address.city}, {listing.address.state} {listing.address.zip}
          </div>
          <div className="flex gap-4 text-sm">
            <div>{listing.bedrooms} beds</div>
            <div>{listing.bathrooms} baths</div>
            {listing.square_feet && (
              <div>{listing.square_feet.toLocaleString()} sqft</div>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <Button asChild className="w-full">
          <Link href={`/listings/${listing.id}`}>
            View Details
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}