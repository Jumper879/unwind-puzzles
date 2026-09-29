import type { GridTemplate } from './types'

// '#' = block, '.' = fillable. 180°-rotationally symmetric (standard
// crossword convention). Just one template for now, deliberately —
// several denser hand-designed attempts (a 7x7 needing five 7-letter
// words against a list that only has one; a 4-mutual-constraint 5x5)
// failed to fill at all against wordlist.ts's modest word counts per
// length, caught by generator.test.ts actually trying to fill them
// rather than by inspection. Growing the word list and adding more
// templates is a content task — see GAMES.md — not an engine change;
// the generator itself is already verified correct and deterministic.
export const GRID_TEMPLATES: GridTemplate[] = [
  {
    id: 'mini-5',
    rows: ['#.#.#', '#.#.#', '.....', '#.#.#', '#.#.#'],
  },
]

export function getGridTemplate(id: string): GridTemplate | undefined {
  return GRID_TEMPLATES.find((g) => g.id === id)
}
