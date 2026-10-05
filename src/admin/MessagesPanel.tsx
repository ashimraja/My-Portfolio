import { Mail, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { getClient } from './supabase'
import { btnCls } from './ui'

interface Message { id: number; created_at: string; name: string; email: string; company: string | null; project: string | null; message: string; read: boolean }

/** Contact-form inbox (the public form inserts rows into the `messages` table). */
export function MessagesPanel({ onUnread }: { onUnread: (n: number) => void }) {
  const [rows, setRows] = useState<Message[] | null>(null)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    const { data, error: err } = await getClient().from('messages').select('*').order('created_at', { ascending: false })
    if (err) return setError(err.message)
    setRows(data as Message[]); onUnread((data as Message[]).filter((m) => !m.read).length)
  }, [onUnread])
  useEffect(() => { void load() }, [load])

  const toggle = async (m: Message) => { await getClient().from('messages').update({ read: !m.read }).eq('id', m.id); void load() }
  const remove = async (m: Message) => { if (confirm(`Delete the message from ${m.name}?`)) { await getClient().from('messages').delete().eq('id', m.id); void load() } }

  if (error) return <p className="text-red-400">Could not load messages: {error}</p>
  if (!rows) return <p className="text-muted-foreground">Loading…</p>
  if (!rows.length) return <p className="text-muted-foreground">No messages yet. Messages sent from the contact form on your site appear here.</p>
  return (
    <ul className="space-y-3">
      {rows.map((m) => (
        <li key={m.id} className={`rounded-xl border p-4 ${m.read ? 'border-border' : 'border-accent/60 bg-accent/5'}`}>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="font-medium">{m.name} <a className="ml-2 text-sm text-accent underline-offset-2 hover:underline" href={`mailto:${m.email}`}>{m.email}</a></p>
            <p className="text-xs text-muted-foreground">{new Date(m.created_at).toLocaleString()}</p>
          </div>
          {(m.company || m.project) && <p className="mt-1 text-sm text-muted-foreground">{[m.company, m.project].filter(Boolean).join(' · ')}</p>}
          <p className="mt-3 whitespace-pre-wrap text-[0.95rem]">{m.message}</p>
          <div className="mt-3 flex gap-2">
            <button className={btnCls} onClick={() => toggle(m)}><Mail size={14} /> {m.read ? 'Mark unread' : 'Mark read'}</button>
            <button className={btnCls} onClick={() => remove(m)}><Trash2 size={14} /> Delete</button>
          </div>
        </li>
      ))}
    </ul>
  )
}
