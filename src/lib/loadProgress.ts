import { useSessionStore } from '../state/useSessionStore'

export interface LoadTask {
  weight: number
  run: () => Promise<void>
}

/** Resolves once the image has loaded (or failed) — a broken/missing image never hangs progress. */
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve()
    img.onerror = () => resolve()
    img.src = src
  })
}

function waitForFonts(): Promise<void> {
  if (typeof document === 'undefined' || !document.fonts?.ready) return Promise.resolve()
  return document.fonts.ready.then(() => undefined)
}

/** Resolves once the guest/platform session has resolved, one way or the other. */
function waitForSession(): Promise<void> {
  const state = useSessionStore.getState()
  if (state.status === 'ready' || state.status === 'error') return Promise.resolve()
  return new Promise((resolve) => {
    const unsubscribe = useSessionStore.subscribe((s) => {
      if (s.status === 'ready' || s.status === 'error') {
        unsubscribe()
        resolve()
      }
    })
  })
}

const CRITICAL_IMAGES = [
  '/brand/wordmark.webp',
  '/brand/logo-horizontal-onlight.webp',
  '/brand/logo-horizontal-dark.webp',
  '/brand/start/mascot-3d.webp',
  '/brand/start/obj-pawn.webp',
  '/brand/start/obj-puzzle.webp',
  '/brand/start/obj-cross.webp',
  '/brand/start/obj-ring.webp',
  '/brand/start/obj-wifi.webp',
  '/brand/start/obj-orange.webp',
  '/brand/start/obj-tile-8.webp',
  '/brand/start/obj-tile-a.webp',
  '/brand/start/obj-triangle.webp',
  '/brand/start/obj-ball.webp',
]

/**
 * The real startup task list: fonts settling, every critical image actually
 * decoding, and the player's session resolving. Each task is weighted
 * equally — there's no basis yet (no real-world timing data) for weighting
 * one higher than another, so equal weight is the honest default rather
 * than an invented number.
 */
export function getStartupTasks(): LoadTask[] {
  return [
    { weight: 1, run: waitForFonts },
    { weight: 1, run: waitForSession },
    ...CRITICAL_IMAGES.map((src) => ({ weight: 1, run: () => preloadImage(src) })),
  ]
}

/**
 * Runs every task, reporting cumulative weighted progress (0-1) as each
 * settles. A task's own failure never rejects the whole batch — loading
 * always reaches 1 eventually, which is what lets the 10s caller-side
 * timeout in LoadingScreen just be a safety net, not the normal path.
 */
export function runWeightedProgress(tasks: LoadTask[], onProgress: (fraction: number) => void): Promise<void> {
  const totalWeight = tasks.reduce((sum, t) => sum + t.weight, 0)
  if (totalWeight === 0) {
    onProgress(1)
    return Promise.resolve()
  }
  let completed = 0
  onProgress(0)
  return Promise.all(
    tasks.map((t) =>
      t
        .run()
        .catch(() => undefined)
        .then(() => {
          completed += t.weight
          onProgress(Math.min(1, completed / totalWeight))
        }),
    ),
  ).then(() => undefined)
}
