/** Shrinks and converts photos to WebP in the browser before upload (keeps the free storage quota and the site fast). */
export async function prepareImage(file: File, maxWidth = 1600, quality = 0.86): Promise<{ blob: Blob; ext: string; type: string }> {
  const keep = !file.type.startsWith('image/') || file.type === 'image/svg+xml' || file.type === 'image/gif'
  if (keep) return { blob: file, ext: file.name.split('.').pop()?.toLowerCase() || 'bin', type: file.type || 'application/octet-stream' }
  const bmp = await createImageBitmap(file)
  const scale = Math.min(1, maxWidth / bmp.width)
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bmp.width * scale); canvas.height = Math.round(bmp.height * scale)
  canvas.getContext('2d')!.drawImage(bmp, 0, 0, canvas.width, canvas.height)
  const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/webp', quality))
  if (!blob) return { blob: file, ext: 'png', type: file.type }
  return { blob, ext: 'webp', type: 'image/webp' }
}

export const slugify = (s: string) => s.toLowerCase().replace(/\.[^.]+$/, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'image'
