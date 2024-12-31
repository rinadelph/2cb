import { useEffect, useState } from 'react';

interface GoogleMapsLibrary {
  maps: {
    Map: new (element: HTMLElement, options: unknown) => unknown;
    places: {
      Autocomplete: new (element: HTMLInputElement, options?: unknown) => unknown;
      AutocompleteService: new () => unknown;
      PlacesService: new (attrContainer: HTMLElement | unknown) => unknown;
    };
    Geocoder: new () => unknown;
    LatLng: new (lat: number, lng: number) => unknown;
    Marker: new (options: unknown) => unknown;
  };
}

declare global {
  interface Window {
    google: GoogleMapsLibrary;
  }
}

export const useGoogleMaps = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Check if Google Maps script is already loaded
    if (window.google) {
      setIsLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => setIsLoaded(true);

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return { isLoaded };
}; 