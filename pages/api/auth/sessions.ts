import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { logger } from '@/lib/debug'
import { SessionInfo } from '@/types/auth'
import UAParser from 'ua-parser-js'

export async function GET(req: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Get current session
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user agent info
    const userAgent = req.headers.get('user-agent') || ''
    const parser = new UAParser(userAgent)
    const deviceType = parser.getDevice().type
    const deviceInfo = {
      type: deviceType === 'mobile' ? 'mobile' as const :
            deviceType === 'tablet' ? 'tablet' as const :
            deviceType === 'desktop' ? 'desktop' as const : 'unknown' as const,
      browser: `${parser.getBrowser().name} ${parser.getBrowser().version}`,
      os: `${parser.getOS().name} ${parser.getOS().version}`,
      ip: req.headers.get('x-forwarded-for') || 'unknown'
    }

    // Enhance session with additional info
    const enhancedSession: SessionInfo = {
      id: session.user.id,
      lastActive: new Date().toISOString(),
      deviceInfo,
      current: true
    }
    
    logger.info('Session retrieved', { 
      userId: session.user.id,
      deviceInfo
    })
    
    return NextResponse.json({
      session: enhancedSession
    })
  } catch (error) {
    logger.error('Error retrieving session:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { searchParams } = new URL(req.url)
    const scope = searchParams.get('scope') as 'global' | 'local' | 'others' | undefined

    if (!scope) {
      return NextResponse.json(
        { error: 'Scope required' },
        { status: 400 }
      )
    }

    const { error } = await supabase.auth.signOut({
      scope
    })

    if (error) throw error

    logger.info('Session revoked', { scope })

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Error revoking session:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 