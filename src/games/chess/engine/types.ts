export type ChessDifficulty = 'easy' | 'medium' | 'hard'
export type ChessMode = 'full-game' | 'puzzle'

export interface DifficultyConfig {
  skillLevel: number // Stockfish Skill Level, 0-20
  moveTimeMs: number
}

export const DIFFICULTY_CONFIG: Record<ChessDifficulty, DifficultyConfig> = {
  easy: { skillLevel: 2, moveTimeMs: 300 },
  medium: { skillLevel: 8, moveTimeMs: 600 },
  hard: { skillLevel: 18, moveTimeMs: 1200 },
}

/**
 * A hand-authored tactical puzzle — original positions written for this
 * project, not imported from any external puzzle database (the brief
 * flagged checking the Lichess puzzle database's license before importing
 * from it; writing our own sidesteps that question entirely rather than
 * resolving it).
 */
export interface ChessPuzzle {
  id: string
  fen: string
  goal: string
  /** Player's side to move. */
  playerColor: 'w' | 'b'
  /** The forced winning line, in UCI-ish "e2e4" square-pair form, alternating player/opponent replies. Puzzle is solved when the player's moves match this sequence (opponent replies are auto-played). */
  solution: string[]
  starThresholds: { moves: number } // 3 stars = solved in exactly solution's player-move count, fewer hints better
  difficulty: ChessDifficulty
}
