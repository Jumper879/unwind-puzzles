export interface GameMeta {
  id: string
  name: string
  tagline: string
  accent: 'blue' | 'sky' | 'mint' | 'peach' | 'lavender' | 'butter' | 'coral' | 'navy'
  /** Which build phase (from PLAN.md) ships this game. */
  phase: number
}

/**
 * The 8 games. Each one's actual engine/component lands in its own
 * `/src/games/<id>/` folder in a later phase — for now this registry just
 * drives the home grid and gives every game a real (if "coming soon")
 * route, so nothing on the home screen is a dead click.
 */
export const GAMES: GameMeta[] = [
  {
    id: 'tic-tac-toe',
    name: 'X&O',
    tagline: 'Classic 3x3, or 4x4 connect',
    accent: 'blue',
    phase: 3,
  },
  {
    id: 'word-search',
    name: 'Word Search',
    tagline: '20+ themes, seeded boards',
    accent: 'mint',
    phase: 3,
  },
  {
    id: 'sudoku',
    name: 'Sudoku Cards',
    tagline: '4x4 to 9x9, drag to place',
    accent: 'sky',
    phase: 4,
  },
  {
    id: 'fruit-match',
    name: 'Fruit Match',
    tagline: 'Cascading match-3',
    accent: 'coral',
    phase: 4,
  },
  {
    id: 'crossword',
    name: 'Crossword',
    tagline: 'Handmade packs, easy to hard',
    accent: 'butter',
    phase: 5,
  },
  { id: 'chess', name: 'Chess', tagline: 'Full games + tactic puzzles', accent: 'navy', phase: 5 },
  {
    id: 'spot-the-difference',
    name: 'Spot the Difference',
    tagline: 'Procedural scenes',
    accent: 'lavender',
    phase: 6,
  },
  {
    id: 'mosaic',
    name: 'Missing Piece',
    tagline: 'Find the right tile',
    accent: 'peach',
    phase: 6,
  },
]

export function getGame(id: string): GameMeta | undefined {
  return GAMES.find((g) => g.id === id)
}
