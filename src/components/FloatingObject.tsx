import type { ReactNode, CSSProperties } from 'react'
import { motion } from 'framer-motion'

export interface FloatingObjectSpec {
  id: string
  xPct: number
  yPct: number
  sizePct: number
  src?: string
  svg?: ReactNode
  flipX?: boolean
  blurPx?: number
  floatDuration: number
  floatDelay: number
  rotateDeg: number
  entranceDelay: number
}

export function FloatingObject({
  spec,
  parallax,
  reduceMotion,
}: {
  spec: FloatingObjectSpec
  parallax: { x: number; y: number }
  reduceMotion: boolean
}) {
  const { xPct, yPct, sizePct, src, svg, flipX, blurPx, floatDuration, floatDelay, rotateDeg, entranceDelay } = spec

  const floatStyle: CSSProperties = {
    '--float-duration': `${floatDuration}s`,
    '--float-delay': `${entranceDelay + 0.5 + floatDelay}s`,
    '--float-rotate': `${rotateDeg}deg`,
    filter: blurPx ? `blur(${blurPx}px)` : undefined,
  } as CSSProperties

  return (
    <div
      className="pointer-events-none absolute"
      style={{ left: `${xPct}%`, top: `${yPct}%`, width: `${sizePct}%` }}
    >
      <div className="-translate-x-1/2 -translate-y-1/2">
        <motion.div
          animate={reduceMotion ? undefined : { x: parallax.x, y: parallax.y }}
          transition={{ type: 'spring', stiffness: 50, damping: 18 }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.5,
              delay: entranceDelay,
              type: reduceMotion ? 'tween' : 'spring',
              stiffness: 220,
              damping: 18,
            }}
          >
            <div className={reduceMotion ? undefined : 'unwind-float'} style={floatStyle}>
              <div style={{ transform: flipX ? 'scaleX(-1)' : undefined }}>
                {src ? (
                  <img src={src} alt="" aria-hidden className="w-full select-none" draggable={false} />
                ) : (
                  svg
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
