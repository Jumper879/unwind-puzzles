const STROKE = {
  fill: 'none',
  stroke: 'var(--navy-900)',
  strokeWidth: 2.25,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

/**
 * Detailed line icons, one per game, each recognizable at a glance (not
 * just an abstract mark) — used at two sizes: Home's 56px GameBox tiles and
 * the drawer's 32px item tiles. /brand/game-icons/<id>.png would be
 * preferred if it existed (per the brief), but that folder is empty — no
 * custom artwork has been supplied yet, so these SVGs are it.
 */
export function GameLineIcon({ gameId, size = 24 }: { gameId: string; size?: number }) {
  const props = { viewBox: '0 0 24 24', width: size, height: size, 'aria-hidden': true as const }

  switch (gameId) {
    case 'tic-tac-toe':
      // An X and an O, side by side.
      return (
        <svg {...props}>
          <path d="M4 8l5 5M9 8l-5 5" {...STROKE} />
          <circle cx="16.5" cy="10.5" r="3.4" {...STROKE} />
        </svg>
      )
    case 'word-search':
      // A letter grid with a diagonal highlight line through a found word.
      return (
        <svg {...props}>
          <rect x="4" y="4" width="16" height="16" rx="1.5" {...STROKE} />
          <path d="M4 9.5h16M4 14.5h16M9.5 4v16M14.5 4v16" {...STROKE} opacity={0.55} />
          <path
            d="M6.5 6.5l11 11"
            stroke="var(--navy-900)"
            strokeWidth={3}
            strokeLinecap="round"
            opacity={0.3}
          />
        </svg>
      )
    case 'sudoku':
      // A 3x3 grid with one filled-in number.
      return (
        <svg {...props}>
          <rect x="4" y="4" width="16" height="16" rx="1.5" {...STROKE} />
          <path d="M4 10.7h16M4 15.3h16M10.7 4v16M15.3 4v16" {...STROKE} opacity={0.55} />
          <text
            x="12.9"
            y="9.6"
            fontSize="6.2"
            fontWeight="800"
            fontFamily="system-ui, sans-serif"
            fill="var(--navy-900)"
            textAnchor="middle"
          >
            5
          </text>
        </svg>
      )
    case 'fruit-match':
      // A cherry: two fruits on curved stems meeting at a shared point.
      return (
        <svg {...props}>
          <path d="M13 4.5c1.6-1.2 3.3-.7 4 .9" {...STROKE} />
          <path d="M9 13c0-4.2 2.2-7.3 4.3-8.5M15.2 13.6c0-3.2 1-5.5 2-7" {...STROKE} />
          <circle cx="8.6" cy="16.3" r="3.6" {...STROKE} />
          <circle cx="15.2" cy="17.3" r="3.6" {...STROKE} />
        </svg>
      )
    case 'crossword':
      // Two crossing letter-tile strips.
      return (
        <svg {...props}>
          <rect x="3.5" y="10" width="17" height="4" rx="1" {...STROKE} />
          <rect x="10" y="3.5" width="4" height="17" rx="1" {...STROKE} />
        </svg>
      )
    case 'chess':
      // A knight silhouette.
      return (
        <svg {...props}>
          <path
            d="M7.5 20h9M9 20v-2.5c0-1.2.7-2.2 1.8-2.7l-2.6-3c-1.2-1.4-1.1-3.5.3-4.8l.7-.6c1.3-1.2 3.2-1.4 4.7-.4l.9.6c1.3.9 2.2 2.5 2.2 4.2v3.4c0 1.7-.6 3.3-1.7 4.5V20"
            {...STROKE}
          />
          <circle cx="10.6" cy="8.4" r="0.65" fill="var(--navy-900)" />
        </svg>
      )
    case 'spot-the-difference':
      // Two overlapping picture frames with a dot marking the difference.
      return (
        <svg {...props}>
          <rect x="3" y="5.5" width="11" height="11" rx="1.5" {...STROKE} />
          <rect x="10" y="8.5" width="11" height="11" rx="1.5" {...STROKE} />
          <circle cx="17" cy="14" r="1.3" fill="var(--navy-900)" />
        </svg>
      )
    case 'mosaic':
      // An interlocking puzzle piece.
      return (
        <svg {...props}>
          <path
            d="M5 5h6v3a1.8 1.8 0 003.6 0V5H19v6h-3a1.8 1.8 0 000 3.6h3V19h-6v-3a1.8 1.8 0 00-3.6 0v3H5v-6h3a1.8 1.8 0 000-3.6H5V5z"
            {...STROKE}
          />
        </svg>
      )
    default:
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="7" {...STROKE} />
        </svg>
      )
  }
}
