import { createRng, shuffle } from '../../../lib/rng'
import { getGridTemplate } from './gridTemplates'
import { computeSlots, templateToSolution } from './slots'
import { findByLength } from './wordlist'
import type { CrosswordPuzzle, Difficulty, Slot } from './types'

const MAX_ATTEMPTS_PER_SLOT = 200

function candidateFits(solution: (string | null)[], slot: Slot, word: string): boolean {
  return slot.cells.every((cellIndex, i) => {
    const existing = solution[cellIndex]
    return existing === '' || existing === word[i]
  })
}

function placeWord(solution: (string | null)[], slot: Slot, word: string): (string | null)[] {
  const next = [...solution]
  slot.cells.forEach((cellIndex, i) => {
    next[cellIndex] = word[i]
  })
  return next
}

/** Backtracking constraint fill: longest/most-constrained slots first, candidates tried in a seeded-shuffled order, never reusing a word twice in one puzzle. */
function fillSlots(
  solution: (string | null)[],
  slots: Slot[],
  order: Slot[],
  index: number,
  usedWords: Set<string>,
  rng: () => number,
): (string | null)[] | null {
  if (index >= order.length) return solution
  const slot = order[index]

  const candidates = shuffle(
    rng,
    findByLength(slot.length).filter(
      (w) => !usedWords.has(w.word) && candidateFits(solution, slot, w.word),
    ),
  )

  for (let attempt = 0; attempt < Math.min(candidates.length, MAX_ATTEMPTS_PER_SLOT); attempt++) {
    const entry = candidates[attempt]
    const nextSolution = placeWord(solution, slot, entry.word)
    usedWords.add(entry.word)
    // `order` and `slots` hold the same Slot object references (order is
    // just a re-sorted array of them), so this mutation is visible on the
    // slot the caller ultimately gets back — reverted on backtrack below,
    // same as the usedWords add/delete pair.
    slot.clue = entry.clue
    const result = fillSlots(nextSolution, slots, order, index + 1, usedWords, rng)
    if (result) return result
    usedWords.delete(entry.word)
    slot.clue = undefined
  }
  return null
}

export function generateCrossword(
  templateId: string,
  difficulty: Difficulty,
  seed: string,
): CrosswordPuzzle {
  const template = getGridTemplate(templateId)
  if (!template) throw new Error(`Unknown crossword template: ${templateId}`)
  const { width, height, solution } = templateToSolution(template)
  const slots = computeSlots(width, height, solution)

  const order = [...slots].sort((a, b) => b.length - a.length)
  const rng = createRng(`${templateId}:${difficulty}:${seed}`)

  const filled = fillSlots(solution, slots, order, 0, new Set(), rng)
  if (!filled) {
    throw new Error(
      `Could not fill crossword template "${templateId}" from the current word list — needs a bigger word list or a simpler template.`,
    )
  }

  return { width, height, solution: filled, slots, seed, difficulty }
}
