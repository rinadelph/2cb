import { supabase } from '../supabaseClient';
import { Listing } from '../../types/listing';

export const createListing = async (data: ListingFormData) => {
  try {
    const { data: newListing, error } = await supabase
      .from('listings')
      .insert(data)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      throw new Error(`Failed to create listing: ${error.message}`);
    }

    return newListing;
  } catch (error) {
    console.error('Error in createListing:', error);
    throw error;
  }
};

export async function getListings() {
  try {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (err) {
    console.error("Error fetching listings:", err);
    throw err;
  }
}

export async function getListingById(id: string) {
  try {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error("Error fetching listing:", err);
    throw err;
  }
}

export async function updateListing(id: string, data: Partial<Listing>) {
  try {
    const { data: updatedListing, error } = await supabase
      .from('listings')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return updatedListing;
  } catch (err) {
    console.error("Error updating listing:", err);
    throw err;
  }
}

export async function deleteListing(id: string) {
  try {
    const { error } = await supabase
      .from('listings')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (err) {
    console.error("Error deleting listing:", err);
    throw err;
  }
}