import { lazy } from 'react'

/**
 * Real, playable game components, keyed by game id — code-split per game
 * (PLAN.md section 10). A game with no entry here still gets a real route
 * via GameRoute, just rendering ComingSoon instead until it's built.
 */
export const GAME_COMPONENTS: Record<string, React.LazyExoticComponent<() => React.ReactNode>> = {
  'tic-tac-toe': lazy(() =>
    import('./tic-tac-toe/components/TicTacToePage').then((m) => ({ default: m.TicTacToePage })),
  ),
  'word-search': lazy(() =>
    import('./word-search/components/WordSearchPage').then((m) => ({ default: m.WordSearchPage })),
  ),
  sudoku: lazy(() =>
    import('./sudoku/components/SudokuPage').then((m) => ({ default: m.SudokuPage })),
  ),
  'fruit-match': lazy(() =>
    import('./fruit-match/components/FruitMatchPage').then((m) => ({ default: m.FruitMatchPage })),
  ),
  crossword: lazy(() =>
    import('./crossword/components/CrosswordPage').then((m) => ({ default: m.CrosswordPage })),
  ),
  chess: lazy(() => import('./chess/components/ChessPage').then((m) => ({ default: m.ChessPage }))),
}
