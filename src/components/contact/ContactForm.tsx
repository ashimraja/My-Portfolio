import { useState, type FormEvent } from 'react'
import { usePortfolio } from '@/content/ContentProvider'
import { submitContact, type ContactPayload } from '@/lib/contact'
import { Button } from '@/components/ui/Button'
import { ElasticLine, useElasticLine } from './ElasticLine'

const fields: { name: keyof ContactPayload; label: string; hint: string; type?: string; required?: boolean; multiline?: boolean; autoComplete?: string }[] = [
  { name: 'name', hint: 'Jane Cooper', label: 'Name', required: true, autoComplete: 'name' },
  { name: 'email', hint: 'jane@studio.com', label: 'Email', type: 'email', required: true, autoComplete: 'email' },
  { name: 'company', hint: 'Studio or company', label: 'Company', autoComplete: 'organization' },
  { name: 'project', hint: 'Project idea', label: 'Project' },
  { name: 'message', hint: 'Tell me about the idea, timeline and budget…', label: 'Message', required: true, multiline: true },
]

export function ContactForm() {
  const portfolio = usePortfolio()
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const payload = Object.fromEntries(new FormData(form)) as unknown as ContactPayload
    setStatus('sending')
    try { const r = await submitContact(payload, portfolio.contact.emailEndpoint); setStatus(r.ok ? 'done' : 'error'); if (r.ok) form.reset() } catch { setStatus('error') }
  }
  const field = 'peer block w-full appearance-none rounded-none border-0 bg-transparent px-0 pb-3 pt-2 font-sans text-xl font-medium leading-tight text-foreground outline-none placeholder:text-muted-foreground/40 focus:outline-none focus-visible:outline-none sm:text-2xl'
  return (
    <form onSubmit={onSubmit} className="grid gap-x-10 gap-y-9 sm:grid-cols-2" aria-describedby="form-note">
      {fields.map((f, n) => <Field key={f.name} f={f} n={n} inputClass={field} />)}
      <div className="flex flex-wrap items-center gap-6 sm:col-span-2">
        <Button type="submit" disabled={status === 'sending'}>{status === 'sending' ? 'Sending…' : 'Send message'}</Button>
        <p id="form-note" role="status" aria-live="polite" className={`text-sm ${status === 'done' ? 'text-accent' : status === 'error' ? 'text-red-400' : 'text-muted-foreground'}`}>
          {status === 'done' ? portfolio.contact.successMessage : status === 'error' ? 'Something went wrong. Please email me directly.' : portfolio.contact.formNote}
        </p>
      </div>
    </form>
  )
}

function Field({ f, n, inputClass }: { f: (typeof fields)[number]; n: number; inputClass: string }) {
  const [active, setActive] = useState(false)
  const line = useElasticLine()
  return (
    <div ref={line.ref} onPointerMove={line.onPointerMove} onPointerLeave={line.onPointerLeave} onFocus={() => setActive(true)} onBlur={() => setActive(false)}
      className={`group relative ${f.multiline ? 'sm:col-span-2' : ''}`}>
      <label htmlFor={f.name} className={`t-label flex items-center gap-3 transition-colors duration-300 ${active ? '!text-foreground' : ''}`}>
        <span className="text-accent">{String(n + 1).padStart(2, '0')}</span>{f.label}{f.required && <span aria-hidden className="text-accent">*</span>}
      </label>
      {f.multiline
        ? <textarea id={f.name} name={f.name} required={f.required} rows={3} placeholder={f.hint} className={`${inputClass} resize-none`} />
        : <input id={f.name} name={f.name} type={f.type ?? 'text'} required={f.required} autoComplete={f.autoComplete} placeholder={f.hint} className={inputClass} />}
      {/* A single string: pulled toward the pointer, springs back; turns accent while the field is active. */}
      <ElasticLine cx={line.cx} cy={line.cy} active={active} />
    </div>
  )
}
