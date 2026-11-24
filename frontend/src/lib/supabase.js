import { createClient } from '@supabase/supabase-js'
import { MOBILE } from './mobile.js'
import { secureGet, secureRemove, secureSet } from './coach-secrets.js'

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || ''
const key = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!SUPABASE_URL || !key) console.warn('Supabase no está configurado: faltan VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.')

// Supabase's default browser storage is localStorage. On Android the WebView storage can be
// evicted or copied by the app backup, which was the reason the old pairing token disappeared.
// The secure-storage plugin uses Android Keystore-backed encrypted preferences and implements
// the async StorageLike interface accepted by supabase-js.
const secureSessionStorage = {
  getItem: keyName => secureGet('supabase.auth.' + keyName),
  setItem: (keyName, value) => secureSet('supabase.auth.' + keyName, value),
  removeItem: keyName => secureRemove('supabase.auth.' + keyName),
}

export const supabase = createClient(SUPABASE_URL || 'https://invalid.supabase.co', key || 'invalid-key', {
  // The app uses hash-based routing (`#/home`). The implicit OAuth flow also puts
  // access tokens in the URL fragment, so the router can consume the callback before
  // Supabase persists the session. PKCE returns a short-lived `code` in the query
  // string instead and lets Supabase exchange it during initialization.
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: !MOBILE,
    flowType: 'pkce',
    ...(MOBILE ? { storage: secureSessionStorage } : {})
  }
})
