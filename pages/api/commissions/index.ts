import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase-client';
import { CommissionFormValues } from '@/lib/schemas/commission-schema';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const data = req.body as CommissionFormValues & { 
      listing_id: string;
      user_id: string;
    };

    // Create commission structure
    const { data: commission, error } = await supabase
      .from('commission_structures')
      .insert([{
        listing_id: data.listing_id,
        type: data.type,
        amount: data.amount,
        split_percentage: data.split_percentage,
        terms: data.terms,
        verification_required: data.verification_required,
        visibility: data.visibility,
      }])
      .select()
      .single();

    if (error) throw error;

    // Create commission history entry
    const { error: historyError } = await supabase
      .from('commission_history')
      .insert([{
        commission_id: commission.id,
        changed_by: data.user_id,
        change_type: 'created',
        new_data: commission,
      }]);

    if (historyError) throw historyError;

    return res.status(200).json(commission);
  } catch (error) {
    console.error('Error creating commission:', error);
    return res.status(500).json({ error: 'Failed to create commission' });
  }
} 