import type { Chess } from 'chess.js'
import type { BoardCell } from '../components/Board'

/** Flattens chess.js's board() (rank8→rank1 array of arrays) into our row-major BoardCell list. */
export function toBoardCells(chess: Chess): BoardCell[] {
  const cells: BoardCell[] = []
  for (const rank of chess.board()) {
    for (const cell of rank) {
      if (cell) {
        cells.push({ square: cell.square, piece: { type: cell.type, color: cell.color } })
      } else {
        // chess.js omits empty squares' coordinates, so derive them from position in the grid.
        cells.push({ square: '', piece: null })
      }
    }
  }
  // Fill in square names for empty cells using standard rank8→rank1, a→h order.
  let i = 0
  for (let rank = 8; rank >= 1; rank--) {
    for (let file = 0; file < 8; file++) {
      if (cells[i].square === '') cells[i].square = `${String.fromCharCode(97 + file)}${rank}`
      i++
    }
  }
  return cells
}
