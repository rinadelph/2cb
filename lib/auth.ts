import { supabase } from './supabaseClient'

export async function signUp(email: string, password: string) {
  const { user, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  })
  if (error) throw error
  return user
}

export async function signIn(email: string, password: string) {
  const { user, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return user
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function isEmailVerified() {
  const user = await getCurrentUser()
  return user?.email_confirmed_at ? true : false
}