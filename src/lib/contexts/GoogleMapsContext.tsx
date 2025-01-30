"use client";

import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

interface GoogleMapsContextProps {
  children: ReactNode;
}

interface GoogleMapsContextValue {
  isLoaded: boolean;
  loadError: Error | null;
  google: typeof google | null;
}

const GoogleMapsContext = createContext<GoogleMapsContextValue>({
  isLoaded: false,
  loadError: null,
  google: null
});

export function GoogleMapsProvider({ children }: GoogleMapsContextProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<Error | null>(null);
  const [google, setGoogle] = useState<typeof window.google | null>(null);

  useEffect(() => {
    console.log('GoogleMapsProvider: Loading Google Maps...');
    
    if (typeof window === 'undefined') return;

    const loader = new Loader({
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
      version: 'weekly',
      libraries: ['places']
    });

    loader.load()
      .then(() => {
        console.log('GoogleMapsProvider: Google Maps loaded successfully');
        setGoogle(window.google);
        setIsLoaded(true);
      })
      .catch((error) => {
        console.error('GoogleMapsProvider: Failed to load Google Maps', error);
        setLoadError(error);
      });
  }, []);

  const value = {
    isLoaded,
    loadError,
    google
  };

  console.log('GoogleMapsProvider state:', value);

  return (
    <GoogleMapsContext.Provider value={value}>
      {children}
    </GoogleMapsContext.Provider>
  );
}

export function useGoogleMapsContext() {
  const context = useContext(GoogleMapsContext);
  
  if (!context) {
    throw new Error('useGoogleMapsContext must be used within a GoogleMapsProvider');
  }
  return context;
} 