import { MosaicTile } from './MosaicTile'
import type { CellPattern } from '../engine/types'

export function MosaicGrid({
  grid,
  missingRow,
  missingCol,
  revealed,
}: {
  grid: CellPattern[][]
  missingRow: number
  missingCol: number
  /** Once the puzzle is solved, show the real pattern in the missing slot too. */
  revealed: CellPattern | null
}) {
  const gridSize = grid.length

  return (
    <div
      className="grid w-full gap-1.5 rounded-2xl border border-[var(--color-surface-outline)] bg-[var(--color-surface)] p-2"
      style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}
    >
      {grid.map((row, r) =>
        row.map((cell, c) => {
          const isMissing = r === missingRow && c === missingCol
          if (isMissing && !revealed) {
            return (
              <div
                key={`${r}-${c}`}
                className="flex aspect-square items-center justify-center rounded-lg border-2 border-dashed border-[var(--color-accent)]"
                style={{ background: 'var(--color-accent-soft)' }}
              >
                <span className="text-lg font-extrabold text-[var(--color-accent-strong)]">?</span>
              </div>
            )
          }
          const shown = isMissing && revealed ? revealed : cell
          return <MosaicTile key={`${r}-${c}`} pattern={shown} />
        }),
      )}
    </div>
  )
}
