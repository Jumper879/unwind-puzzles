import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(url && anonKey)

// Until a real Supabase project exists (see .env.example), the app falls
// back to local-only guest state everywhere this is used — see
// src/platform/browser.ts — rather than throwing on missing env vars.
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url, anonKey)
  : null

if (!isSupabaseConfigured && import.meta.env.DEV) {
  console.warn(
    '[unwind] VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY are not set — running in local-only guest mode. See .env.example.',
  )
}
