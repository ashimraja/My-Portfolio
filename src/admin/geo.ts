/**
 * Approximate location from the visitor's timezone (e.g. "Asia/Calcutta"), which the site already records.
 * No IP address is collected or sent to any third party. It is a good guess, not a precise one: a VPN or a travelling visitor
 * shows up in the country of their device's clock, and a zone shared by several countries maps to its main one.
 */
const ZONES: Record<string, string> = {}
const add = (code: string, zones: string) => { for (const z of zones.split(' ')) ZONES[z] = code }

add('IN', 'Asia/Calcutta Asia/Kolkata'); add('AE', 'Asia/Dubai'); add('PK', 'Asia/Karachi'); add('BD', 'Asia/Dhaka'); add('LK', 'Asia/Colombo')
add('NP', 'Asia/Kathmandu Asia/Katmandu'); add('SG', 'Asia/Singapore'); add('MY', 'Asia/Kuala_Lumpur'); add('TH', 'Asia/Bangkok'); add('VN', 'Asia/Ho_Chi_Minh Asia/Saigon')
add('ID', 'Asia/Jakarta'); add('PH', 'Asia/Manila'); add('HK', 'Asia/Hong_Kong'); add('CN', 'Asia/Shanghai'); add('TW', 'Asia/Taipei'); add('JP', 'Asia/Tokyo')
add('KR', 'Asia/Seoul'); add('SA', 'Asia/Riyadh'); add('QA', 'Asia/Qatar'); add('KW', 'Asia/Kuwait'); add('IR', 'Asia/Tehran'); add('IL', 'Asia/Jerusalem Asia/Tel_Aviv')
add('IQ', 'Asia/Baghdad'); add('UZ', 'Asia/Tashkent'); add('KZ', 'Asia/Almaty'); add('MM', 'Asia/Yangon Asia/Rangoon'); add('OM', 'Asia/Muscat'); add('BH', 'Asia/Bahrain')
add('GB', 'Europe/London'); add('IE', 'Europe/Dublin'); add('FR', 'Europe/Paris'); add('DE', 'Europe/Berlin'); add('ES', 'Europe/Madrid'); add('IT', 'Europe/Rome')
add('NL', 'Europe/Amsterdam'); add('BE', 'Europe/Brussels'); add('CH', 'Europe/Zurich'); add('AT', 'Europe/Vienna'); add('SE', 'Europe/Stockholm'); add('NO', 'Europe/Oslo')
add('DK', 'Europe/Copenhagen'); add('FI', 'Europe/Helsinki'); add('PL', 'Europe/Warsaw'); add('CZ', 'Europe/Prague'); add('HU', 'Europe/Budapest'); add('RO', 'Europe/Bucharest')
add('GR', 'Europe/Athens'); add('PT', 'Europe/Lisbon'); add('TR', 'Europe/Istanbul'); add('UA', 'Europe/Kiev Europe/Kyiv'); add('RU', 'Europe/Moscow'); add('RS', 'Europe/Belgrade'); add('BG', 'Europe/Sofia')
add('US', 'America/New_York America/Chicago America/Denver America/Los_Angeles America/Phoenix America/Anchorage America/Detroit Pacific/Honolulu America/Indiana/Indianapolis')
add('CA', 'America/Toronto America/Vancouver America/Edmonton America/Winnipeg America/Halifax'); add('MX', 'America/Mexico_City'); add('BR', 'America/Sao_Paulo')
add('AR', 'America/Argentina/Buenos_Aires America/Buenos_Aires'); add('CO', 'America/Bogota'); add('PE', 'America/Lima'); add('CL', 'America/Santiago')
add('NG', 'Africa/Lagos'); add('EG', 'Africa/Cairo'); add('ZA', 'Africa/Johannesburg'); add('KE', 'Africa/Nairobi'); add('MA', 'Africa/Casablanca'); add('GH', 'Africa/Accra')
add('ET', 'Africa/Addis_Ababa'); add('DZ', 'Africa/Algiers'); add('TN', 'Africa/Tunis')
add('AU', 'Australia/Sydney Australia/Melbourne Australia/Brisbane Australia/Perth Australia/Adelaide'); add('NZ', 'Pacific/Auckland')

const names = (() => { try { return new Intl.DisplayNames(['en'], { type: 'region' }) } catch { return null } })()
const flag = (code: string) => String.fromCodePoint(...[...code].map((c) => 127397 + c.charCodeAt(0)))

/** "🇮🇳 India", or "Unknown" for UTC and zones we have not mapped. */
export function countryOf(tz: string | null | undefined): string {
  const code = tz ? ZONES[tz] : undefined
  return code ? `${flag(code)} ${names?.of(code) ?? code}` : 'Unknown'
}

/** "Kolkata" from "Asia/Calcutta"-style names; the old name for Kolkata is shown by its current spelling. */
export function cityOf(tz: string | null | undefined): string | null {
  if (!tz || !tz.includes('/')) return null
  const city = tz.split('/').pop()!.replace(/_/g, ' ')
  const c = city === 'Calcutta' ? 'Kolkata' : city === 'Saigon' ? 'Ho Chi Minh City' : city === 'Kiev' ? 'Kyiv' : city
  const country = countryOf(tz)
  return country === 'Unknown' ? c : `${c}, ${country.replace(/^\S+\s/, '')}`
}
