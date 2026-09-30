import { motion, useReducedMotion } from 'framer-motion'

/**
 * `progress` is 0-1 and must already be monotonically non-decreasing — this
 * component just renders it, it doesn't own the progress logic (see
 * src/lib/loadProgress.ts and LoadingScreen).
 */
export function LoadingBar({ progress }: { progress: number }) {
  const reduceMotion = useReducedMotion()
  const pct = Math.round(progress * 100)

  return (
    <div
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Loading"
      className="relative h-[26px] w-[63vw] min-w-[220px] max-w-[300px] overflow-hidden rounded-full border-[2.5px] border-white"
      style={{ background: 'var(--color-loading-track)' }}
    >
      <motion.div
        className="absolute inset-y-0 left-0 rounded-full"
        style={{
          background: 'var(--blue-500)',
          boxShadow: reduceMotion ? undefined : '0 0 16px rgba(31, 97, 250, 0.45)',
        }}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: reduceMotion ? 0 : 0.45, ease: 'easeOut' }}
      >
        <div
          className="absolute inset-x-1 top-[3px] h-[30%] rounded-full"
          style={{ background: 'linear-gradient(to bottom, rgb(255 255 255 / 35%), transparent)' }}
          aria-hidden
        />
      </motion.div>
    </div>
  )
}
