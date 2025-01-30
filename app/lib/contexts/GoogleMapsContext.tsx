import { createContext, useContext, ReactNode } from 'react';
import { LoadScript } from '@react-google-maps/api';

interface GoogleMapsContextProps {
  children: ReactNode;
}

const GoogleMapsContext = createContext({});

export function GoogleMapsProvider({ children }: GoogleMapsContextProps) {
  // Get the API key from environment variable
  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

  return (
    <LoadScript googleMapsApiKey={googleMapsApiKey}>
      <GoogleMapsContext.Provider value={{}}>
        {children}
      </GoogleMapsContext.Provider>
    </LoadScript>
  );
}

export function useGoogleMapsContext() {
  const context = useContext(GoogleMapsContext);
  if (context === undefined) {
    throw new Error('useGoogleMapsContext must be used within a GoogleMapsProvider');
  }
  return context;
} 