/**
 * Where a visit really comes from: a city-level lookup from the visitor's IP address, done once per visit by a free public service
 * (the visitor's browser calls it directly). Only the place — country, region, city and its rounded coordinates — is kept; the IP address
 * itself is never stored. It is the location of the visitor's internet provider, so a VPN or a mobile network can show a nearby city.
 */
export interface Geo { country_code: string; country: string; region: string; city: string; lat: number; lon: number }

const CACHE = 'a-geo'
const attempt = <T,>(fn: () => T, fallback: T): T => { try { return fn() } catch { return fallback } }
const round = (n: unknown) => { const v = Number(n); return Number.isFinite(v) ? Math.round(v * 100) / 100 : 0 }

const json = async (url: string, ms = 3000): Promise<Record<string, unknown> | null> => {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), ms)
  try { const r = await fetch(url, { signal: ctrl.signal }); return r.ok ? ((await r.json()) as Record<string, unknown>) : null } catch { return null } finally { clearTimeout(t) }
}

const clean = (code: unknown, country: unknown, region: unknown, city: unknown, lat: unknown, lon: unknown): Geo | null => {
  const cc = String(code ?? '').toUpperCase()
  if (!/^[A-Z]{2}$/.test(cc)) return null
  return { country_code: cc, country: String(country ?? '').slice(0, 60), region: String(region ?? '').slice(0, 80), city: String(city ?? '').slice(0, 80), lat: round(lat), lon: round(lon) }
}

async function lookup(): Promise<Geo | null> {
  const a = await json('https://ipwho.is/?fields=success,country,country_code,region,city,latitude,longitude')
  if (a && a.success !== false) { const g = clean(a.country_code, a.country, a.region, a.city, a.latitude, a.longitude); if (g) return g }
  const b = await json('https://get.geojs.io/v1/ip/geo.json')
  return b ? clean(b.country_code, b.country, b.region, b.city, b.latitude, b.longitude) : null
}

let pending: Promise<Geo | null> | null = null

/** Resolves to the visit's location, or null when it could not be found. Looked up once per visit and remembered for the rest of it. */
export function getGeo(): Promise<Geo | null> {
  const cached = attempt(() => sessionStorage.getItem(CACHE), null)
  if (cached !== null) return Promise.resolve(cached ? (attempt(() => JSON.parse(cached), null) as Geo | null) : null)
  pending ??= lookup().then((g) => { attempt(() => sessionStorage.setItem(CACHE, g ? JSON.stringify(g) : ''), null); return g })
  return pending
}
