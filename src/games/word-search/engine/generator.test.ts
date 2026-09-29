import { describe, expect, it } from 'vitest'
import { generateWordSearch } from './generator'
import { DIFFICULTY_CONFIG } from './difficulty'
import { THEMES, themeNames } from './themes'

describe('generateWordSearch', () => {
  it('is deterministic for the same theme/difficulty/seed', () => {
    const a = generateWordSearch('Animals', 'easy', 'seed-1')
    const b = generateWordSearch('Animals', 'easy', 'seed-1')
    expect(a.grid).toEqual(b.grid)
    expect(a.placements).toEqual(b.placements)
  })

  it('differs for a different seed', () => {
    const a = generateWordSearch('Animals', 'easy', 'seed-1')
    const b = generateWordSearch('Animals', 'easy', 'seed-2')
    expect(a.grid).not.toEqual(b.grid)
  })

  it('produces a grid of the right size, all single uppercase letters', () => {
    const puzzle = generateWordSearch('Ocean', 'medium', 'seed-x')
    const config = DIFFICULTY_CONFIG.medium
    expect(puzzle.grid).toHaveLength(config.size * config.size)
    for (const letter of puzzle.grid) {
      expect(letter).toMatch(/^[A-Z]$/)
    }
  })

  it('places the configured word count (or fewer, never more) and every placement actually spells its word on the grid', () => {
    const puzzle = generateWordSearch('Space', 'hard', 'seed-y')
    const config = DIFFICULTY_CONFIG.hard
    expect(puzzle.placements.length).toBeLessThanOrEqual(config.wordCount)
    expect(puzzle.placements.length).toBeGreaterThan(0)

    for (const placement of puzzle.placements) {
      const spelled = placement.cells.map((cellIndex) => puzzle.grid[cellIndex]).join('')
      expect(spelled).toBe(placement.word)
    }
  })

  it('only uses directions allowed for the difficulty', () => {
    const puzzle = generateWordSearch('Fruits', 'easy', 'seed-z')
    const allowed = DIFFICULTY_CONFIG.easy.directions
    for (const placement of puzzle.placements) {
      expect(allowed).toContainEqual(placement.direction)
    }
  })

  it('every theme generates without throwing, at every difficulty', () => {
    for (const theme of themeNames()) {
      for (const difficulty of ['easy', 'medium', 'hard'] as const) {
        expect(() => generateWordSearch(theme, difficulty, 'smoke-seed')).not.toThrow()
      }
    }
  })

  it('has no accidental un-placed occurrence of a theme word overlapping only filler cells', () => {
    // Regression check for the filler-collision fix: scan every straight
    // line the puzzle's directions allow and confirm any full-word match
    // is a real, recorded placement.
    const puzzle = generateWordSearch('Garden', 'hard', 'fix-check-seed')
    const config = DIFFICULTY_CONFIG.hard
    const placedLineKeys = new Set(puzzle.placements.map((p) => p.cells.join(',')))
    const placedCellSet = new Set(puzzle.placements.flatMap((p) => p.cells))

    for (const word of THEMES.Garden) {
      for (let row = 0; row < puzzle.size; row++) {
        for (let col = 0; col < puzzle.size; col++) {
          for (const dir of config.directions) {
            const cells: number[] = []
            let ok = true
            for (let i = 0; i < word.length; i++) {
              const r = row + dir.dRow * i
              const c = col + dir.dCol * i
              if (r < 0 || r >= puzzle.size || c < 0 || c >= puzzle.size) {
                ok = false
                break
              }
              cells.push(r * puzzle.size + c)
            }
            if (!ok) continue
            const spelled = cells.map((i) => puzzle.grid[i]).join('')
            if (spelled !== word) continue

            const isRealPlacement = placedLineKeys.has(cells.join(','))
            if (isRealPlacement) continue
            // Not a recorded placement, but it still spells a real word —
            // only acceptable if every one of its cells belongs to some
            // *other* real placement (a coincidental overlap fixAccidentalWords
            // correctly left alone, since it never touches real letters).
            // Any filler cell in an unrecorded match would mean the fix
            // didn't do its job.
            const allCellsAreRealWordLetters = cells.every((c) => placedCellSet.has(c))
            expect(allCellsAreRealWordLetters).toBe(true)
          }
        }
      }
    }
  })
})
