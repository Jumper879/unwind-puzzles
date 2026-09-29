export type SudokuSize = 4 | 6 | 9
export type Difficulty = 'easy' | 'medium' | 'hard'

/** Row-major, length size*size. 0 means empty. */
export type Grid = number[]

export interface BoxDims {
  rows: number
  cols: number
}

export interface SudokuPuzzle {
  size: SudokuSize
  puzzle: Grid
  solution: Grid
  difficulty: Difficulty
  seed: string
}
