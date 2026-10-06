/** Decodes any browser-readable image. createImageBitmap first; an <img> element as a fallback for files it refuses. */
async function decode(file: File): Promise<{ source: CanvasImageSource; width: number; height: number }> {
  try {
    const bmp = await createImageBitmap(file)
    return { source: bmp, width: bmp.width, height: bmp.height }
  } catch {
    const url = URL.createObjectURL(file)
    try {
      const img = new Image()
      img.src = url
      await img.decode()
      return { source: img, width: img.naturalWidth, height: img.naturalHeight }
    } finally { URL.revokeObjectURL(url) }
  }
}

/**
 * Converts a photo to WebP in the browser before upload. There is no size limit on what you pick: large images are scaled down to `maxWidth`
 * (never up), and callers can ask for smaller/lighter versions if the storage server rejects one for being too big.
 */
export async function prepareImage(file: File, maxWidth = 2000, quality = 0.86): Promise<{ blob: Blob; ext: string; type: string }> {
  const keep = !file.type.startsWith('image/') || file.type === 'image/svg+xml' || file.type === 'image/gif'
  if (keep) return { blob: file, ext: file.name.split('.').pop()?.toLowerCase() || 'bin', type: file.type || 'application/octet-stream' }
  const { source, width, height } = await decode(file)
  const scale = Math.min(1, maxWidth / width)
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(width * scale)); canvas.height = Math.max(1, Math.round(height * scale))
  canvas.getContext('2d')!.drawImage(source, 0, 0, canvas.width, canvas.height)
  const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/webp', quality))
  if (!blob) return { blob: file, ext: file.name.split('.').pop()?.toLowerCase() || 'png', type: file.type }
  return { blob, ext: 'webp', type: 'image/webp' }
}

/** Progressively lighter versions to try when the server says a file is too big (so any picture ends up uploaded). */
export const SIZE_LADDER: [number, number][] = [[2000, 0.86], [1600, 0.8], [1280, 0.72], [1000, 0.64], [720, 0.55]]
export const isTooBig = (message: string) => /size|large|exceed|limit|413|payload/i.test(message)

export const slugify = (s: string) => s.toLowerCase().replace(/\.[^.]+$/, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'image'
