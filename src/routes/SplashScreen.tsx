import { useEffect } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

const SPLASH_DURATION_MS = 2200

/**
 * Animated splash over the flat wordmark.png: fade + upward drift for the
 * mark itself, a small glowing overlay that "breathes" roughly where the
 * puzzle-piece dot sits, and two soft light sweeps across it once. The
 * source is a flat raster, so the dot/sweep are separate overlay elements
 * positioned by percentage rather than a masked cutout of the artwork.
 */
export function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    if (reduceMotion) {
      onFinish()
      return
    }
    const t = setTimeout(onFinish, SPLASH_DURATION_MS)
    return () => clearTimeout(t)
  }, [reduceMotion, onFinish])

  if (reduceMotion) return null

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[var(--navy-900)]"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative w-[68vw] max-w-[340px]">
        <motion.img
          src="/brand/wordmark.webp"
          alt="Unwind Puzzles"
          className="w-full"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />

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
      </div>
    </motion.div>
  )
}
