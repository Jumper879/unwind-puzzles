/**
 * "Capture all the black pieces" mini-puzzles (reference-1 style): one
 * white piece, a handful of static black pawns on a small empty board.
 * Deliberately its own tiny engine, not chess.js — there's no second
 * player here (the targets never move), so a full legal-position/turn
 * engine would just add fragility (e.g. auto-playing a "random" black
 * reply risks a pawn evading in a way that breaks a hand-computed
 * "minimum moves" claim). The true minimum is instead *computed*, via
 * breadth-first search over the real move graph — same philosophy as the
 * sudoku generator verifying uniqueness instead of assuming it.
 */

export type CapturePieceType = 'knight' | 'bishop' | 'rook'

export interface CapturePuzzleDef {
  id: string
  size: number
  pieceType: CapturePieceType
  start: number // square index, row*size+col
  targets: number[] // square indices of the black pawns to capture
  difficulty: 'easy' | 'medium' | 'hard'
}

function toRC(square: number, size: number): [number, number] {
  return [Math.floor(square / size), square % size]
}
function toSquare(row: number, col: number, size: number): number {
  return row * size + col
}
function inBounds(row: number, col: number, size: number): boolean {
  return row >= 0 && row < size && col >= 0 && col < size
}

const KNIGHT_OFFSETS: [number, number][] = [
  [-2, -1],
  [-2, 1],
  [-1, -2],
  [-1, 2],
  [1, -2],
  [1, 2],
  [2, -1],
  [2, 1],
]
const BISHOP_DIRS: [number, number][] = [
  [-1, -1],
  [-1, 1],
  [1, -1],
  [1, 1],
]
const ROOK_DIRS: [number, number][] = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
]

/** Every square this piece could move to from `from`, given the board still has pieces at `occupied` (only relevant for sliding pieces — a slide stops at the first occupied square it reaches, capturing it, exactly like real chess). */
export function movesFrom(
  pieceType: CapturePieceType,
  from: number,
  size: number,
  occupied: Set<number>,
): number[] {
  const [row, col] = toRC(from, size)
  const moves: number[] = []

  if (pieceType === 'knight') {
    for (const [dr, dc] of KNIGHT_OFFSETS) {
      const r = row + dr
      const c = col + dc
      if (inBounds(r, c, size)) moves.push(toSquare(r, c, size))
    }
    return moves
  }

  const dirs = pieceType === 'bishop' ? BISHOP_DIRS : ROOK_DIRS
  for (const [dr, dc] of dirs) {
    let r = row + dr
    let c = col + dc
    while (inBounds(r, c, size)) {
      const sq = toSquare(r, c, size)
      moves.push(sq)
      if (occupied.has(sq)) break // captures the first piece in the way, can't slide past it
      r += dr
      c += dc
    }
  }
  return moves
}

/** BFS over (position, remaining-targets-bitmask) — returns the provably shortest capture-all-targets move count, or null if impossible. */
export function solveMinMoves(def: CapturePuzzleDef): number | null {
  const targetBit = new Map(def.targets.map((sq, i) => [sq, 1 << i]))
  const fullMask = (1 << def.targets.length) - 1

  const startState = `${def.start}:0`
  const visited = new Set([startState])
  let frontier: { square: number; mask: number }[] = [{ square: def.start, mask: 0 }]
  let depth = 0

  if (fullMask === 0) return 0

  while (frontier.length > 0) {
    depth++
    const next: typeof frontier = []
    for (const { square, mask } of frontier) {
      // Occupied = targets not yet captured (they block/get captured by sliders; captured ones are gone).
      const occupied = new Set(def.targets.filter((_, i) => !(mask & (1 << i))))
      for (const dest of movesFrom(def.pieceType, square, def.size, occupied)) {
        const bit = targetBit.get(dest)
        const nextMask = bit ? mask | bit : mask
        if (nextMask === fullMask) return depth
        const key = `${dest}:${nextMask}`
        if (visited.has(key)) continue
        visited.add(key)
        next.push({ square: dest, mask: nextMask })
      }
    }
    frontier = next
  }
  return null
}
