import { createContext, useContext, ReactNode, useState, useCallback } from 'react';
import { LoadScript, LoadScriptProps } from '@react-google-maps/api';

interface GoogleMapsContextProps {
  children: ReactNode;
}

interface GoogleMapsContextValue {
  isLoaded: boolean;
  loadError: Error | null;
}

// Keep libraries array static to prevent reloads
const libraries: LoadScriptProps['libraries'] = ['places'];

const GoogleMapsContext = createContext<GoogleMapsContextValue>({
  isLoaded: false,
  loadError: null
});

export function GoogleMapsProvider({ children }: GoogleMapsContextProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<Error | null>(null);
  
  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
  
  console.log('[GoogleMapsProvider] Initializing with API key:', googleMapsApiKey ? 'Present' : 'Missing');

  const handleLoad = useCallback(() => {
    console.log('[GoogleMaps] Script loaded successfully');
    setIsLoaded(true);
  }, []);

  const handleError = useCallback((error: Error) => {
    console.error('[GoogleMaps] Script loading error:', error);
    setLoadError(error);
  }, []);

  return (
    <LoadScript 
      googleMapsApiKey={googleMapsApiKey}
      libraries={libraries}
      onLoad={handleLoad}
      onError={handleError}
    >
      <GoogleMapsContext.Provider value={{ isLoaded, loadError }}>
        {children}
      </GoogleMapsContext.Provider>
    </LoadScript>
  );
}

export function useGoogleMapsContext() {
  const context = useContext(GoogleMapsContext);
  console.log('[GoogleMapsContext] Current context state:', context);
  
  if (context === undefined) {
    throw new Error('useGoogleMapsContext must be used within a GoogleMapsProvider');
  }
  return context;
} 