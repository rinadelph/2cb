import { Loader } from "@googlemaps/js-api-loader";
import React, { useEffect, useRef } from "react";

interface MapProps {
  center: { lat: number; lng: number };
  zoom?: number;
}

const Map: React.FC<MapProps> = ({ center, zoom = 15 }) => {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loader = new Loader({
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
      version: "weekly",
      libraries: ["places"]
    });

    let map: google.maps.Map | null = null;

    loader.load().then((google) => {
      if (mapRef.current) {
        map = new google.maps.Map(mapRef.current, {
          center,
          zoom,
        });
      }
    }).catch((error) => {
      console.error("Error loading Google Maps:", error);
    });

    return () => {
      if (map) {
        // Cleanup if needed
      }
    };
  }, [center, zoom]);

  return <div ref={mapRef} style={{ width: "100%", height: "400px" }} />;
};

export default Map;