import { Listing } from "@/types/listing";

export async function getLocationFromListing(listing: Listing): Promise<{ lat: number; lng: number }> {
  // If we have coordinates, use them
  if (listing.latitude && listing.longitude) {
    console.log('Using coordinates for listing:', listing.id);
    return { lat: listing.latitude, lng: listing.longitude };
  }

  // Format address for geocoding
  const address = [
    listing.address_street_number,
    listing.address_street_name,
    listing.address_unit,
    listing.city,
    listing.state,
    listing.zip_code,
    listing.country
  ].filter(Boolean).join(' ');

  if (!address) {
    throw new Error('No location information available');
  }

  try {
    console.log('Geocoding address for listing:', listing.id);
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
    );
    const data = await response.json();

    if (data.results?.[0]?.geometry?.location) {
      return data.results[0].geometry.location;
    }
    
    throw new Error('Unable to geocode address');
  } catch (error) {
    console.error('Error geocoding address:', error);
    throw error;
  }
} 