export type Mark = 'X' | 'O'
export type Cell = Mark | null
export type Board = Cell[]

export type TicTacToeMode = 'classic' | 'connect4'
export type Difficulty = 'easy' | 'medium' | 'hard'

export interface WinResult {
  winner: Mark
  line: number[]
}
