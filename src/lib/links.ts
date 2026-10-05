/** Removes tracking junk such as LinkedIn's “?isSelfProfile=false” (and utm_* params) from a profile link. */
export function cleanHref(href: string) {
  try {
    const u = new URL(href)
    if (/linkedin\.com$/i.test(u.hostname.replace(/^www\./, '')) || [...u.searchParams.keys()].every((k) => /^(utm_|isSelfProfile|originalSubdomain|trk)/i.test(k))) { u.search = ''; u.hash = '' }
    return u.toString().replace(/\/$/, '')
  } catch { return href }
}

/**
 * Text to show for a link. A WhatsApp link would print the phone number, so it shows an action instead
 * (the number is still inside the link itself — remove the link in the dashboard if you don't want it public at all).
 */
export function displayLink(label: string, href: string) {
  if (/whatsapp|wa\.me/i.test(label + href)) return 'Chat on WhatsApp'
  return cleanHref(href).replace(/^https?:\/\/(www\.)?/, '')
}
