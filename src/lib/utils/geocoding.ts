import { ListingFormData } from '@/types/listings';

export async function geocodeAddress(address: Partial<ListingFormData>) {
  const { address_street_number, address_street_name, city, state, zip_code, country } = address;
  
  // Construct the full address string
  const addressString = `${address_street_number} ${address_street_name}, ${city}, ${state} ${zip_code}, ${country}`;
  
  console.log('[Geocoding] Geocoding address:', addressString);
  
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        addressString
      )}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
    );

    const data = await response.json();
    
    console.log('[Geocoding] Response:', data);

    if (data.status === 'OK' && data.results[0]) {
      const { lat, lng } = data.results[0].geometry.location;
      return {
        latitude: lat,
        longitude: lng,
        location: `POINT(${lng} ${lat})` // PostGIS format
      };
    } else {
      console.error('[Geocoding] Failed to geocode address:', data.status);
      return null;
    }
  } catch (error) {
    console.error('[Geocoding] Error:', error);
    return null;
  }
} 