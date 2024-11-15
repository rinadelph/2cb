import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface DeleteAccountBody {
  userId: string
  feedback?: string
  timestamp: string
}

serve(async (req) => {
  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { userId, feedback, timestamp } = await req.json() as DeleteAccountBody

    // Verify request
    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'User ID is required' }),
        { status: 400 }
      )
    }

    // Store deletion request
    const { error: deletionError } = await supabaseClient
      .from('account_deletions')
      .insert({
        user_id: userId,
        feedback,
        requested_at: timestamp,
        status: 'pending',
        scheduled_deletion_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      })

    if (deletionError) throw deletionError

    // Disable user account
    const { error: updateError } = await supabaseClient.auth.admin.updateUserById(
      userId,
      { banned: true }
    )

    if (updateError) throw updateError

    // Send notification email
    const { error: emailError } = await supabaseClient.functions.invoke('send-email', {
      body: {
        to: 'admin@example.com',
        subject: 'Account Deletion Request',
        template: 'account-deletion-admin',
        data: {
          userId,
          feedback,
          timestamp,
        },
      },
    })

    if (emailError) {
      console.error('Failed to send admin notification:', emailError)
    }

    return new Response(
      JSON.stringify({ message: 'Account scheduled for deletion' }),
      { status: 200 }
    )
  } catch (error) {
    console.error('Error processing account deletion:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500 }
    )
  }
}) 