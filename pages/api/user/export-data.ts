import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { logger } from '@/lib/debug'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

export async function GET(req: Request) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })
    
    // Get current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (!session || sessionError) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Fetch user data
    const userData = await fetchUserData(supabase, session.user.id)
    
    // Generate export file
    const exportData = {
      user: {
        id: session.user.id,
        email: session.user.email,
        created_at: session.user.created_at,
      },
      ...userData,
      exported_at: new Date().toISOString(),
    }

    logger.info('Data export generated', { userId: session.user.id })

    // Return as downloadable file
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="account-data-${session.user.id}.json"`,
      },
    })
  } catch (error) {
    logger.error('Error exporting user data:', error)
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    )
  }
}

async function fetchUserData(supabase: SupabaseClient<Database>, userId: string) {
  // Fetch all relevant user data
  const [
    { data: listings },
    { data: activity },
    { data: settings },
  ] = await Promise.all([
    supabase.from('listings').select('*').eq('user_id', userId),
    supabase.from('user_activity').select('*').eq('user_id', userId),
    supabase.from('user_settings').select('*').eq('user_id', userId),
  ])

  return {
    listings,
    activity,
    settings,
  }
} 