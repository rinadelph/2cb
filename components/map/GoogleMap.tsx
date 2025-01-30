import { useEffect, useRef } from 'react';
import { useGoogleMapsContext } from '@/lib/contexts/GoogleMapsContext';

export function GoogleMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const { isLoaded, loadError, google } = useGoogleMapsContext();

  useEffect(() => {
    if (!isLoaded || !google || !mapRef.current) return;

    const map = new google.maps.Map(mapRef.current, {
      center: { lat: 40.7128, lng: -74.0060 }, // Default to NYC
      zoom: 12,
      mapTypeControl: false,
      fullscreenControl: false,
      streetViewControl: false,
      styles: [
        {
          featureType: "poi",
          elementType: "labels",
          stylers: [{ visibility: "off" }],
        },
      ],
    });

    return () => {
      // Cleanup if needed
    };
  }, [isLoaded, google]);

  if (loadError) {
    return (
      <div className="flex items-center justify-center h-full bg-muted">
        <p className="text-muted-foreground">Failed to load map</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-full bg-muted">
        <p className="text-muted-foreground">Loading map...</p>
      </div>
    );
  }

  return <div ref={mapRef} className="w-full h-full" />;
} 