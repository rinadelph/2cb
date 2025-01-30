"use client";

import { Listing } from "@/types/listing";
import { formatPrice } from "@/lib/utils";

interface PropertyMapMarkerProps {
  listing: Listing;
  isActive?: boolean;
  onClick?: () => void;
}

export function PropertyMapMarker({ listing, isActive, onClick }: PropertyMapMarkerProps) {
  console.log("PropertyMapMarker render:", {
    listingId: listing.id,
    title: listing.title,
    price: listing.price,
    isActive,
    hasLocation: !!(listing.latitude && listing.longitude)
  });

  // This will be used to create the marker element
  const markerContent = `
    <div class="relative group">
      <div class="absolute -translate-x-1/2 -translate-y-full mb-2 ${
        isActive ? 'scale-110' : 'scale-100'
      }">
        <div class="bg-primary px-2 py-1 rounded-md text-primary-foreground shadow-md whitespace-nowrap">
          ${formatPrice(listing.price)}
        </div>
        <div class="w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-primary mx-auto" />
      </div>
    </div>
  `;

  return { markerContent };
} 