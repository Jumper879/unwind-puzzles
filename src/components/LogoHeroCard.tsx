import { motion, useReducedMotion } from 'framer-motion'
import { BrandLogo } from './BrandLogo'
import { currentGreeting } from '../lib/greeting'

/**
 * The dot overlay's position, as a fraction of the rendered logo's own box
 * — measured directly from the source art (see PLAN.md's Phase 10 report),
 * not eyeballed. The base `<BrandLogo>` already bakes the dot in (it's a
 * flat two-color raster); this transparent copy sits exactly on top of it
 * so just the dot can "breathe" independently.
 */
const DOT_POSITION = { left: '68.35%', top: '15.17%', width: '6.3%', height: '23.7%' }

function Swooshes() {
  return (
    <>
      <svg
        className="pointer-events-none absolute bottom-0 left-0 h-16 w-16"
        viewBox="0 0 100 100"
        aria-hidden
      >
        <path
          d="M-10 70 Q 30 70 30 40"
          stroke="var(--blue-500)"
          strokeOpacity="0.25"
          strokeWidth="10"
          fill="none"
          strokeLinecap="round"
        />
      </svg>
      <svg
        className="pointer-events-none absolute right-0 top-0 h-16 w-16"
        viewBox="0 0 100 100"
        aria-hidden
      >
        <path
          d="M110 30 Q 70 30 70 60"
          stroke="var(--blue-500)"
          strokeOpacity="0.25"
          strokeWidth="10"
          fill="none"
          strokeLinecap="round"
        />
      </svg>
    </>
  )
}

export function LogoHeroCard() {
  const reduceMotion = useReducedMotion()
  const greeting = currentGreeting()

  return (
    <motion.div
      className="relative overflow-hidden rounded-[20px] border-[2.5px] border-[var(--home-ink)] px-4 py-[22px] shadow-[4px_4px_0_var(--blue-500)]"
      style={{ background: 'var(--hero-card-bg)' }}
      initial={{ opacity: 0, y: reduceMotion ? 0 : 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Swooshes />

      <div className="relative mx-auto w-[78%] max-w-[300px]">
        <BrandLogo variant="horizontal" tone="white" className="w-full" />
        {!reduceMotion && (
          <motion.img
            src="/brand/logo-dot.webp"
            alt=""
            aria-hidden
            className="absolute"
            style={DOT_POSITION}
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 1.4, delay: 0.5, ease: 'easeInOut' }}
          />
        )}
      </div>

      <p className="relative mt-2.5 text-center font-[var(--font-heading)] text-[15px] font-bold text-white opacity-75">
        {greeting}
      </p>
    </motion.div>
  )
}
