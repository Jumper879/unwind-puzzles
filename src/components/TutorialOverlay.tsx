import { motion } from 'framer-motion'
import { Mascot } from '../mascot/Mascot'
import { Button } from './Button'
import type { GameTutorial } from '../content/tutorials'

export function TutorialOverlay({
  gameName,
  tutorial,
  onDismiss,
}: {
  gameName: string
  tutorial: GameTutorial
  onDismiss: () => void
}) {
  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/40 sm:items-center">
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="w-full max-w-sm rounded-t-[32px] border border-[var(--color-surface-outline)] bg-[var(--color-surface)] p-6 pb-[calc(env(safe-area-inset-bottom,0px)+24px)] text-center sm:rounded-[32px]"
      >
        <Mascot mood="encouraging" size={80} className="mx-auto" />
        <p className="mt-3 font-[var(--font-heading)] text-xl font-extrabold text-[var(--color-text-primary)]">
          {gameName}
        </p>

        <div className="mt-4 flex flex-col gap-3 text-left">
          <div className="rounded-2xl bg-[var(--color-bg)] px-4 py-3">
            <p className="text-xs font-bold text-[var(--color-text-secondary)]">Goal</p>
            <p className="mt-0.5 text-sm text-[var(--color-text-primary)]">{tutorial.goal}</p>
          </div>
          <div className="rounded-2xl bg-[var(--color-bg)] px-4 py-3">
            <p className="text-xs font-bold text-[var(--color-text-secondary)]">Controls</p>
            <p className="mt-0.5 text-sm text-[var(--color-text-primary)]">{tutorial.controls}</p>
          </div>
        </div>

        <Button variant="primary" className="mt-6 w-full" onClick={onDismiss}>
          Got it
        </Button>
      </motion.div>
    </div>
  )
}
