/** Supabase connection (public anon key — safe to ship; write access is locked by row-level security). */
export const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.replace(/\/$/, '')
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined
export const cloudEnabled = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)

export const restHeaders = (): Record<string, string> => ({ apikey: SUPABASE_ANON_KEY ?? '', Authorization: `Bearer ${SUPABASE_ANON_KEY ?? ''}` })
