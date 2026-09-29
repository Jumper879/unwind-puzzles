export const FRUIT_TYPES = 6
export const BOARD_SIZE = 8

export type Difficulty = 'easy' | 'medium' | 'hard'

export type Special = 'none' | 'line-h' | 'line-v' | 'bomb' | 'color'

export interface Cell {
  fruit: number
  special: Special
}

/** null = empty slot mid-resolution, before gravity/refill fills it back in. */
export type Board = (Cell | null)[]

export interface SwapResult {
  valid: boolean
  board: Board
  scoreGained: number
  cascades: number
  clearedCount: number
}
