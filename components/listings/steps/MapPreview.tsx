import React from 'react';
import { useLoadScript, GoogleMap, Marker } from '@react-google-maps/api';

interface MapPreviewProps {
  center: {
    lat: number;
    lng: number;
  };
}

const mapContainerStyle = {
  width: '100%',
  height: '300px',
  borderRadius: '0.5rem',
};

const defaultOptions = {
  disableDefaultUI: true,
  zoomControl: true,
  scrollwheel: false,
  mapTypeControl: false,
  streetViewControl: false,
};

export function MapPreview({ center }: MapPreviewProps) {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries: ['places'],
  });

  if (!isLoaded) {
    return (
      <div className="w-full h-[300px] rounded-lg bg-muted animate-pulse flex items-center justify-center">
        <span className="text-muted-foreground">Loading map...</span>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        zoom={15}
        center={center}
        options={defaultOptions}
      >
        <Marker position={center} />
      </GoogleMap>
    </div>
  );
} 