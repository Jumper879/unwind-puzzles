export type Difficulty = 'easy' | 'medium' | 'hard'

export interface DirectionVector {
  dRow: number
  dCol: number
}

export interface WordPlacement {
  word: string
  row: number
  col: number
  direction: DirectionVector
  /** Cell indices (row*size+col) the word occupies, in order, for hit-testing a drag selection. */
  cells: number[]
}

export interface WordSearchPuzzle {
  size: number
  /** Flat, row-major array of single uppercase letters. */
  grid: string[]
  placements: WordPlacement[]
  theme: string
  seed: string
}
