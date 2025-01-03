import { supabase } from './supabaseClient';
import { ListingBase } from '@/types/listing';

export async function createListing(data: Partial<ListingBase>) {
  const { data: { session } } = await supabase.auth.getSession();
  
  const response = await fetch('/api/listings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session?.access_token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create listing');
  }

  return response.json();
} 