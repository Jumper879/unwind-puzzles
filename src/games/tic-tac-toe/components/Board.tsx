import { motion } from 'framer-motion'
import { boardSize } from '../engine/board'
import type { Board as BoardType, TicTacToeMode } from '../engine/types'

function Mark({ value }: { value: 'X' | 'O' }) {
  const color = value === 'X' ? 'var(--blue-500)' : 'var(--coral-500)'
  return (
    <motion.svg
      viewBox="0 0 24 24"
      width="62%"
      height="62%"
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
    >
      {value === 'X' ? (
        <g stroke={color} strokeWidth={3} strokeLinecap="round">
          <line x1="5" y1="5" x2="19" y2="19" />
          <line x1="19" y1="5" x2="5" y2="19" />
        </g>
      ) : (
        <circle cx="12" cy="12" r="8" fill="none" stroke={color} strokeWidth={3} />
      )}
    </motion.svg>
  )
}

export function Board({
  board,
  mode,
  onCellClick,
  disabled,
  winLine,
  hintCell,
}: {
  board: BoardType
  mode: TicTacToeMode
  onCellClick: (index: number) => void
  disabled: boolean
  winLine: number[] | null
  hintCell: number | null
}) {
  const size = boardSize(mode)

  return (
    <div
      className="mx-auto grid aspect-square w-full max-w-[340px] gap-2 rounded-[28px] border border-[var(--color-surface-outline)] bg-[var(--color-surface)] p-3 shadow-[0_10px_24px_var(--color-shadow)]"
      style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}
    >
      {board.map((cell, i) => {
        const isWinning = winLine?.includes(i) ?? false
        const isHint = hintCell === i
        return (
          <button
            key={i}
            type="button"
            disabled={disabled || cell !== null}
            onClick={() => onCellClick(i)}
            aria-label={cell ? `Cell ${i + 1}, ${cell}` : `Cell ${i + 1}, empty`}
            className={`flex aspect-square items-center justify-center rounded-2xl border transition-colors ${
              isWinning
                ? 'border-[var(--mint-500)] bg-[var(--mint-100)]'
                : isHint
                  ? 'border-[var(--color-accent)] bg-[var(--color-accent-soft)]'
                  : 'border-[var(--color-surface-outline)] bg-[var(--color-bg)]'
            } ${!disabled && cell === null ? 'active:scale-95' : ''}`}
          >
            {cell && <Mark value={cell} />}
          </button>
        )
      })}
    </div>
  )
}
