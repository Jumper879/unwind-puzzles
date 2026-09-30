/**
 * Reads/writes React Router's own history position — no separate fake
 * history is kept. `window.history.state.idx` is the position React
 * Router's `createBrowserHistory` already stamps on every entry it
 * pushes/replaces; the browser's native back/forward buttons and the
 * phone's back gesture move this same index, so staying in sync with it
 * (rather than counting our own pushes) is what keeps everything — our
 * arrows, the OS back gesture, Telegram's BackButton — pointed at the same
 * position.
 */
export function getHistoryIdx(): number {
  const state = window.history.state as { idx?: number } | null
  return typeof state?.idx === 'number' ? state.idx : 0
}

const BASELINE_KEY = 'unwind:nav:baselineIdx'
const MAX_KEY = 'unwind:nav:maxIdx'

/** The history index Home/the app shell first mounted at this tab session — set once, read on every navigation. Surviving a refresh (sessionStorage) is what lets Back/Forward stay correct "including after a page refresh." */
export function getOrInitBaselineIdx(): number {
  const stored = sessionStorage.getItem(BASELINE_KEY)
  if (stored !== null) return Number(stored)
  const idx = getHistoryIdx()
  sessionStorage.setItem(BASELINE_KEY, String(idx))
  return idx
}

export function getMaxIdx(): number {
  return Number(sessionStorage.getItem(MAX_KEY) ?? String(getOrInitBaselineIdx()))
}

export function bumpMaxIdx(idx: number): number {
  const next = Math.max(getMaxIdx(), idx)
  sessionStorage.setItem(MAX_KEY, String(next))
  return next
}
