"use client";

import { useState } from "react";
import { useLoadScript, LoadScript } from "@react-google-maps/api";
import { PropertyGoogleMap } from "./PropertyGoogleMap";
import { MapListingCard } from "./MapListingCard";
import { useMapListings } from "@/hooks/useMapListings";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Listing } from "@/types/listing";

// Define the libraries we need
const libraries: ["places", "geometry"] = ["places", "geometry"];

export function PropertyGoogleMapSection() {
  const { data: listings, isLoading: listingsLoading, error } = useMapListings();
  const [selectedListingId, setSelectedListingId] = useState<string>();
  const [isMapLoading, setIsMapLoading] = useState(true);

  const handleListingSelect = (listingId: string | null) => {
    console.log("Listing selected:", listingId);
    setSelectedListingId(listingId || undefined);
  };

  return (
    <div className="w-full h-[500px] mb-8 border rounded-lg overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr,400px] h-full">
        {/* Map Container */}
        <div className="relative h-full">
          {isMapLoading && (
            <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
              <Skeleton className="h-full w-full" />
            </div>
          )}
          <LoadScript
            googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}
            libraries={libraries}
            onLoad={() => setIsMapLoading(false)}
          >
            <PropertyGoogleMap 
              listings={listings}
              selectedListingId={selectedListingId}
              onListingSelect={handleListingSelect}
            />
          </LoadScript>
        </div>

        {/* Listings Panel */}
        <div className="hidden lg:block border-l bg-background">
          <ScrollArea className="h-full">
            <div className="p-4">
              <h2 className="text-lg font-semibold mb-4">
                Properties ({listings?.length || 0})
              </h2>
              
              <div className="space-y-3">
                {listingsLoading ? (
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
                    isActive={listing.id === selectedListingId}
                    onClick={() => handleListingSelect(listing.id)}
                  />
                ))}
              </div>
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
} 