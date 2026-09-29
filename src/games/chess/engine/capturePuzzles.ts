import type { CapturePuzzleDef } from './capturePuzzle'

// 5x5 board, squares numbered 0-24 (row*5+col). Solvability and the
// "minimum moves" star threshold are both computed by solveMinMoves
// (capturePuzzle.ts's BFS), never hand-claimed — see generator.test.ts.
export const CAPTURE_PUZZLES: CapturePuzzleDef[] = [
  { id: 'knight-1', size: 5, pieceType: 'knight', start: 12, targets: [2, 20], difficulty: 'easy' },
  {
    id: 'knight-2',
    size: 5,
    pieceType: 'knight',
    start: 6,
    targets: [0, 18, 24],
    difficulty: 'medium',
  },
  { id: 'bishop-1', size: 5, pieceType: 'bishop', start: 12, targets: [0, 24], difficulty: 'easy' },
  {
    id: 'bishop-2',
    size: 5,
    pieceType: 'bishop',
    start: 6,
    targets: [0, 8, 20],
    difficulty: 'medium',
  },
  { id: 'rook-1', size: 5, pieceType: 'rook', start: 12, targets: [10, 4], difficulty: 'easy' },
  {
    id: 'rook-2',
    size: 5,
    pieceType: 'rook',
    start: 0,
    targets: [4, 20, 24],
    difficulty: 'hard',
  },
]

export function getCapturePuzzle(id: string): CapturePuzzleDef | undefined {
  return CAPTURE_PUZZLES.find((p) => p.id === id)
}
