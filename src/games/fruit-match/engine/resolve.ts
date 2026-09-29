import { applyGravityAndRefill, swapCells } from './board'
import { findMatchGroups, specialEffectArea } from './match'
import type { Board, Special, SwapResult } from './types'
import type { MatchGroup } from './match'

export interface SpecialHost {
  special: Special
  fruit: number
}

function chooseHost(cells: number[], preferred: number[]): number {
  const found = cells.find((c) => preferred.includes(c))
  if (found !== undefined) return found
  return cells[Math.floor(cells.length / 2)]
}

/** Decides which cells in this pass's matches become new special pieces, per PLAN.md: 4-in-a-line -> line clear, L/T shape -> bomb, 5+ -> color clear. Priority when a cell could qualify for more than one: color > bomb > line. Exported for direct unit testing — the geometry rules are the trickiest part of this engine. */
export function assignNewSpecials(
  groups: MatchGroup[],
  preferredCells: number[],
): Map<number, SpecialHost> {
  const assignments = new Map<number, SpecialHost>()

  for (const g of groups) {
    if (g.cells.length >= 5) {
      const host = chooseHost(g.cells, preferredCells)
      assignments.set(host, { special: 'color', fruit: g.fruit })
    }
  }

  const hGroups = groups.filter((g) => g.orientation === 'h' && g.cells.length >= 3)
  const vGroups = groups.filter((g) => g.orientation === 'v' && g.cells.length >= 3)
  for (const hg of hGroups) {
    for (const vg of vGroups) {
      const shared = hg.cells.find((c) => vg.cells.includes(c))
      if (shared !== undefined && !assignments.has(shared)) {
        assignments.set(shared, { special: 'bomb', fruit: hg.fruit })
      }
    }
  }

  for (const g of groups) {
    if (g.cells.length === 4 && !assignments.has(chooseHost(g.cells, preferredCells))) {
      const host = chooseHost(g.cells, preferredCells)
      assignments.set(host, {
        special: g.orientation === 'h' ? 'line-h' : 'line-v',
        fruit: g.fruit,
      })
    }
  }

  return assignments
}

/** Resolves one full swap: validity check, match clearing (with new specials created and existing specials triggered), gravity/refill, and repeats for any resulting cascades. */
export function resolveSwap(
  board: Board,
  indexA: number,
  indexB: number,
  rng: () => number,
): SwapResult {
  let current = swapCells(board, indexA, indexB)
  let preferredCells = [indexA, indexB]
  let totalScore = 0
  let totalCleared = 0
  let cascades = 0

  // A defensive cap, not an expected case: a healthy board clears in a
  // handful of cascades. This only guards against a future logic bug
  // (e.g. a clear/refill step that doesn't actually shrink the matched
  // area) turning into a hang instead of a wrong-but-finite result.
  const MAX_CASCADES = 50

  while (cascades < MAX_CASCADES) {
    const groups = findMatchGroups(current)
    if (groups.length === 0) break

    const comboMultiplier = 1 + cascades * 0.5
    const newSpecials = assignNewSpecials(groups, preferredCells)

    const clearSet = new Set<number>()
    for (const g of groups) for (const cell of g.cells) clearSet.add(cell)
    for (const host of newSpecials.keys()) clearSet.delete(host)

    // Expand for any pre-existing special caught in this clear (breadth-first, since one special's area can catch another).
    const visited = new Set<number>()
    let frontier = [...clearSet]
    while (frontier.length > 0) {
      const next: number[] = []
      for (const idx of frontier) {
        const cell = current[idx]
        if (!cell || cell.special === 'none' || visited.has(idx)) continue
        visited.add(idx)
        for (const areaIdx of specialEffectArea(current, idx, cell.special)) {
          if (!clearSet.has(areaIdx) && !newSpecials.has(areaIdx)) {
            clearSet.add(areaIdx)
            next.push(areaIdx)
          }
        }
      }
      frontier = next
    }

    totalScore += Math.round(clearSet.size * 10 * comboMultiplier)
    totalCleared += clearSet.size

    const nextBoard: Board = [...current]
    for (const idx of clearSet) nextBoard[idx] = null
    for (const [host, { special, fruit }] of newSpecials) {
      nextBoard[host] = { fruit, special }
    }

    current = applyGravityAndRefill(nextBoard, rng)
    cascades++
    preferredCells = []
  }

  if (cascades === 0) {
    return { valid: false, board, scoreGained: 0, cascades: 0, clearedCount: 0 }
  }
  return {
    valid: true,
    board: current,
    scoreGained: totalScore,
    cascades,
    clearedCount: totalCleared,
  }
}
