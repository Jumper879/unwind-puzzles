import { boxDims } from '../engine/board'
import type { Grid, SudokuSize } from '../engine/types'

export function Board({
  size,
  userGrid,
  notes,
  givenMask,
  conflicts,
  selectedDigit,
  onCellClick,
}: {
  size: SudokuSize
  userGrid: Grid
  notes: Set<number>[]
  givenMask: boolean[]
  conflicts: Set<number>
  selectedDigit: number | null
  onCellClick: (index: number) => void
}) {
  const { rows: boxRows, cols: boxCols } = boxDims(size)

  return (
    <div
      className="mx-auto grid aspect-square w-full max-w-[380px] rounded-[20px] border-2 border-[var(--navy-900)] bg-[var(--color-surface)] p-1 shadow-[0_10px_24px_var(--color-shadow)]"
      style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}
    >
      {userGrid.map((value, i) => {
        const row = Math.floor(i / size)
        const col = i % size
        const isGiven = givenMask[i]
        const isConflict = conflicts.has(i)
        const isSameDigit = selectedDigit !== null && value === selectedDigit
        const cellNotes = notes[i]

        return (
          <button
            key={i}
            type="button"
            disabled={isGiven}
            onClick={() => onCellClick(i)}
            aria-label={
              isGiven
                ? `Row ${row + 1} column ${col + 1}, given ${value}`
                : `Row ${row + 1} column ${col + 1}${value !== 0 ? `, ${value}` : ', empty'}`
            }
            className="relative flex items-center justify-center text-[clamp(12px,4vw,20px)] font-bold"
            style={{
              borderTop:
                row % boxRows === 0
                  ? '2px solid var(--navy-900)'
                  : '1px solid var(--color-surface-outline)',
              borderLeft:
                col % boxCols === 0
                  ? '2px solid var(--navy-900)'
                  : '1px solid var(--color-surface-outline)',
              borderRight: col === size - 1 ? '2px solid var(--navy-900)' : undefined,
              borderBottom: row === size - 1 ? '2px solid var(--navy-900)' : undefined,
              background: isConflict
                ? 'var(--coral-100)'
                : isSameDigit
                  ? 'var(--color-accent-soft)'
                  : isGiven
                    ? 'var(--color-bg)'
                    : 'transparent',
              color: isConflict
                ? 'var(--coral-700)'
                : isGiven
                  ? 'var(--color-text-primary)'
                  : 'var(--color-accent-strong)',
            }}
          >
            {value !== 0 ? (
              value
            ) : cellNotes && cellNotes.size > 0 ? (
              <span
                className="grid h-full w-full p-0.5 text-[8px] font-semibold text-[var(--color-text-secondary)]"
                style={{ gridTemplateColumns: `repeat(${Math.ceil(Math.sqrt(size))}, 1fr)` }}
              >
                {Array.from({ length: size }, (_, n) => n + 1).map((n) => (
                  <span key={n} className="flex items-center justify-center">
                    {cellNotes.has(n) ? n : ''}
                  </span>
                ))}
              </span>
            ) : null}
          </button>
        )
      })}
    </div>
  )
}
