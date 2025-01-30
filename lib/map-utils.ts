"use client";

import { Listing } from "@/types/listing";

interface LocationResult {
  position: google.maps.LatLngLiteral;
  formattedAddress: string;
  raw: any; // Store raw response for debugging
}

export async function getListingLocation(listing: Listing): Promise<LocationResult> {
  console.log('=== Starting Location Resolution ===');
  console.log('Raw listing data:', {
    id: listing.id,
    coordinates: {
      lat: listing.latitude,
      lng: listing.longitude,
    },
    address: {
      street_number: listing.address_street_number,
      street_name: listing.address_street_name,
      unit: listing.address_unit,
      city: listing.city,
      state: listing.state,
      zip: listing.zip_code,
      country: listing.country,
    }
  });

  // Try coordinates first
  if (listing.latitude && listing.longitude) {
    console.log('Using existing coordinates');
    return {
      position: { 
        lat: listing.latitude, 
        lng: listing.longitude 
      },
      formattedAddress: formatListingAddress(listing),
      raw: { source: 'coordinates' }
    };
  }

  // Build address for geocoding
  const addressComponents = [
    listing.address_street_number,
    listing.address_street_name,
    listing.address_unit && `Unit ${listing.address_unit}`,
    listing.city,
    listing.state,
    listing.zip_code,
    listing.country || 'USA' // Default to USA if not specified
  ].filter(Boolean);

  const addressString = addressComponents.join(' ');
  console.log('Built address string:', addressString);

  try {
    console.log('Initializing Geocoder');
    const geocoder = new google.maps.Geocoder();

    console.log('Starting geocoding request');
    const response = await new Promise<google.maps.GeocoderResponse>((resolve, reject) => {
      geocoder.geocode({ address: addressString }, (results, status) => {
        console.log('Geocoding response:', { status, resultCount: results?.length });
        if (status === 'OK' && results?.[0]) {
          resolve(results);
        } else {
          reject(new Error(`Geocoding failed: ${status}`));
        }
      });
    });

    const result = response[0];
    console.log('Geocoding successful:', {
      formattedAddress: result.formatted_address,
      location: result.geometry.location.toJSON(),
      types: result.types,
      placeId: result.place_id
    });

    return {
      position: result.geometry.location.toJSON(),
      formattedAddress: result.formatted_address,
      raw: result
    };
  } catch (error) {
    console.error('Geocoding error:', error);
    throw new Error(`Failed to resolve location: ${error.message}`);
  }
}

function formatListingAddress(listing: Listing): string {
  const components = [
    [listing.address_street_number, listing.address_street_name].filter(Boolean).join(' '),
    listing.address_unit && `Unit ${listing.address_unit}`,
    listing.city,
    listing.state,
    listing.zip_code
  ].filter(Boolean);

  return components.join(', ');
}

export function logLocationAttempt(listing: Listing, result: LocationResult | null, error?: Error) {
  console.group(`Location Resolution Result - Listing ${listing.id}`);
  console.log('Input:', {
    hasCoordinates: !!(listing.latitude && listing.longitude),
    hasAddress: !!(listing.address_street_number || listing.address_street_name),
    hasCity: !!listing.city,
    hasState: !!listing.state,
    hasZip: !!listing.zip_code
  });
  
  if (result) {
    console.log('Success:', {
      resolvedPosition: result.position,
      formattedAddress: result.formattedAddress,
      rawResponse: result.raw
    });
  }
  
  if (error) {
    console.error('Failed:', {
      error: error.message,
      stack: error.stack
    });
  }
  
  console.groupEnd();
} 