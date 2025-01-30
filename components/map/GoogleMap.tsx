import { useEffect, useRef, useState } from 'react';
import { useGoogleMapsContext } from '../../src/lib/contexts/GoogleMapsContext';

export function GoogleMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const { isLoaded, loadError } = useGoogleMapsContext();
  const [map, setMap] = useState<google.maps.Map | null>(null);

  console.log('[GoogleMap] Component render - isLoaded:', isLoaded, 'loadError:', loadError);
  console.log('[GoogleMap] Window google object:', window.google ? 'Present' : 'Missing');

  useEffect(() => {
    console.log('[GoogleMap] useEffect triggered - isLoaded:', isLoaded, 'mapRef.current:', !!mapRef.current);
    console.log('[GoogleMap] Window google maps object:', window.google?.maps ? 'Present' : 'Missing');
    
    if (!isLoaded || !mapRef.current) return;

    console.log('[GoogleMap] Initializing map instance');
    try {
      const mapInstance = new google.maps.Map(mapRef.current, {
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

      console.log('[GoogleMap] Map instance created successfully');
      setMap(mapInstance);
    } catch (error) {
      console.error('[GoogleMap] Error creating map instance:', error);
    }

    return () => {
      console.log('[GoogleMap] Cleanup effect running');
    };
  }, [isLoaded]);

  if (loadError) {
    console.error('[GoogleMap] Load error:', loadError);
    return (
      <div className="flex items-center justify-center h-full bg-muted">
        <p className="text-muted-foreground">Failed to load map</p>
      </div>
    );
  }

  return <div ref={mapRef} className="w-full h-full" />;
} 