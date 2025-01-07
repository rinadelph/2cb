import { supabase } from '../supabaseClient';
import { ListingFormValues } from '@/schemas/listing';

interface ListingBase extends ListingFormValues {
  id: string;
  created_at?: string;
  updated_at?: string;
}

export const createListing = async (data: ListingFormValues) => {
  try {
    const { data: newListing, error } = await supabase
      .from('listings')
      .insert(data)
      .select()
      .single();

    if (error) {
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

export const updateListing = async (id: string, data: Partial<ListingFormValues>): Promise<ListingFormValues> => {
  try {
    const { data: updatedListing, error } = await supabase
      .from('listings')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return updatedListing;
  } catch (error) {
    console.error('Error updating listing:', error);
    throw error;
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

export const getListing = async (id: string): Promise<ListingBase | null> => {
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

export const getTestListings = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('user_id', userId)
      .ilike('mls_number', 'TEST%')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching test listings:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in getTestListings:', error);
    throw error;
  }
};