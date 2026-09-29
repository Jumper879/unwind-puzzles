import type { DirectionVector } from '../engine/types'

// Ordered by increasing atan2(dRow, dCol) angle in [0, 2π) — see the
// snapDirection derivation this table backs.
const DIRECTION_TABLE: DirectionVector[] = [
  { dRow: 0, dCol: 1 }, // E
  { dRow: 1, dCol: 1 }, // SE
  { dRow: 1, dCol: 0 }, // S
  { dRow: 1, dCol: -1 }, // SW
  { dRow: 0, dCol: -1 }, // W
  { dRow: -1, dCol: -1 }, // NW
  { dRow: -1, dCol: 0 }, // N
  { dRow: -1, dCol: 1 }, // NE
]

/** Snaps a raw drag delta to the nearest of the 8 straight-line directions. */
export function snapDirection(dRow: number, dCol: number): DirectionVector | null {
  if (dRow === 0 && dCol === 0) return null
  let angle = Math.atan2(dRow, dCol)
  if (angle < 0) angle += 2 * Math.PI
  const index = Math.round(angle / (Math.PI / 4)) % 8
  return DIRECTION_TABLE[index]
}

/** The cells a drag from (startRow,startCol) toward (dRow,dCol) covers, snapped to a straight line and clamped to the grid. */
export function cellsForDrag(
  startRow: number,
  startCol: number,
  dRow: number,
  dCol: number,
  size: number,
): { row: number; col: number }[] {
  const direction = snapDirection(dRow, dCol)
  if (!direction) return [{ row: startRow, col: startCol }]

  const steps =
    direction.dRow !== 0 && direction.dCol !== 0
      ? Math.max(Math.abs(dRow), Math.abs(dCol))
      : Math.abs(dRow) || Math.abs(dCol)

  const cells: { row: number; col: number }[] = []
  for (let i = 0; i <= steps; i++) {
    const row = startRow + direction.dRow * i
    const col = startCol + direction.dCol * i
    if (row < 0 || row >= size || col < 0 || col >= size) break
    cells.push({ row, col })
  }
  return cells
}
