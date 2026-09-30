import type { Board, Difficulty, TicTacToeMode } from './engine/types'

const KEY = 'unwind:local:resume:tic-tac-toe'

export interface TicTacToeResumeState {
  mode: TicTacToeMode
  difficulty: Difficulty
  history: Board[]
  turn: 'X' | 'O'
  playerMoveCount: number
  startTime: number
}

/**
 * X&O's minimal real save/resume — the one game with it so far (see
 * BottomNav's leave-a-game handling): every move overwrites this record;
 * finishing a match or starting a fresh one clears it. A saved record
 * existing IS "a round in progress," so loading it is what lets Back then
 * Forward land the player back in the exact same match.
 */
export function saveResumeState(state: TicTacToeResumeState): void {
  localStorage.setItem(KEY, JSON.stringify(state))
}

export function loadResumeState(): TicTacToeResumeState | null {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as TicTacToeResumeState) : null
  } catch {
    return null
  }
}

export function clearResumeState(): void {
  localStorage.removeItem(KEY)
}
