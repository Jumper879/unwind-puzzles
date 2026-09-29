import { BOARD_SIZE } from './types'
import type { Board, Cell } from './types'

/**
 * Test-only helper: a full board with an intentional `pattern` overlaid on
 * a background that's *provably* match-free — (row+col)%3 means every
 * horizontally or vertically adjacent pair differs, so no run of length
 * >= 2 ever occurs in the background, let alone 3. Pattern cells should
 * use fruit ids 3/4/5 to avoid any chance of colliding with the
 * background's 0/1/2. (An earlier version of this helper used a single
 * uniform fill value, which made almost the entire board one giant
 * accidental match — a real bug caught by a test run that never finished.)
 */
export function boardFrom(pattern: Record<number, number>): Board {
  const board: Board = []
  for (let i = 0; i < BOARD_SIZE * BOARD_SIZE; i++) {
    const row = Math.floor(i / BOARD_SIZE)
    const col = i % BOARD_SIZE
    const background = (row + col) % 3
    const fruit = pattern[i] ?? background
    board.push({ fruit, special: 'none' } satisfies Cell)
  }
  return board
}
