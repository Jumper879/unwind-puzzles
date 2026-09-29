import type { CapturePieceType } from '../engine/capturePuzzle'

const PIECE_GLYPHS: Record<CapturePieceType, string> = { knight: '♘', bishop: '♗', rook: '♖' }

export function CaptureBoard({
  size,
  pieceType,
  position,
  targets,
  legalMoves,
  onSquareClick,
}: {
  size: number
  pieceType: CapturePieceType
  position: number
  targets: Set<number>
  legalMoves: Set<number>
  onSquareClick: (square: number) => void
}) {
  return (
    <div
      className="mx-auto grid aspect-square w-full max-w-[340px] gap-[2px] rounded-[16px] border-2 border-[var(--navy-900)] bg-[var(--navy-900)] p-[2px]"
      style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}
    >
      {Array.from({ length: size * size }, (_, i) => {
        const row = Math.floor(i / size)
        const col = i % size
        const isLight = (row + col) % 2 === 0
        const isPiece = position === i
        const isTarget = targets.has(i)
        const isLegal = legalMoves.has(i)
        return (
          <button
            key={i}
            type="button"
            onClick={() => onSquareClick(i)}
            aria-label={`Square ${i}${isPiece ? ', piece here' : isTarget ? ', black pawn' : ''}`}
            className="relative flex items-center justify-center text-[clamp(18px,6vw,30px)]"
            style={{ background: isLight ? 'var(--color-surface)' : 'var(--sky-200)' }}
          >
            {isPiece && <span>{PIECE_GLYPHS[pieceType]}</span>}
            {isTarget && !isPiece && <span>♟</span>}
            {isLegal && (
              <span className="absolute h-[26%] w-[26%] rounded-full bg-[var(--color-accent)] opacity-50" />
            )}
          </button>
        )
      })}
    </div>
  )
}
