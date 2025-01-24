import { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const supabase = createServerSupabaseClient({ req, res });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id: listingId } = req.query;
    const updates = req.body;

    if (!Array.isArray(updates)) {
      return res.status(400).json({ error: 'Invalid request body' });
    }

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

    // Update image orders
    const { error: updateError } = await supabase
      .from('listing_images')
      .upsert(
        updates.map((update: { id: string; display_order: number }) => ({
          id: update.id,
          display_order: update.display_order,
        }))
      );

    if (updateError) {
      console.error('[reorder] Error updating image order:', updateError);
      return res.status(500).json({ error: 'Failed to update image order' });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('[reorder] Unexpected error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 