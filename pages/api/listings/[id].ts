import { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseClient } from '@/lib/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    
    if (!id || Array.isArray(id)) {
      return res.status(400).json({ message: 'Invalid listing ID' });
    }

    const supabase = getSupabaseClient();
    
    // First, get the listing details
    const { data: listing, error: listingError } = await supabase
      .from('listings')
      .select('*')
      .eq('id', id)
      .single();

    if (listingError) {
      console.error('Error fetching listing:', listingError);
      return res.status(500).json({ message: 'Failed to fetch listing' });
    }

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Then, get the listing images
    const { data: images, error: imagesError } = await supabase
      .from('listing_images')
      .select('*')
      .eq('listing_id', id)
      .order('position');

    if (imagesError) {
      console.error('Error fetching images:', imagesError);
      // Don't fail the request, just log the error
    }

    // Combine listing data with images
    const listingWithImages = {
      ...listing,
      images: images || []
    };

    return res.status(200).json(listingWithImages);
  } catch (error) {
    console.error('Error in listing API:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 