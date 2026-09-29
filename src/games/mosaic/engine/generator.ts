import { createRng, randomInt, shuffle } from '../../../lib/rng'
import type { CellPattern, Difficulty, MosaicChoice, MosaicPuzzle } from './types'
import { SHAPE_TYPES, SHAPE_VARIANTS, patternSignature } from './types'

const BG_COLORS = [
  'var(--sky-100)',
  'var(--mint-100)',
  'var(--peach-100)',
  'var(--lavender-100)',
  'var(--butter-100)',
  'var(--coral-100)',
]

const SHAPE_COLORS = [
  'var(--sky-600)',
  'var(--mint-600)',
  'var(--peach-600)',
  'var(--lavender-600)',
  'var(--butter-600)',
  'var(--coral-600)',
]

interface DifficultyConfig {
  gridSize: number
  attemptLimit: number
}

const DIFFICULTY_CONFIG: Record<Difficulty, DifficultyConfig> = {
  easy: { gridSize: 3, attemptLimit: 5 },
  medium: { gridSize: 4, attemptLimit: 4 },
  hard: { gridSize: 5, attemptLimit: 3 },
}

export function getDifficultyConfig(difficulty: Difficulty): DifficultyConfig {
  return DIFFICULTY_CONFIG[difficulty]
}

function randomPattern(rng: () => number): CellPattern {
  const shapeType = SHAPE_TYPES[randomInt(rng, SHAPE_TYPES.length)]
  const variants = SHAPE_VARIANTS[shapeType]
  const variant = variants[randomInt(rng, variants.length)]
  const bgColor = BG_COLORS[randomInt(rng, BG_COLORS.length)]
  const shapeColor = SHAPE_COLORS[randomInt(rng, SHAPE_COLORS.length)]
  return { shapeType, variant, bgColor, shapeColor }
}

function altVariant(rng: () => number, pattern: CellPattern): CellPattern | null {
  const variants = SHAPE_VARIANTS[pattern.shapeType]
  const others = variants.filter((v) => v !== pattern.variant)
  if (others.length === 0) return null
  return { ...pattern, variant: others[randomInt(rng, others.length)] }
}

function altColor(rng: () => number, pattern: CellPattern): CellPattern {
  const others = SHAPE_COLORS.filter((c) => c !== pattern.shapeColor)
  return { ...pattern, shapeColor: others[randomInt(rng, others.length)] }
}

/**
 * Builds exactly 3 decoys, each signature-distinct from the correct pattern
 * and from every other decoy (Set-checked, never assumed). Tries the more
 * plausible "near miss" strategies first — a different variant of the same
 * shape, the same shape recolored, a real neighboring cell — before falling
 * back to a fully random reshape, whose combinatorial space is large enough
 * to always terminate well under the guard limit.
 */
function buildDecoys(
  rng: () => number,
  correct: CellPattern,
  neighbors: CellPattern[],
): CellPattern[] {
  const used = new Set([patternSignature(correct)])
  const decoys: CellPattern[] = []

  function tryAdd(candidate: CellPattern | null): void {
    if (!candidate) return
    const sig = patternSignature(candidate)
    if (used.has(sig)) return
    used.add(sig)
    decoys.push(candidate)
  }

  tryAdd(altVariant(rng, correct))
  tryAdd(altColor(rng, correct))
  for (const n of shuffle(rng, neighbors)) {
    if (decoys.length >= 3) break
    tryAdd(n)
  }

  let guard = 0
  while (decoys.length < 3 && guard < 500) {
    guard += 1
    tryAdd(randomPattern(rng))
  }

  return decoys
}

export function generateMosaicPuzzle(difficulty: Difficulty, seed: string): MosaicPuzzle {
  const rng = createRng(seed)
  const { gridSize } = DIFFICULTY_CONFIG[difficulty]

  const grid: CellPattern[][] = []
  for (let r = 0; r < gridSize; r++) {
    const row: CellPattern[] = []
    for (let c = 0; c < gridSize; c++) {
      row.push(randomPattern(rng))
    }
    grid.push(row)
  }

  const missingRow = randomInt(rng, gridSize)
  const missingCol = randomInt(rng, gridSize)
  const correct = grid[missingRow][missingCol]

  const neighborOffsets: [number, number][] = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ]
  const neighbors: CellPattern[] = []
  for (const [dr, dc] of neighborOffsets) {
    const r = missingRow + dr
    const c = missingCol + dc
    if (r >= 0 && r < gridSize && c >= 0 && c < gridSize) {
      neighbors.push(grid[r][c])
    }
  }

  const decoys = buildDecoys(rng, correct, neighbors)
  const choices: MosaicChoice[] = shuffle(rng, [
    { id: 'correct', pattern: correct, correct: true },
    ...decoys.map((pattern, i) => ({ id: `decoy-${i}`, pattern, correct: false })),
  ])

  return { gridSize, grid, missingRow, missingCol, choices }
}
