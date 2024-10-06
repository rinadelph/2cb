import { supabase } from '../supabaseClient';
import { Listing, ListingFormData } from '../../types/listing';

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

export const updateListing = async (id: string, data: Partial<Listing>, userId?: string): Promise<Listing> => {
  try {
    let query = supabase
      .from('listings')
      .update(data)
      .eq('id', id);

    // If userId is provided, add it to the query conditions
    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data: updatedListing, error } = await query.select().single();

    if (error) {
      console.error('Error updating listing:', error);
      throw error;
    }

    return updatedListing;
  } catch (err) {
    console.error("Error updating listing:", err);
    throw err;
  }
};

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

export const getListing = async (id: string): Promise<Listing | null> => {
  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching listing:', error);
    throw error;
  }

  return data;
};