import { AnimatePresence, motion } from 'framer-motion'

export function Toast({ message, visible }: { message: string; visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="status"
          className="fixed left-1/2 z-[85] -translate-x-1/2 rounded-full bg-[var(--home-ink)] px-4 py-2 text-sm font-bold text-[var(--home-surface)] shadow-[0_8px_18px_rgb(0_0_0_/_25%)]"
          style={{ bottom: 'calc(64px + env(safe-area-inset-bottom, 0px) + 14px)' }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.2 }}
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
