import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { BrandLogo } from '../components/BrandLogo'
import { FloatingObject, type FloatingObjectSpec } from '../components/FloatingObject'
import { CubeIcon } from '../components/CubeIcon'
import { usePlatform } from '../platform/PlatformProvider'

const OBJECTS: FloatingObjectSpec[] = [
  { id: 'pawn', xPct: 25, yPct: 32, sizePct: 11, src: '/brand/start/obj-pawn.webp', floatDuration: 3.4, floatDelay: 0.1, rotateDeg: 5, entranceDelay: 0.65 },
  { id: 'puzzle', xPct: 72, yPct: 33, sizePct: 15, src: '/brand/start/obj-puzzle.webp', floatDuration: 4.1, floatDelay: 0.4, rotateDeg: 6, entranceDelay: 0.7 },
  { id: 'x', xPct: 12, yPct: 40, sizePct: 10, src: '/brand/start/obj-cross.webp', floatDuration: 3.0, floatDelay: 0.7, rotateDeg: 4, entranceDelay: 0.75 },
  { id: 'o', xPct: 88, yPct: 41, sizePct: 10, src: '/brand/start/obj-ring.webp', floatDuration: 3.7, floatDelay: 0.2, rotateDeg: 5, entranceDelay: 0.8 },
  { id: 'swoosh-left', xPct: 15, yPct: 49, sizePct: 16, src: '/brand/start/obj-wifi.webp', floatDuration: 3.9, floatDelay: 0.5, rotateDeg: 3, entranceDelay: 0.85 },
  { id: 'swoosh-right', xPct: 79, yPct: 48, sizePct: 12, src: '/brand/start/obj-wifi.webp', flipX: true, floatDuration: 3.3, floatDelay: 0.9, rotateDeg: 3, entranceDelay: 0.9 },
  { id: 'orange', xPct: 87, yPct: 55, sizePct: 9, src: '/brand/start/obj-orange.webp', floatDuration: 2.8, floatDelay: 0.3, rotateDeg: 5, entranceDelay: 0.95 },
  { id: 'cube', xPct: 17, yPct: 60, sizePct: 5, svg: <CubeIcon />, floatDuration: 3.6, floatDelay: 0.6, rotateDeg: 8, entranceDelay: 1.0 },
  { id: 'triangle', xPct: 74, yPct: 64, sizePct: 5, src: '/brand/start/obj-triangle.webp', floatDuration: 4.4, floatDelay: 0.1, rotateDeg: 8, entranceDelay: 1.05 },
  { id: 'tile-8', xPct: 24, yPct: 67, sizePct: 12, src: '/brand/start/obj-tile-8.webp', floatDuration: 3.2, floatDelay: 0.8, rotateDeg: 4, entranceDelay: 1.1 },
  { id: 'tile-a', xPct: 82, yPct: 71, sizePct: 12, src: '/brand/start/obj-tile-a.webp', floatDuration: 4.0, floatDelay: 0.4, rotateDeg: 4, entranceDelay: 1.15 },
  { id: 'ball', xPct: 12, yPct: 73, sizePct: 5, src: '/brand/start/obj-ball.webp', blurPx: 1, floatDuration: 3.5, floatDelay: 0.2, rotateDeg: 6, entranceDelay: 1.2 },
]

function Waves() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 390 844"
      preserveAspectRatio="none"
      aria-hidden
    >
      <path
        d="M-40 380 C 80 320, 160 440, 280 380 S 460 340, 520 400 L 520 844 L -40 844 Z"
        fill="#dde7ff"
        opacity="0.7"
      />
      <path
        d="M-40 520 C 100 470, 200 560, 320 500 S 480 470, 520 520 L 520 844 L -40 844 Z"
        fill="#dde7ff"
        opacity="0.55"
      />
    </svg>
  )
}

export function StartScreen({ onStart }: { onStart: () => void }) {
  const reduceMotion = useReducedMotion()
  const platform = usePlatform()
  const containerRef = useRef<HTMLDivElement>(null)
  const [parallax, setParallax] = useState({ x: 0, y: 0 })

  useEffect(() => {
    if (reduceMotion) return
    function handlePointerMove(e: PointerEvent) {
      const el = containerRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const nx = (e.clientX - rect.left) / rect.width - 0.5
      const ny = (e.clientY - rect.top) / rect.height - 0.5
      setParallax({ x: Math.max(-8, Math.min(8, nx * 16)), y: Math.max(-8, Math.min(8, ny * 16)) })
    }
    const el = containerRef.current
    el?.addEventListener('pointermove', handlePointerMove)
    return () => el?.removeEventListener('pointermove', handlePointerMove)
  }, [reduceMotion])

  function handleStart() {
    platform.haptics.impact('light')
    onStart()
  }

  return (
    <motion.div
      ref={containerRef}
      className="fixed inset-0 z-[90] overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #f3f7ff, #eaf1ff)' }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Waves />

      <motion.div
        className="absolute left-1/2 w-[78vw] max-w-[320px] -translate-x-1/2"
        style={{ top: '7%' }}
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: reduceMotion ? 0 : 0 }}
      >
        <BrandLogo variant="wordmark" tone="blue" />
      </motion.div>

      <motion.p
        className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-center font-[var(--font-heading)] text-[18px] font-bold text-[var(--navy-900)]"
        style={{ top: '22%' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: reduceMotion ? 0 : 0.25 }}
      >
        Puzzles for your quiet moments.
      </motion.p>

      <motion.div
        className="absolute left-1/2 top-[75%] h-8 w-[36%] max-w-[160px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ background: 'rgb(47 107 255 / 18%)', filter: 'blur(20px)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: reduceMotion ? 0 : 0.45 }}
        aria-hidden
      />

      <motion.div
        className="absolute left-1/2 w-[52vw] max-w-[240px] -translate-x-1/2 -translate-y-1/2"
        style={{ top: '50%' }}
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.45, type: reduceMotion ? 'tween' : 'spring', stiffness: 200, damping: 16 }}
      >
        {/* Idle bob is plain CSS (see .unwind-float in index.css), not a Framer
            repeat:Infinity loop — same main-thread-cost reason as the floating
            objects below. */}
        <div
          className={reduceMotion ? undefined : 'unwind-float'}
          style={
            {
              '--float-duration': '3.2s',
              '--float-delay': '1s',
              '--float-rotate': '2deg',
            } as React.CSSProperties
          }
        >
          <img src="/brand/start/mascot-3d.webp" alt="" aria-hidden className="w-full select-none" draggable={false} />
        </div>
      </motion.div>

      {OBJECTS.map((spec) => (
        <FloatingObject key={spec.id} spec={spec} parallax={parallax} reduceMotion={Boolean(reduceMotion)} />
      ))}

      <motion.button
        type="button"
        onClick={handleStart}
        className="absolute left-1/2 flex h-16 w-[72vw] max-w-[320px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full font-[var(--font-heading)] text-2xl font-extrabold text-white"
        style={{
          top: '86%',
          background: 'linear-gradient(180deg, #4a80ff, var(--blue-500))',
          boxShadow: '0 12px 28px rgb(47 107 255 / 35%), inset 0 -3px 0 rgb(0 0 0 / 12%), inset 0 2px 0 rgb(255 255 255 / 30%)',
        }}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: reduceMotion ? 0 : 1.0 }}
        whileTap={reduceMotion ? { opacity: 0.85 } : { scale: 0.96 }}
      >
        Start Playing
      </motion.button>
    </motion.div>
  )
}
