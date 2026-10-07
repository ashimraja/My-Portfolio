import { track } from '@/lib/analytics'
import { SUPABASE_URL, cloudEnabled, restHeaders } from '@/lib/cloud'

export interface ContactPayload { name: string; email: string; company: string; project: string; message: string }

/**
 * Delivers a contact message two ways, in parallel:
 *  1. Supabase `messages` table → read it in the dashboard (Messages).
 *  2. Email through a Formspree endpoint (`contact.emailEndpoint` in the dashboard).
 * It counts as sent if at least one of them succeeds. With neither configured it only simulates a send.
 */
export async function submitContact(payload: ContactPayload, emailEndpoint?: string): Promise<{ ok: boolean }> {
  const jobs: Promise<boolean>[] = []

  if (cloudEnabled) {
    jobs.push(
      fetch(`${SUPABASE_URL}/rest/v1/messages`, {
        method: 'POST',
        headers: { ...restHeaders(), 'Content-Type': 'application/json', Prefer: 'return=minimal' },
        body: JSON.stringify(payload),
      }).then((r) => r.ok).catch(() => false),
    )
  }
  if (emailEndpoint) {
    jobs.push(
      fetch(emailEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ ...payload, _subject: `New portfolio message from ${payload.name}` }),
      }).then((r) => r.ok).catch(() => false),
    )
  }

  if (!jobs.length) {
    await new Promise((r) => setTimeout(r, 900))
    if (import.meta.env.DEV) console.info('[contact] simulated submit (nothing configured)', payload)
    return { ok: true }
  }
  const ok = (await Promise.all(jobs)).some(Boolean)
  if (ok) track('contact')
  return { ok }
}
