export const cn = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ')
export const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t
export const mapRange = (v: number, a: number, b: number, c: number, d: number) => c + ((v - a) / (b - a)) * (d - c)

/** Splits "I build *digital products*" into plain / emphasised segments. */
export function parseEmphasis(text: string): { text: string; em: boolean }[] {
  return text
    .split(/(\*[^*]+\*)/g)
    .filter(Boolean)
    .map((s) => (s.startsWith('*') ? { text: s.slice(1, -1), em: true } : { text: s, em: false }))
}

export function rafThrottle<A extends unknown[]>(fn: (...a: A) => void) {
  let frame = 0
  let last: A
  return (...args: A) => {
    last = args
    if (frame) return
    frame = requestAnimationFrame(() => { frame = 0; fn(...last) })
  }
}
