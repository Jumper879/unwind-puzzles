import { motion } from 'framer-motion'
import { Mascot } from '../mascot/Mascot'
import { Stars } from './Stars'
import { Button } from './Button'
import type { MascotMood } from '../mascot/types'

export function ResultSheet({
  stars,
  score,
  timeMs,
  isNewBest,
  message,
  onReplay,
  onHome,
}: {
  stars: 0 | 1 | 2 | 3
  score: number
  timeMs: number
  isNewBest: boolean
  message: string
  onReplay: () => void
  onHome: () => void
}) {
  const mood: MascotMood = stars >= 2 ? 'celebrating' : stars >= 1 ? 'encouraging' : 'encouraging'
  const seconds = (timeMs / 1000).toFixed(1)

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/40 sm:items-center">
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="w-full max-w-sm rounded-t-[32px] border border-[var(--color-surface-outline)] bg-[var(--color-surface)] p-6 pb-[calc(env(safe-area-inset-bottom,0px)+24px)] text-center sm:rounded-[32px]"
      >
        <Mascot mood={mood} size={88} className="mx-auto" />
        <p className="mt-3 font-[var(--font-heading)] text-xl font-extrabold text-[var(--color-text-primary)]">
          {message}
        </p>
        <div className="mt-4 flex justify-center">
          <Stars count={stars} />
        </div>

        {isNewBest && (
          <span className="mt-3 inline-block rounded-full bg-[var(--color-accent-soft)] px-3 py-1 text-xs font-bold text-[var(--color-accent-strong)]">
            New personal best!
          </span>
        )}

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-[var(--color-bg)] px-3 py-2.5">
            <p className="text-xs text-[var(--color-text-secondary)]">Score</p>
            <p className="font-[var(--font-heading)] text-lg font-bold text-[var(--color-text-primary)]">
              {score}
            </p>
          </div>
          <div className="rounded-2xl bg-[var(--color-bg)] px-3 py-2.5">
            <p className="text-xs text-[var(--color-text-secondary)]">Time</p>
            <p className="font-[var(--font-heading)] text-lg font-bold text-[var(--color-text-primary)]">
              {seconds}s
            </p>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <Button variant="surface" className="flex-1" onClick={onHome}>
            Home
          </Button>
          <Button variant="primary" className="flex-1" onClick={onReplay}>
            Play again
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
