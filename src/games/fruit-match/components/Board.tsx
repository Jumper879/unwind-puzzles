import { FruitIcon } from './FruitIcon'
import { rowColOf } from '../engine/board'
import { BOARD_SIZE } from '../engine/types'
import type { Board as BoardType } from '../engine/types'

export function Board({
  board,
  selected,
  onCellClick,
  disabled,
}: {
  board: BoardType
  selected: number | null
  onCellClick: (index: number) => void
  disabled: boolean
}) {
  return (
    <div
      className="mx-auto grid aspect-square w-full max-w-[380px] gap-[2px] rounded-[20px] border border-[var(--color-surface-outline)] bg-[var(--color-surface)] p-1.5 shadow-[0_10px_24px_var(--color-shadow)]"
      style={{ gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)` }}
    >
      {board.map((cell, i) => {
        const [row, col] = rowColOf(i)
        if (!cell) return <div key={i} />
        return (
          <button
            key={i}
            type="button"
            disabled={disabled}
            onClick={() => onCellClick(i)}
            aria-label={`Row ${row + 1} column ${col + 1}, fruit ${cell.fruit + 1}${cell.special !== 'none' ? `, ${cell.special} special` : ''}`}
            className="flex aspect-square items-center justify-center rounded-md"
            style={{
              background: selected === i ? 'var(--color-accent-soft)' : 'transparent',
            }}
          >
            <FruitIcon fruit={cell.fruit} special={cell.special} />
          </button>
        )
      })}
    </div>
  )
}
