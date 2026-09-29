import { motion, useReducedMotion } from 'framer-motion'
import type { MascotMood } from './types'

interface MascotProps {
  mood?: MascotMood
  size?: number
  className?: string
}

const NAVY = '#04073A'
const BLUE = '#1F61FA'
const CREAM = '#FFFFFF'

/**
 * Hand-built SVG recreation of the brand mascot (a fluffy cloud-face with a
 * curl and two little "wind hand" swooshes), not a raster trace — so it can
 * carry mood variants and idle animation. The cloud silhouette is a cluster
 * of overlapping same-color circles (the classic cloud-icon trick) rather
 * than one hand-fitted bezier path.
 */
export function Mascot({ mood = 'relaxed', size = 120, className }: MascotProps) {
  const reduceMotion = useReducedMotion()

  return (
    <motion.svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label={`Unwind Puzzles mascot, ${mood}`}
      animate={reduceMotion ? undefined : { y: [0, -3, 0] }}
      transition={reduceMotion ? undefined : { duration: 4, repeat: Infinity, ease: 'easeInOut' }}
    >
      {/* wind-hand swooshes */}
      <MascotHands mood={mood} reduceMotion={Boolean(reduceMotion)} />

      {/* curl */}
      <motion.path
        d="M100 62 C 96 40, 108 22, 126 26 C 140 29, 142 46, 130 50 C 122 53, 116 46, 121 40"
        fill="none"
        stroke={BLUE}
        strokeWidth={11}
        strokeLinecap="round"
        style={{ transformOrigin: '100px 62px' }}
        animate={reduceMotion ? undefined : { rotate: [-4, 4, -4] }}
        transition={reduceMotion ? undefined : { duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* cloud head, built from overlapping circles */}
      <g fill={CREAM}>
        <circle cx="78" cy="78" r="30" />
        <circle cx="122" cy="78" r="30" />
        <circle cx="100" cy="64" r="24" />
        <circle cx="60" cy="104" r="24" />
        <circle cx="140" cy="104" r="24" />
        <ellipse cx="100" cy="118" rx="56" ry="44" />
      </g>

      <MascotFace mood={mood} reduceMotion={Boolean(reduceMotion)} />
    </motion.svg>
  )
}

function MascotHands({ mood, reduceMotion }: { mood: MascotMood; reduceMotion: boolean }) {
  const raised = mood === 'celebrating'
  const wave = reduceMotion ? undefined : { rotate: raised ? [0, -12, 0] : [0, -6, 0] }
  const transition = { duration: 1.6, repeat: Infinity, ease: 'easeInOut' as const }

  return (
    <>
      <motion.g
        stroke={BLUE}
        strokeWidth={9}
        strokeLinecap="round"
        fill="none"
        style={{ transformOrigin: '48px 108px' }}
        animate={wave}
        transition={transition}
      >
        <path d="M44 118 C 34 112, 30 102, 34 92" />
        <path d="M56 112 C 48 106, 45 98, 48 90" />
      </motion.g>
      <motion.g
        stroke={BLUE}
        strokeWidth={9}
        strokeLinecap="round"
        fill="none"
        style={{ transformOrigin: '152px 108px' }}
        animate={wave}
        transition={{ ...transition, delay: 0.15 }}
      >
        <path d="M156 118 C 166 112, 170 102, 166 92" />
        <path d="M144 112 C 152 106, 155 98, 152 90" />
      </motion.g>
    </>
  )
}

function MascotFace({ mood, reduceMotion }: { mood: MascotMood; reduceMotion: boolean }) {
  const blink = reduceMotion ? undefined : { scaleY: [1, 1, 0.1, 1, 1] }
  const blinkTransition = {
    duration: 3.6,
    repeat: Infinity,
    repeatDelay: 1.4,
    ease: 'easeInOut' as const,
  }

  if (mood === 'sleepy') {
    return (
      <g stroke={NAVY} strokeWidth={6} strokeLinecap="round" fill="none">
        <path d="M76 116 q8 -6 16 0" />
        <path d="M108 116 q8 -6 16 0" />
        <path d="M92 136 q8 5 16 0" fill="none" />
        <text x="146" y="72" fontSize="16" fill={BLUE} fontFamily="var(--font-heading)">
          z
        </text>
      </g>
    )
  }

  const leftEye =
    mood === 'celebrating' ? (
      <path
        d="M76 116 q6 -8 12 0"
        stroke={NAVY}
        strokeWidth={6}
        strokeLinecap="round"
        fill="none"
      />
    ) : (
      <motion.ellipse
        cx={84}
        cy={116}
        rx={7}
        ry={9}
        fill={NAVY}
        style={{ transformOrigin: '84px 116px' }}
        animate={blink}
        transition={blinkTransition}
      />
    )

  const rightEye =
    mood === 'thinking' ? (
      <path
        d="M112 118 q8 4 16 -1"
        stroke={NAVY}
        strokeWidth={6}
        strokeLinecap="round"
        fill="none"
      />
    ) : (
      // the signature wink
      <path
        d="M112 114 q8 -8 16 0"
        stroke={NAVY}
        strokeWidth={6}
        strokeLinecap="round"
        fill="none"
      />
    )

  const mouth =
    mood === 'celebrating' ? (
      <path
        d="M88 134 q12 12 24 0"
        stroke={NAVY}
        strokeWidth={6}
        strokeLinecap="round"
        fill="none"
      />
    ) : mood === 'thinking' ? (
      <path
        d="M92 138 q10 2 18 -1"
        stroke={NAVY}
        strokeWidth={6}
        strokeLinecap="round"
        fill="none"
      />
    ) : mood === 'encouraging' ? (
      <path
        d="M90 134 q10 8 22 2"
        stroke={NAVY}
        strokeWidth={6}
        strokeLinecap="round"
        fill="none"
      />
    ) : (
      <path
        d="M90 132 q10 9 22 2"
        stroke={NAVY}
        strokeWidth={6}
        strokeLinecap="round"
        fill="none"
      />
    )

  return (
    <g>
      {leftEye}
      {rightEye}
      {mouth}
    </g>
  )
}
