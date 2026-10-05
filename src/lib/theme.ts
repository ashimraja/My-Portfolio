const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i

const expand = (h: string) => (h.length === 4 ? `#${h[1]}${h[1]}${h[2]}${h[2]}${h[3]}${h[3]}` : h)

const luminance = (hex: string) => {
  const n = parseInt(expand(hex).slice(1), 16)
  const lin = (c: number) => { const v = c / 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4 }
  return 0.2126 * lin((n >> 16) & 255) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255)
}

/** Text colour with the better contrast on top of `hex`: the site's near-black, or white. */
export function onColor(hex: string) {
  const dark = '#14130f'
  const l = luminance(hex)
  const ratio = (a: number, b: number) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
  return ratio(l, luminance(dark)) >= ratio(l, 1) ? dark : '#ffffff'
}

/** Sets the site's primary (accent) colour. Invalid values are ignored so a typo can never break the page. */
export function applyAccent(hex?: string) {
  const root = document.documentElement
  if (!hex || !HEX.test(hex)) { root.style.removeProperty('--accent'); root.style.removeProperty('--accent-foreground'); return }
  root.style.setProperty('--accent', expand(hex))
  root.style.setProperty('--accent-foreground', onColor(hex))
}
