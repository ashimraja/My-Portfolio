import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { SUPABASE_ANON_KEY, SUPABASE_URL } from '@/lib/cloud'

/** Loaded only by the dashboard (lazy chunk) — the public site talks to Supabase with plain fetch. */
let client: SupabaseClient | null = null
export const getClient = () => (client ??= createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, { auth: { persistSession: true, autoRefreshToken: true } }))
export const BUCKET = 'portfolio'

// ge@X*7D7S*N-4E4