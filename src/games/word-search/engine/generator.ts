import { createRng, randomInt, shuffle } from '../../../lib/rng'
import { DIFFICULTY_CONFIG } from './difficulty'
import { THEMES } from './themes'
import type { Difficulty, DirectionVector, WordPlacement, WordSearchPuzzle } from './types'

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const MAX_ATTEMPTS_PER_WORD = 300
const MAX_FIX_PASSES = 20

function toIndex(row: number, col: number, size: number): number {
  return row * size + col
}

function inBounds(row: number, col: number, size: number): boolean {
  return row >= 0 && row < size && col >= 0 && col < size
}

function wordCells(
  word: string,
  row: number,
  col: number,
  dir: DirectionVector,
  size: number,
): number[] | null {
  const cells: number[] = []
  for (let i = 0; i < word.length; i++) {
    const r = row + dir.dRow * i
    const c = col + dir.dCol * i
    if (!inBounds(r, c, size)) return null
    cells.push(toIndex(r, c, size))
  }
  return cells
}

function tryPlaceWord(
  grid: (string | null)[],
  word: string,
  size: number,
  directions: DirectionVector[],
  rng: () => number,
): WordPlacement | null {
  for (let attempt = 0; attempt < MAX_ATTEMPTS_PER_WORD; attempt++) {
    const dir = directions[randomInt(rng, directions.length)]
    const row = randomInt(rng, size)
    const col = randomInt(rng, size)
    const cells = wordCells(word, row, col, dir, size)
    if (!cells) continue

    const fits = cells.every((cellIndex, i) => {
      const existing = grid[cellIndex]
      return existing === null || existing === word[i]
    })
    if (!fits) continue

    cells.forEach((cellIndex, i) => {
      grid[cellIndex] = word[i]
    })
    return { word, row, col, direction: dir, cells }
  }
  return null
}

/** True if `cells` (already-generated indices for a straight line) spell `word` reading forward, given the grid. */
function lineSpells(grid: string[], cells: number[], word: string): boolean {
  return cells.length === word.length && cells.every((cellIndex, i) => grid[cellIndex] === word[i])
}

/**
 * After filling gaps with random letters, scan every straight line the
 * puzzle's own direction set allows for an *unintentional* occurrence of
 * one of the theme's words — one the filler letters happened to spell out
 * by chance, that isn't a real placement (per PLAN.md: "filler letters
 * that avoid accidentally spelling blocked words"). Only mutates cells
 * that are actual filler (never a letter belonging to a real placement),
 * so real words are never disturbed.
 */
function fixAccidentalWords(
  grid: string[],
  size: number,
  directions: DirectionVector[],
  wordList: string[],
  placements: WordPlacement[],
  rng: () => number,
) {
  const placedCellSet = new Set(placements.flatMap((p) => p.cells))
  const officialLines = new Set(placements.map((p) => p.cells.join(',')))

  for (let pass = 0; pass < MAX_FIX_PASSES; pass++) {
    let foundAny = false

    for (const word of wordList) {
      for (let row = 0; row < size && !foundAny; row++) {
        for (let col = 0; col < size && !foundAny; col++) {
          for (const dir of directions) {
            const cells = wordCells(word, row, col, dir, size)
            if (!cells) continue
            if (officialLines.has(cells.join(','))) continue
            if (!lineSpells(grid, cells, word)) continue

            const fillerCellsInLine = cells.filter((c) => !placedCellSet.has(c))
            if (fillerCellsInLine.length === 0) continue // entirely real letters — not a filler artifact, leave it

            const target = fillerCellsInLine[randomInt(rng, fillerCellsInLine.length)]
            let replacement: string
            do {
              replacement = ALPHABET[randomInt(rng, ALPHABET.length)]
            } while (replacement === grid[target])
            grid[target] = replacement
            foundAny = true
          }
        }
      }
    }

    if (!foundAny) break
  }
}

export function generateWordSearch(
  theme: string,
  difficulty: Difficulty,
  seed: string,
): WordSearchPuzzle {
  const config = DIFFICULTY_CONFIG[difficulty]
  const rng = createRng(`${theme}:${difficulty}:${seed}`)
  const themeWords = THEMES[theme]
  if (!themeWords) throw new Error(`Unknown word search theme: ${theme}`)

  const candidates = shuffle(rng, themeWords)
    .filter((w) => w.length <= config.size)
    .sort((a, b) => b.length - a.length)
    .slice(0, config.wordCount)

  const grid: (string | null)[] = Array(config.size * config.size).fill(null)
  const placements: WordPlacement[] = []

  for (const word of candidates) {
    const placement = tryPlaceWord(grid, word, config.size, config.directions, rng)
    if (placement) placements.push(placement)
    // A word that can't be placed after MAX_ATTEMPTS_PER_WORD tries is
    // skipped rather than failing the whole puzzle — rare in practice at
    // these grid sizes/word counts, but graceful either way.
  }

  const filledGrid: string[] = grid.map((cell) => cell ?? ALPHABET[randomInt(rng, ALPHABET.length)])

  fixAccidentalWords(filledGrid, config.size, config.directions, themeWords, placements, rng)

  return { size: config.size, grid: filledGrid, placements, theme, seed }
}
