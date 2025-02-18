"use client";

import { useState } from "react";
import { SimpleMapDisplay } from "./SimpleMapDisplay";
import { MapListingCard } from "./MapListingCard";
import { useMapListings } from "@/hooks/useMapListings";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Listing } from "@/types/listing";

export function PropertyMapSection() {
  const { data: listings, isLoading, error } = useMapListings();
  const [activeListingId, setActiveListingId] = useState<string>();

  console.log("PropertyMapSection render:", {
    listingsCount: listings?.length || 0,
    isLoading,
    hasError: !!error,
    activeListingId
  });

  const handleListingClick = (listing: Listing) => {
    console.log("Listing clicked:", {
      id: listing.id,
      title: listing.title,
      wasActive: listing.id === activeListingId
    });
    setActiveListingId(listing.id === activeListingId ? undefined : listing.id);
  };

  return (
    <div className="w-full h-full grid grid-cols-1 lg:grid-cols-[1fr,400px]">
      {/* Map Container */}
      <div className="relative h-full">
        <SimpleMapDisplay 
          listings={listings}
          activeListingId={activeListingId}
          onMarkerClick={handleListingClick}
        />
      </div>

      {/* Listings Panel */}
      <div className="hidden lg:block border-l bg-background">
        <ScrollArea className="h-full">
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-4">
              Properties ({listings?.length || 0})
            </h2>
            
            <div className="space-y-3">
              {isLoading ? (
                // Loading skeletons
                Array(5).fill(0).map((_, i) => (
                  <div key={i} className="flex gap-3 p-3">
                    <Skeleton className="w-24 h-24 rounded-md" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                  </div>
                ))
              ) : error ? (
                <div className="p-4 text-sm text-muted-foreground">
                  Error loading listings
                </div>
              ) : listings?.length === 0 ? (
                <div className="p-4 text-sm text-muted-foreground">
                  No properties found
                </div>
              ) : listings?.map((listing) => (
                <MapListingCard 
                  key={listing.id} 
                  listing={listing}
                  isActive={listing.id === activeListingId}
                  onClick={() => handleListingClick(listing)}
                />
              ))}
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
} 