import type { Difficulty, DirectionVector } from './types'

const E: DirectionVector = { dRow: 0, dCol: 1 }
const W: DirectionVector = { dRow: 0, dCol: -1 }
const S: DirectionVector = { dRow: 1, dCol: 0 }
const N: DirectionVector = { dRow: -1, dCol: 0 }
const SE: DirectionVector = { dRow: 1, dCol: 1 }
const SW: DirectionVector = { dRow: 1, dCol: -1 }
const NE: DirectionVector = { dRow: -1, dCol: 1 }
const NW: DirectionVector = { dRow: -1, dCol: -1 }

export interface DifficultyConfig {
  size: number
  directions: DirectionVector[]
  wordCount: number
}

// easy: → ↓ only, per PLAN.md. hard: all 8, incl. backwards/diagonals.
// medium sits between: adds diagonals but no reversed straight lines.
export const DIFFICULTY_CONFIG: Record<Difficulty, DifficultyConfig> = {
  easy: { size: 10, directions: [E, S], wordCount: 6 },
  medium: { size: 12, directions: [E, S, SE, SW, NE, NW], wordCount: 8 },
  hard: { size: 14, directions: [E, S, SE, SW, NE, NW, W, N], wordCount: 10 },
}
