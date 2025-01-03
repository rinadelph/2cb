import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase-client';
import { CommissionVerificationFormValues } from '@/lib/schemas/commission-schema';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const data = req.body as CommissionVerificationFormValues & {
      commission_id: string;
      user_id: string;
    };

    // Create verification record
    const { data: verification, error } = await supabase
      .from('commission_verifications')
      .insert([{
        commission_id: data.commission_id,
        verified_by: data.user_id,
        verification_type: data.verification_type,
        verification_data: data.verification_data,
        expires_at: data.expires_at,
        notes: data.notes,
      }])
      .select()
      .single();

    if (error) throw error;

    // Update commission structure
    const { error: updateError } = await supabase
      .from('commission_structures')
      .update({
        verified_at: new Date().toISOString(),
        verified_by: data.user_id,
      })
      .eq('id', data.commission_id);

    if (updateError) throw updateError;

    // Create history entry
    const { error: historyError } = await supabase
      .from('commission_history')
      .insert([{
        commission_id: data.commission_id,
        changed_by: data.user_id,
        change_type: 'verified',
        new_data: verification,
      }]);

    if (historyError) throw historyError;

    return res.status(200).json(verification);
  } catch (error) {
    console.error('Error verifying commission:', error);
    return res.status(500).json({ error: 'Failed to verify commission' });
  }
} 