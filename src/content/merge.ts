const isObject = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)

/** Deep-merge `over` onto `base`. Objects merge key by key (so new default fields survive older saved data); arrays and primitives are replaced. */
export function mergeDeep<T>(base: T, over: unknown): T {
  if (over === undefined || over === null) return base
  if (isObject(base) && isObject(over)) {
    const out: Record<string, unknown> = { ...base }
    for (const k of Object.keys(over)) out[k] = mergeDeep((base as Record<string, unknown>)[k], over[k])
    return out as T
  }
  return over as T
}
