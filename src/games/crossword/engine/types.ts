export type Difficulty = 'easy' | 'medium' | 'hard'

/** A block-layout template: which cells are filled vs. blocked. '#' = block, '.' = fillable. Rows are strings of equal length. */
export interface GridTemplate {
  id: string
  rows: string[]
}

export interface Slot {
  /** Clue number shown in the grid (standard crossword numbering: assigned left-to-right, top-to-bottom to any fillable cell that starts an across and/or down run). */
  number: number
  direction: 'across' | 'down'
  /** Cell indices (row*width+col), in order. */
  cells: number[]
  length: number
  /** Filled in by the generator once a word is placed — undefined only transiently during generation. */
  clue?: string
}

export interface WordEntry {
  word: string
  clue: string
}

export interface CrosswordPuzzle {
  width: number
  height: number
  /** Row-major; null = block. */
  solution: (string | null)[]
  slots: Slot[]
  seed: string
  difficulty: Difficulty
}
