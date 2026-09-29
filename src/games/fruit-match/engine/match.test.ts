import { describe, expect, it } from 'vitest'
import { indexOf } from './board'
import { findMatchGroups, specialEffectArea } from './match'
import { BOARD_SIZE } from './types'
import { boardFrom } from './testBoard'

describe('findMatchGroups', () => {
  it('finds a horizontal run of 3', () => {
    const board = boardFrom({
      [indexOf(0, 0)]: 4,
      [indexOf(0, 1)]: 4,
      [indexOf(0, 2)]: 4,
    })
    const groups = findMatchGroups(board)
    expect(groups).toHaveLength(1)
    expect(groups[0].orientation).toBe('h')
    expect(groups[0].cells).toEqual([indexOf(0, 0), indexOf(0, 1), indexOf(0, 2)])
  })

  it('finds a vertical run of 4', () => {
    const board = boardFrom({
      [indexOf(0, 0)]: 4,
      [indexOf(1, 0)]: 4,
      [indexOf(2, 0)]: 4,
      [indexOf(3, 0)]: 4,
    })
    const groups = findMatchGroups(board)
    expect(groups).toHaveLength(1)
    expect(groups[0].orientation).toBe('v')
    expect(groups[0].cells).toHaveLength(4)
  })

  it('finds an L-shape as two intersecting groups', () => {
    // Horizontal run at row 3, cols 2-4, plus vertical run at col 2, rows 3-5 — sharing (3,2).
    const board = boardFrom({
      [indexOf(3, 2)]: 5,
      [indexOf(3, 3)]: 5,
      [indexOf(3, 4)]: 5,
      [indexOf(4, 2)]: 5,
      [indexOf(5, 2)]: 5,
    })
    const groups = findMatchGroups(board)
    expect(groups).toHaveLength(2)
    const shared = groups[0].cells.filter((c) => groups[1].cells.includes(c))
    expect(shared).toEqual([indexOf(3, 2)])
  })

  it('ignores runs of 2', () => {
    const board = boardFrom({
      [indexOf(0, 0)]: 4,
      [indexOf(0, 1)]: 4,
    })
    expect(findMatchGroups(board)).toHaveLength(0)
  })
})

describe('specialEffectArea', () => {
  it('line-h covers the whole row', () => {
    const board = boardFrom({})
    const area = specialEffectArea(board, indexOf(4, 4), 'line-h')
    expect(area).toEqual(Array.from({ length: BOARD_SIZE }, (_, c) => indexOf(4, c)))
  })

  it('bomb covers a 3x3 neighborhood, clamped at the edge', () => {
    const board = boardFrom({})
    const area = specialEffectArea(board, indexOf(0, 0), 'bomb')
    // corner cell: only a 2x2 neighborhood exists on-board
    expect(area.sort((a, b) => a - b)).toEqual(
      [indexOf(0, 0), indexOf(0, 1), indexOf(1, 0), indexOf(1, 1)].sort((a, b) => a - b),
    )
  })

  it('color covers every cell sharing that fruit type', () => {
    const board = boardFrom({ [indexOf(0, 0)]: 4, [indexOf(5, 5)]: 4, [indexOf(7, 7)]: 4 })
    const area = specialEffectArea(board, indexOf(0, 0), 'color')
    expect(area.sort((a, b) => a - b)).toEqual(
      [indexOf(0, 0), indexOf(5, 5), indexOf(7, 7)].sort((a, b) => a - b),
    )
  })
})
