import { supabase } from '../supabase/client';
import { geocodeAddress } from '../utils/geocoding';
import { ListingFormData } from '@/types/listings';

export async function createListing(data: ListingFormData) {
  // First geocode the address
  const geoData = await geocodeAddress(data);
  
  if (!geoData) {
    throw new Error('Failed to geocode address. Please verify the address is correct.');
  }

  // Combine the listing data with the geocoding results
  const listingData = {
    ...data,
    ...geoData
  };

  const { data: listing, error } = await supabase
    .from('listings')
    .insert([listingData])
    .select()
    .single();

  if (error) throw error;
  return listing;
}

export async function updateListing(id: string, data: Partial<ListingFormData>) {
  // If address fields are being updated, re-geocode
  if (
    data.address_street_number ||
    data.address_street_name ||
    data.city ||
    data.state ||
    data.zip_code ||
    data.country
  ) {
    // Fetch current listing data to combine with updates for complete address
    const { data: currentListing } = await supabase
      .from('listings')
      .select()
      .eq('id', id)
      .single();

    const addressData = {
      address_street_number: data.address_street_number || currentListing.address_street_number,
      address_street_name: data.address_street_name || currentListing.address_street_name,
      city: data.city || currentListing.city,
      state: data.state || currentListing.state,
      zip_code: data.zip_code || currentListing.zip_code,
      country: data.country || currentListing.country,
    };

    const geoData = await geocodeAddress(addressData);
    
    if (!geoData) {
      throw new Error('Failed to geocode address. Please verify the address is correct.');
    }

    // Add geocoding results to the update data
    Object.assign(data, geoData);
  }

  const { data: listing, error } = await supabase
    .from('listings')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return listing;
} 