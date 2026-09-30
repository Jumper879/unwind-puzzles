import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { LoadingBar } from '../components/LoadingBar'
import { getStartupTasks, runWeightedProgress } from '../lib/loadProgress'

const MIN_DISPLAY_MS = 1200
const TIMEOUT_MS = 10000
const HOLD_AT_FULL_MS = 250

function LoadingDots({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <span className="inline-flex" aria-hidden>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          animate={reduceMotion ? undefined : { opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.18, ease: 'easeInOut' }}
        >
          .
        </motion.span>
      ))}
    </span>
  )
}

/**
 * Real weighted startup progress (fonts, critical images, the player's
 * session — see loadProgress.ts), not a fake timer. Tasks keep running even
 * if the 10s safety timeout fires and hands off to Start early.
 */
export function LoadingScreen({ onFinish }: { onFinish: () => void }) {
  const reduceMotion = useReducedMotion()
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let cancelled = false
    let finished = false
    const startTime = Date.now()

    // Startup fires ~14 near-simultaneous task completions (fonts, session,
    // a dozen image preloads) — committing each one as its own setState was
    // measurably real main-thread cost in a Lighthouse audit (re-render +
    // layout + a restarted width transition per update). Coalescing to at
    // most one commit per animation frame keeps the bar just as responsive
    // while cutting that down to ~60 updates/sec worst case.
    let rafId: number | null = null
    let pendingFraction = 0
    function commitProgress(fraction: number) {
      pendingFraction = fraction
      if (rafId !== null) return
      rafId = requestAnimationFrame(() => {
        rafId = null
        setProgress(pendingFraction)
      })
    }

    function finish() {
      if (finished) return
      finished = true
      clearTimeout(timeoutId)
      if (rafId !== null) cancelAnimationFrame(rafId)
      setProgress(1)
      window.setTimeout(() => {
        if (!cancelled) onFinish()
      }, HOLD_AT_FULL_MS)
    }

    const timeoutId = window.setTimeout(finish, TIMEOUT_MS)

    runWeightedProgress(getStartupTasks(), (fraction) => {
      if (!cancelled && !finished) commitProgress(fraction)
    }).then(() => {
      if (cancelled || finished) return
      const elapsed = Date.now() - startTime
      const remaining = Math.max(0, MIN_DISPLAY_MS - elapsed)
      window.setTimeout(() => {
        if (!cancelled) finish()
      }, remaining)
    })

    return () => {
      cancelled = true
      clearTimeout(timeoutId)
      if (rafId !== null) cancelAnimationFrame(rafId)
    }
  }, [onFinish])

  return (
    <motion.div
      className="fixed inset-0 z-[100] bg-[var(--navy-900)]"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div
        className="absolute left-1/2 w-[78vw] max-w-[340px] -translate-x-1/2 -translate-y-1/2"
        style={{ top: '45%' }}
      >
        <motion.img
          src="/brand/wordmark.webp"
          alt="Unwind Puzzles"
          className="w-full"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.8, ease: 'easeOut' }}
        />

        {!reduceMotion && (
          <>
            <motion.span
              aria-hidden
              className="absolute rounded-full bg-[var(--blue-400)]"
              style={{
                left: '56%',
                top: '41%',
                width: '4%',
                aspectRatio: '1 / 1',
                boxShadow: '0 0 16px 4px var(--blue-400)',
              }}
              initial={{ opacity: 0.35, scale: 0.8 }}
              animate={{ opacity: [0.35, 1, 0.35], scale: [0.8, 1.15, 0.8] }}
              transition={{ duration: 1.5, repeat: 1, ease: 'easeInOut', delay: 0.55 }}
            />

            <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
              <motion.span
                className="absolute left-0 top-[30%] h-[3px] w-1/2 rounded-full bg-gradient-to-r from-transparent via-[var(--blue-400)] to-transparent"
                initial={{ x: '-40%', opacity: 0 }}
                animate={{ x: ['-40%', '140%'], opacity: [0, 1, 0] }}
                transition={{ duration: 1.1, delay: 0.9, ease: 'easeInOut' }}
              />
              <motion.span
                className="absolute left-0 top-[62%] h-[3px] w-1/3 rounded-full bg-gradient-to-r from-transparent via-[var(--blue-300)] to-transparent"
                initial={{ x: '-40%', opacity: 0 }}
                animate={{ x: ['-40%', '160%'], opacity: [0, 1, 0] }}
                transition={{ duration: 1.1, delay: 1.05, ease: 'easeInOut' }}
              />
            </div>
          </>
        )}
      </div>

      <p
        className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap font-[var(--font-heading)] text-[20px] font-extrabold text-white"
        style={{ top: '87%' }}
      >
        Loading
        <LoadingDots reduceMotion={Boolean(reduceMotion)} />
      </p>

      <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ top: '91%' }}>
        <LoadingBar progress={progress} />
      </div>
    </motion.div>
  )
}
