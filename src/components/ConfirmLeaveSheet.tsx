import { motion } from 'framer-motion'
import { Button } from './Button'

export function ConfirmLeaveSheet({
  onLeave,
  onKeepPlaying,
}: {
  onLeave: () => void
  onKeepPlaying: () => void
}) {
  return (
    <div className="fixed inset-0 z-[95] flex items-end justify-center bg-black/40 sm:items-center">
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="w-full max-w-sm rounded-t-[32px] border border-[var(--color-surface-outline)] bg-[var(--color-surface)] p-6 pb-[calc(env(safe-area-inset-bottom,0px)+24px)] text-center sm:rounded-[32px]"
      >
        <p className="font-[var(--font-heading)] text-lg font-extrabold text-[var(--color-text-primary)]">
          Leave this puzzle?
        </p>
        <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
          Your current round won't be saved.
        </p>

        <div className="mt-6 flex gap-3">
          <Button variant="surface" className="flex-1" onClick={onKeepPlaying}>
            Keep playing
          </Button>
          <Button variant="primary" className="flex-1" onClick={onLeave}>
            Leave
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
