"use client";

import { useEffect, useRef, useState } from 'react';
import { googleMapsLoader } from '@/lib/google-maps-loader';
import { Listing } from '@/types/listing';
import { PropertyMapMarker } from './PropertyMapMarker';
import { getLocationFromListing } from '@/lib/location-utils';
import { formatPrice } from '@/lib/utils';

interface SimpleMapDisplayProps {
  listings?: Listing[];
  activeListingId?: string;
  onMarkerClick?: (listing: Listing) => void;
}

export function SimpleMapDisplay({ 
  listings = [], 
  activeListingId,
  onMarkerClick 
}: SimpleMapDisplayProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const markersRef = useRef<{ [key: string]: google.maps.marker.AdvancedMarkerElement }>({});

  console.log("SimpleMapDisplay render:", {
    listingsCount: listings.length,
    activeListingId,
    hasMap: !!map,
    markerCount: Object.keys(markersRef.current).length
  });

  // Initialize map
  useEffect(() => {
    if (!mapRef.current) return;

    const initMap = async () => {
      try {
        console.log('Loading Google Maps...');
        const google = await googleMapsLoader.load();
        console.log('Google Maps loaded successfully');

        console.log('Creating map instance...');
        const mapInstance = new google.maps.Map(mapRef.current!, {
          center: { lat: 25.7617, lng: -80.1918 }, // Miami
          zoom: 12,
          mapId: 'property-map', // Add a custom map ID
          disableDefaultUI: true,
          zoomControl: true,
          streetViewControl: true,
        });
        console.log('Map instance created successfully');
        
        setMap(mapInstance);
      } catch (error) {
        console.error('Error loading map:', error);
        setMapError('Failed to load map');
      }
    };

    initMap();
  }, []);

  // Handle markers
  useEffect(() => {
    if (!map || !listings.length) return;

    console.log('Updating markers:', {
      listingsCount: listings.length,
      currentMarkers: Object.keys(markersRef.current).length
    });

    // Remove old markers
    Object.values(markersRef.current).forEach(marker => marker.map = null);
    markersRef.current = {};

    // Add new markers
    listings.forEach(async (listing) => {
      try {
        const location = await getLocationFromListing(listing);
        
        const { markerContent } = PropertyMapMarker({ 
          listing,
          isActive: listing.id === activeListingId,
          onClick: () => onMarkerClick?.(listing)
        });

        const markerElement = document.createElement('div');
        markerElement.innerHTML = markerContent;

        const marker = new google.maps.marker.AdvancedMarkerElement({
          map,
          position: location,
          content: markerElement.firstElementChild as HTMLElement,
          title: listing.title,
        });

        // Create info window
        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div class="p-2">
              <h3 class="font-semibold">${listing.title}</h3>
              <p class="text-sm">${formatPrice(listing.price)}</p>
              ${listing.description ? `<p class="text-sm mt-1">${listing.description}</p>` : ''}
            </div>
          `,
        });

        marker.addListener('click', () => {
          // Close any open info windows
          Object.values(markersRef.current).forEach(m => {
            if (m.infoWindow?.getMap()) {
              m.infoWindow.close();
            }
          });

          // Open this info window and center map
          infoWindow.open(map, marker);
          map.panTo(location);
          onMarkerClick?.(listing);
        });

        // Store info window with marker
        (marker as any).infoWindow = infoWindow;
        markersRef.current[listing.id] = marker;

        // If this is the active listing, trigger click
        if (listing.id === activeListingId) {
          marker.click();
        }
      } catch (error) {
        console.error('Error creating marker for listing:', listing.id, error);
      }
    });

    // Fit bounds if we have markers
    if (Object.keys(markersRef.current).length > 0) {
      const bounds = new google.maps.LatLngBounds();
      Object.values(markersRef.current).forEach(marker => {
        bounds.extend(marker.position as google.maps.LatLng);
      });
      map.fitBounds(bounds);
    }
  }, [map, listings, activeListingId, onMarkerClick]);

  if (mapError) {
    return (
      <div className="flex items-center justify-center h-full bg-muted">
        <p className="text-muted-foreground">{mapError}</p>
      </div>
    );
  }

  return <div ref={mapRef} className="w-full h-full" />;
} 