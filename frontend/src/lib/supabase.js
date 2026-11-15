import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!url || !key) console.warn('Supabase no está configurado: faltan VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.')

export const supabase = createClient(url || 'https://invalid.supabase.co', key || 'invalid-key', {
  // The app uses hash-based routing (`#/home`). The implicit OAuth flow also puts
  // access tokens in the URL fragment, so the router can consume the callback before
  // Supabase persists the session. PKCE returns a short-lived `code` in the query
  // string instead and lets Supabase exchange it during initialization.
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: 'pkce' }
})
