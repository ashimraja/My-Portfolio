import { useSyncExternalStore } from 'react'

/** Tiny store: flips true once the name intro has lifted, so page animations can wait for it. */
let done = false
const subs = new Set<() => void>()
export const markIntroDone = () => { done = true; subs.forEach((s) => s()) }
export const useIntroDone = () => useSyncExternalStore((cb) => { subs.add(cb); return () => { subs.delete(cb) } }, () => done, () => done)
