import { describe, expect, it } from 'vitest'
import { createRng } from '../../../lib/rng'
import { indexOf } from './board'
import { assignNewSpecials, resolveSwap } from './resolve'
import { boardFrom } from './testBoard'
import type { MatchGroup } from './match'

describe('assignNewSpecials', () => {
  it('a 4-length group gets a line special matching its orientation', () => {
    const cells = [indexOf(0, 0), indexOf(0, 1), indexOf(0, 2), indexOf(0, 3)]
    const groups: MatchGroup[] = [{ cells, orientation: 'h', fruit: 1 }]
    const assignments = assignNewSpecials(groups, [])
    expect(assignments.size).toBe(1)
    const [[host, info]] = [...assignments.entries()]
    expect(cells).toContain(host)
    expect(info.special).toBe('line-h')
  })

  it('a 5+-length group gets a color special, taking priority over a line', () => {
    const cells = [indexOf(0, 0), indexOf(0, 1), indexOf(0, 2), indexOf(0, 3), indexOf(0, 4)]
    const groups: MatchGroup[] = [{ cells, orientation: 'h', fruit: 3 }]
    const assignments = assignNewSpecials(groups, [])
    expect(assignments.size).toBe(1)
    const [[, info]] = [...assignments.entries()]
    expect(info.special).toBe('color')
  })

  it('an L-shape (intersecting h+v groups) gets a bomb at the shared cell', () => {
    const shared = indexOf(3, 3)
    const hGroup: MatchGroup = {
      cells: [indexOf(3, 2), shared, indexOf(3, 4)],
      orientation: 'h',
      fruit: 2,
    }
    const vGroup: MatchGroup = {
      cells: [indexOf(2, 3), shared, indexOf(4, 3)],
      orientation: 'v',
      fruit: 2,
    }
    const assignments = assignNewSpecials([hGroup, vGroup], [])
    expect(assignments.get(shared)?.special).toBe('bomb')
  })

  it('prefers a preferred cell (the swap landing position) as the host when present in the group', () => {
    const cells = [indexOf(0, 0), indexOf(0, 1), indexOf(0, 2), indexOf(0, 3)]
    const groups: MatchGroup[] = [{ cells, orientation: 'h', fruit: 1 }]
    const assignments = assignNewSpecials(groups, [indexOf(0, 1)])
    expect([...assignments.keys()]).toEqual([indexOf(0, 1)])
  })
})

describe('resolveSwap', () => {
  it('rejects a swap that creates no match', () => {
    const board = boardFrom({})
    const result = resolveSwap(board, indexOf(0, 0), indexOf(0, 1), createRng('no-match'))
    expect(result.valid).toBe(false)
    expect(result.scoreGained).toBe(0)
  })

  it('accepts a swap that creates a 3-match, clears it, and scores', () => {
    // Row 0: [4, 4, 5, ...], and (1,2)=4. Swapping (0,2)<->(1,2) completes a 3-run at row 0.
    const board = boardFrom({
      [indexOf(0, 0)]: 4,
      [indexOf(0, 1)]: 4,
      [indexOf(0, 2)]: 5,
      [indexOf(1, 2)]: 4,
    })
    const result = resolveSwap(board, indexOf(0, 2), indexOf(1, 2), createRng('match-check'))
    expect(result.valid).toBe(true)
    expect(result.scoreGained).toBeGreaterThan(0)
    expect(result.clearedCount).toBeGreaterThanOrEqual(3)
    expect(result.cascades).toBeGreaterThanOrEqual(1)
  })

  it('is deterministic for the same seed (refill included)', () => {
    const board = boardFrom({
      [indexOf(0, 0)]: 4,
      [indexOf(0, 1)]: 4,
      [indexOf(0, 2)]: 5,
      [indexOf(1, 2)]: 4,
    })
    const a = resolveSwap(board, indexOf(0, 2), indexOf(1, 2), createRng('same-seed'))
    const b = resolveSwap(board, indexOf(0, 2), indexOf(1, 2), createRng('same-seed'))
    expect(a).toEqual(b)
  })

  it('every cell is filled (no nulls survive gravity/refill)', () => {
    const board = boardFrom({
      [indexOf(0, 0)]: 4,
      [indexOf(0, 1)]: 4,
      [indexOf(0, 2)]: 5,
      [indexOf(1, 2)]: 4,
    })
    const result = resolveSwap(board, indexOf(0, 2), indexOf(1, 2), createRng('fill-check'))
    expect(result.board.every((c) => c !== null)).toBe(true)
  })
})
