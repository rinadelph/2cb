"use client";

import { useEffect, useRef } from 'react';
import { useGoogleMapsContext } from '@/lib/contexts/GoogleMapsContext';

export function PropertyMapDisplay() {
  const mapRef = useRef<HTMLDivElement>(null);
  const { isLoaded, loadError, google } = useGoogleMapsContext();

  console.log('PropertyMapDisplay render:', { isLoaded, hasGoogle: !!google, hasRef: !!mapRef.current });

  useEffect(() => {
    console.log('PropertyMapDisplay useEffect:', { isLoaded, hasGoogle: !!google, hasRef: !!mapRef.current });

    if (!isLoaded || !google || !mapRef.current) {
      console.log('PropertyMapDisplay: Missing requirements', { isLoaded, hasGoogle: !!google, hasRef: !!mapRef.current });
      return;
    }

    try {
      console.log('PropertyMapDisplay: Creating map instance');
      const map = new google.maps.Map(mapRef.current, {
        center: { lat: 25.7617, lng: -80.1918 }, // Miami
        zoom: 12,
      });
      console.log('PropertyMapDisplay: Map instance created successfully');
    } catch (error) {
      console.error('PropertyMapDisplay: Error creating map', error);
    }
  }, [isLoaded, google]);

  if (loadError) {
    console.error('PropertyMapDisplay: Load error:', loadError);
    return (
      <div className="flex items-center justify-center h-full bg-muted">
        <p className="text-muted-foreground">Unable to load property map</p>
      </div>
    );
  }

  if (!isLoaded || !google) {
    console.log('PropertyMapDisplay: Still loading...');
    return (
      <div className="flex items-center justify-center h-full bg-muted">
        <p className="text-muted-foreground">Loading property map...</p>
      </div>
    );
  }

  return <div ref={mapRef} className="w-full h-full" />;
} 