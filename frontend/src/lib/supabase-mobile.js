import { MOBILE } from './mobile.js'
import { supabase } from './supabase.js'

export const SUPABASE_REDIRECT_URL = import.meta.env.VITE_SUPABASE_REDIRECT_URL || 'ar.entren.app://auth/callback'

let listener = null

function callbackParts(raw) {
  try {
    const u = new URL(raw)
    const hash = new URLSearchParams(String(u.hash || '').replace(/^#/, ''))
    return { code: u.searchParams.get('code'), access: hash.get('access_token') || u.searchParams.get('access_token'), refresh: hash.get('refresh_token') || u.searchParams.get('refresh_token') }
  } catch { return {} }
}

export async function consumeSupabaseRedirect(raw) {
  const { code, access, refresh } = callbackParts(raw)
  const result = code
    ? await supabase.auth.exchangeCodeForSession(code)
    : access && refresh ? await supabase.auth.setSession({ access_token: access, refresh_token: refresh }) : null
  if (result) window.dispatchEvent(new Event('entrenar:supabase-auth'))
  return result
}

// Capacitor delivers a custom-scheme OAuth return through App.appUrlOpen. The listener is
// installed before boot so a cold-start callback is consumed before the first session read.
export async function initSupabaseMobileAuth() {
  if (!MOBILE || listener) return () => {}
  const { App } = await import('@capacitor/app')
  const handle = ({ url }) => { if (url) consumeSupabaseRedirect(url).catch(() => {}) }
  listener = await App.addListener('appUrlOpen', handle)
  return () => { listener?.remove?.(); listener = null }
}

