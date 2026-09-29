import type { CrosswordPuzzle } from '../engine/types'

export function CrosswordGrid({
  puzzle,
  userGrid,
  selectedCell,
  activeCells,
  incorrectCells,
  onCellClick,
}: {
  puzzle: CrosswordPuzzle
  userGrid: (string | null)[]
  selectedCell: number | null
  activeCells: Set<number>
  incorrectCells: Set<number>
  onCellClick: (index: number) => void
}) {
  const numberByCell = new Map<number, number>()
  for (const slot of puzzle.slots) {
    if (!numberByCell.has(slot.cells[0])) numberByCell.set(slot.cells[0], slot.number)
  }

  return (
    <div
      className="mx-auto grid aspect-square w-full max-w-[380px] gap-[2px] rounded-[16px] border-2 border-[var(--navy-900)] bg-[var(--navy-900)] p-[2px]"
      style={{ gridTemplateColumns: `repeat(${puzzle.width}, 1fr)` }}
    >
      {puzzle.solution.map((cell, i) => {
        if (cell === null) return <div key={i} className="bg-[var(--navy-900)]" />
        const number = numberByCell.get(i)
        const isSelected = selectedCell === i
        const isActive = activeCells.has(i)
        const isIncorrect = incorrectCells.has(i)
        return (
          <button
            key={i}
            type="button"
            onClick={() => onCellClick(i)}
            aria-label={`Cell ${i}${userGrid[i] ? `, ${userGrid[i]}` : ', empty'}`}
            className="relative flex items-center justify-center text-[clamp(12px,4vw,18px)] font-bold"
            style={{
              background: isSelected
                ? 'var(--color-accent)'
                : isActive
                  ? 'var(--color-accent-soft)'
                  : 'var(--color-surface)',
              color: isSelected
                ? 'white'
                : isIncorrect
                  ? 'var(--coral-600)'
                  : 'var(--color-text-primary)',
            }}
          >
            {number && (
              <span className="absolute left-0.5 top-0 text-[7px] font-semibold leading-none opacity-70">
                {number}
              </span>
            )}
            {userGrid[i]}
          </button>
        )
      })}
    </div>
  )
}
