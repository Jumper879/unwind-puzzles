const PIECE_GLYPHS: Record<string, string> = {
  wp: '♙',
  wn: '♘',
  wb: '♗',
  wr: '♖',
  wq: '♕',
  wk: '♔',
  bp: '♟',
  bn: '♞',
  bb: '♝',
  br: '♜',
  bq: '♛',
  bk: '♚',
}

export interface BoardCell {
  square: string // e.g. "e4"
  piece: { type: string; color: 'w' | 'b' } | null
}

export function Board({
  cells,
  size,
  flipped,
  selected,
  legalTargets,
  lastMove,
  onSquareClick,
}: {
  cells: BoardCell[]
  size: number
  flipped: boolean
  selected: string | null
  legalTargets: Set<string>
  lastMove: [string, string] | null
  onSquareClick: (square: string) => void
}) {
  const ordered = flipped ? [...cells].reverse() : cells

  return (
    <div
      className="mx-auto grid aspect-square w-full max-w-[380px] overflow-hidden rounded-[16px] border-2 border-[var(--navy-900)]"
      style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}
    >
      {ordered.map(({ square, piece }) => {
        const file = square.charCodeAt(0) - 97
        const rank = Number(square[1])
        const isLight = (file + rank) % 2 === 1
        const isSelected = selected === square
        const isTarget = legalTargets.has(square)
        const isLastMove = lastMove?.includes(square) ?? false

        return (
          <button
            key={square}
            type="button"
            onClick={() => onSquareClick(square)}
            aria-label={`${square}${piece ? `, ${piece.color === 'w' ? 'white' : 'black'} ${piece.type}` : ', empty'}`}
            className="relative flex items-center justify-center text-[clamp(18px,7vw,32px)]"
            style={{
              background: isSelected
                ? 'var(--color-accent)'
                : isLastMove
                  ? 'var(--butter-200)'
                  : isLight
                    ? 'var(--color-surface)'
                    : 'var(--sky-200)',
            }}
          >
            {piece && <span>{PIECE_GLYPHS[`${piece.color}${piece.type}`]}</span>}
            {isTarget && !piece && (
              <span className="absolute h-[26%] w-[26%] rounded-full bg-[var(--color-accent)] opacity-50" />
            )}
            {isTarget && piece && (
              <span className="absolute inset-1 rounded-full border-[3px] border-[var(--coral-500)]" />
            )}
          </button>
        )
      })}
    </div>
  )
}
