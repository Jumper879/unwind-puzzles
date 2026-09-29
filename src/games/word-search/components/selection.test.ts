import { describe, expect, it } from 'vitest'
import { snapDirection, cellsForDrag } from './selection'

describe('snapDirection', () => {
  it('snaps cardinal directions exactly', () => {
    expect(snapDirection(0, 1)).toEqual({ dRow: 0, dCol: 1 }) // E
    expect(snapDirection(1, 0)).toEqual({ dRow: 1, dCol: 0 }) // S
    expect(snapDirection(0, -1)).toEqual({ dRow: 0, dCol: -1 }) // W
    expect(snapDirection(-1, 0)).toEqual({ dRow: -1, dCol: 0 }) // N
  })

  it('snaps exact diagonals', () => {
    expect(snapDirection(1, 1)).toEqual({ dRow: 1, dCol: 1 }) // SE
    expect(snapDirection(-1, -1)).toEqual({ dRow: -1, dCol: -1 }) // NW
  })

  it('snaps a slightly-off drag to the nearest of the 8 directions', () => {
    // Mostly-east with a slight downward wobble should still snap to E.
    expect(snapDirection(1, 8)).toEqual({ dRow: 0, dCol: 1 })
  })

  it('returns null for no movement', () => {
    expect(snapDirection(0, 0)).toBeNull()
  })
})

describe('cellsForDrag', () => {
  it('produces the straight-line path east', () => {
    const cells = cellsForDrag(2, 2, 0, 3, 10)
    expect(cells).toEqual([
      { row: 2, col: 2 },
      { row: 2, col: 3 },
      { row: 2, col: 4 },
      { row: 2, col: 5 },
    ])
  })

  it('clamps to the grid bounds', () => {
    const cells = cellsForDrag(0, 0, 0, 20, 5)
    expect(cells).toHaveLength(5)
    expect(cells[cells.length - 1]).toEqual({ row: 0, col: 4 })
  })
})
