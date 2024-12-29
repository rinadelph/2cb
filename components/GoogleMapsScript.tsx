'use client';

import { useEffect, useState } from 'react';

const GoogleMapsScript = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if script is already loaded
    if (window.google?.maps) {
      setIsLoaded(true);
      return;
    }

    const loadScript = async () => {
      try {
        // Create a new script element
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.id = 'google-maps-script';
        
        // Create a promise to handle script loading
        const loadPromise = new Promise((resolve, reject) => {
          script.addEventListener('load', resolve);
          script.addEventListener('error', reject);
        });

        // Append script to document body
        document.body.appendChild(script);

        // Wait for script to load
        await loadPromise;
        setIsLoaded(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load Google Maps');
        console.error('Error loading Google Maps script:', err);
      }
    };

    loadScript();

    // Cleanup function
    return () => {
      const existingScript = document.getElementById('google-maps-script');
      if (existingScript) {
        document.body.removeChild(existingScript);
      }
    };
  }, []);

  if (error) {
    console.error('Google Maps loading error:', error);
    return null;
  }

  return null;
};

export default GoogleMapsScript; 