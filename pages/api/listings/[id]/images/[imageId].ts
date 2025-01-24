import { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const supabase = createServerSupabaseClient({ req, res });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id: listingId, imageId } = req.query;

    // Verify user owns the listing
    const { data: listing, error: listingError } = await supabase
      .from('listings')
      .select('user_id')
      .eq('id', listingId)
      .single();

    if (listingError || !listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    if (listing.user_id !== session.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Get image path before deletion
    const { data: image, error: imageError } = await supabase
      .from('listing_images')
      .select('image_path')
      .eq('id', imageId)
      .single();

    if (imageError || !image) {
      return res.status(404).json({ error: 'Image not found' });
    }

    // Delete from storage
    const { error: storageError } = await supabase
      .storage
      .from('listing-images')
      .remove([image.image_path]);

    if (storageError) {
      console.error('[delete] Error deleting from storage:', storageError);
      return res.status(500).json({ error: 'Failed to delete image from storage' });
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from('listing_images')
      .delete()
      .eq('id', imageId);

    if (dbError) {
      console.error('[delete] Error deleting from database:', dbError);
      return res.status(500).json({ error: 'Failed to delete image record' });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('[delete] Unexpected error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 