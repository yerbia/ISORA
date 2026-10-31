import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!url || !key) console.warn('Supabase no está configurado: faltan VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.')

export const supabase = createClient(url || 'https://invalid.supabase.co', key || 'invalid-key', {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
})
