import { Client } from "@googlemaps/google-maps-services-js";

const client = new Client({});

export async function geocodeAddress(address: string) {
  try {
    const response = await client.geocode({
      params: {
        address: address,
        key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
      },
    });

    if (response.data.results && response.data.results.length > 0) {
      const { lat, lng } = response.data.results[0].geometry.location;
      return { latitude: lat, longitude: lng };
    }
  } catch (error) {
    console.error('Geocoding error:', error);
  }

  return null;
}