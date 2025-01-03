import { NextApiRequest } from 'next';
import { getSupabaseClient } from './supabaseClient';

export async function getAuthUser(req: NextApiRequest) {
  try {
    const supabase = getSupabaseClient();
    
    // Get the token from the request header
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.split(' ')[1];
    
    // Verify the token and get user data
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      console.error('Auth error:', error);
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
    };
  } catch (error) {
    console.error('Auth helper error:', error);
    return null;
  }
}

// Helper to get user from client-side
export async function getCurrentUser() {
  try {
    const supabase = getSupabaseClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
    };
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
}