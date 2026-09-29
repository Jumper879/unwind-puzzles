export type Difficulty = 'easy' | 'medium' | 'hard'

/**
 * Each shape type has its own fixed, hand-authored list of variants. Variants
 * of the same shape are drawn with genuinely different geometry (a wedge in
 * a different corner, a triangle pointing a different way) — so "different
 * variant" always means "visually different render," no rotation/mirror math
 * required to prove it.
 */
export type ShapeType = 'wedge' | 'triangle' | 'halfCircle' | 'diamond' | 'dot'

export const SHAPE_VARIANTS: Record<ShapeType, string[]> = {
  wedge: ['tl', 'tr', 'br', 'bl'],
  triangle: ['up', 'right', 'down', 'left'],
  halfCircle: ['top', 'right', 'bottom', 'left'],
  diamond: ['small', 'large'],
  dot: ['small', 'large'],
}

export const SHAPE_TYPES = Object.keys(SHAPE_VARIANTS) as ShapeType[]

export interface CellPattern {
  shapeType: ShapeType
  variant: string
  bgColor: string
  shapeColor: string
}

export interface MosaicChoice {
  id: string
  pattern: CellPattern
  correct: boolean
}

export interface MosaicPuzzle {
  gridSize: number
  grid: CellPattern[][]
  missingRow: number
  missingCol: number
  choices: MosaicChoice[]
}

export function patternSignature(p: CellPattern): string {
  return `${p.shapeType}:${p.variant}:${p.bgColor}:${p.shapeColor}`
}
