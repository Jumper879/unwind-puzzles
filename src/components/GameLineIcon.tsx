const STROKE = { fill: 'none', stroke: 'var(--navy-900)', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }

/** Simple line icons, one per game — matches ref-home.png's plain outlined icon-tile style rather than each game's own soft-3D GameIcon gradient tile (that one's used everywhere else; this one's scoped to Home's new folder cards only). */
export function GameLineIcon({ gameId }: { gameId: string }) {
  switch (gameId) {
    case 'tic-tac-toe':
      return (
        <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
          <path d="M5 5l6 6M11 5l-6 6" {...STROKE} />
          <circle cx="16.5" cy="15.5" r="3.2" {...STROKE} />
        </svg>
      )
    case 'crossword':
      return (
        <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
          <rect x="4" y="4" width="16" height="16" rx="1.5" {...STROKE} />
          <path d="M4 9.5h16M4 14.5h16M9.5 4v16M14.5 4v16" {...STROKE} />
        </svg>
      )
    case 'word-search':
      return (
        <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
          <circle cx="10.5" cy="10.5" r="6" {...STROKE} />
          <path d="M15 15l5 5" {...STROKE} />
        </svg>
      )
    case 'sudoku':
      return (
        <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
          <rect x="4" y="4" width="16" height="16" rx="1.5" {...STROKE} />
          <path d="M4 10.7h16M4 15.3h16M10.7 4v16M15.3 4v16" {...STROKE} />
        </svg>
      )
    case 'fruit-match':
      return (
        <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
          <circle cx="12" cy="14" r="6.5" {...STROKE} />
          <path d="M12 7.5c0-2 1.5-3 3-3" {...STROKE} />
        </svg>
      )
    case 'mosaic':
      return (
        <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
          <path
            d="M5 5h6v3a1.8 1.8 0 003.6 0V5H19v6h-3a1.8 1.8 0 000 3.6h3V19h-6v-3a1.8 1.8 0 00-3.6 0v3H5v-6h3a1.8 1.8 0 000-3.6H5V5z"
            {...STROKE}
          />
        </svg>
      )
    case 'spot-the-difference':
      return (
        <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
          <circle cx="9.5" cy="12" r="6" {...STROKE} />
          <circle cx="14.5" cy="12" r="6" {...STROKE} />
        </svg>
      )
    case 'chess':
      return (
        <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
          <circle cx="12" cy="6.5" r="2.3" {...STROKE} />
          <path d="M9 12.5h6l1.5 7h-9z" {...STROKE} />
          <path d="M7.5 19.5h9" {...STROKE} />
        </svg>
      )
    default:
      return (
        <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
          <circle cx="12" cy="12" r="7" {...STROKE} />
        </svg>
      )
  }
}
