import { ImagePlus, X } from 'lucide-react'
import { useRef, useState } from 'react'
import { BUCKET, getClient } from './supabase'
import { prepareImage, slugify } from './image'
import { btnCls, inputCls } from './ui'

/** Image URL + preview + upload to the Supabase `portfolio` storage bucket. */
export function ImageField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const file = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const upload = async (f: File) => {
    setBusy(true); setError('')
    try {
      const { blob, ext, type } = await prepareImage(f)
      const path = `uploads/${Date.now()}-${slugify(f.name)}.${ext}`
      const sb = getClient()
      const { error: err } = await sb.storage.from(BUCKET).upload(path, blob, { contentType: type, cacheControl: '31536000', upsert: false })
      if (err) throw err
      onChange(sb.storage.from(BUCKET).getPublicUrl(path).data.publicUrl)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed')
    } finally { setBusy(false); if (file.current) file.current.value = '' }
  }

  return (
    <div className="flex gap-3">
      <div className="flex h-[4.5rem] w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-background">
        {value ? <img src={value} alt="" className="h-full w-full object-cover" /> : <ImagePlus size={20} className="text-muted-foreground" />}
      </div>
      <div className="min-w-0 flex-1 space-y-2">
        <input className={inputCls} value={value} onChange={(e) => onChange(e.target.value)} placeholder="https://… or upload" />
        <div className="flex flex-wrap items-center gap-2">
          <input ref={file} type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
          <button type="button" className={btnCls} disabled={busy} onClick={() => file.current?.click()}>{busy ? 'Uploading…' : 'Upload image'}</button>
          {value && <button type="button" className={btnCls} onClick={() => onChange('')} aria-label="Remove image"><X size={14} /> Remove</button>}
          {error && <span className="text-xs text-red-400">{error}</span>}
        </div>
      </div>
    </div>
  )
}
