import { useRef, useState } from 'react'
import { cellsForDrag } from './selection'
import type { WordPlacement } from '../engine/types'

const FOUND_COLORS = [
  'var(--sky-400)',
  'var(--mint-400)',
  'var(--peach-400)',
  'var(--lavender-400)',
  'var(--butter-400)',
  'var(--coral-400)',
]

interface CellPos {
  row: number
  col: number
}

function arraysEqual(a: number[], b: number[]): boolean {
  return a.length === b.length && a.every((v, i) => v === b[i])
}

export function WordSearchGrid({
  grid,
  size,
  allPlacements,
  foundPlacements,
  hintCells,
  onWordFound,
  onDragStart,
  onDragEnd,
}: {
  grid: string[]
  size: number
  /** Every placement in the puzzle, found or not — used to test a completed drag against. */
  allPlacements: WordPlacement[]
  foundPlacements: WordPlacement[]
  /** Cells of an unfound word being briefly revealed by the Hint button. */
  hintCells?: number[] | null
  onWordFound: (placement: WordPlacement) => void
  onDragStart?: () => void
  onDragEnd?: () => void
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [start, setStart] = useState<CellPos | null>(null)
  const [current, setCurrent] = useState<CellPos | null>(null)

  const foundWordSet = new Set(foundPlacements.map((p) => p.word))
  const foundCellColor = new Map<number, string>()
  foundPlacements.forEach((placement, i) => {
    const color = FOUND_COLORS[i % FOUND_COLORS.length]
    placement.cells.forEach((cellIndex) => foundCellColor.set(cellIndex, color))
  })

  const dragCells =
    start && current
      ? cellsForDrag(start.row, start.col, current.row - start.row, current.col - start.col, size)
      : []
  const dragCellSet = new Set(dragCells.map((c) => c.row * size + c.col))

  function cellFromPoint(clientX: number, clientY: number): CellPos | null {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return null
    const cellSize = rect.width / size
    const col = Math.floor((clientX - rect.left) / cellSize)
    const row = Math.floor((clientY - rect.top) / cellSize)
    if (row < 0 || row >= size || col < 0 || col >= size) return null
    return { row, col }
  }

  function handlePointerDown(e: React.PointerEvent) {
    const cell = cellFromPoint(e.clientX, e.clientY)
    if (!cell) return
    containerRef.current?.setPointerCapture(e.pointerId)
    setStart(cell)
    setCurrent(cell)
    onDragStart?.()
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!start) return
    const cell = cellFromPoint(e.clientX, e.clientY)
    if (cell) setCurrent(cell)
  }

  function finishDrag() {
    if (start && current) {
      const cells = cellsForDrag(
        start.row,
        start.col,
        current.row - start.row,
        current.col - start.col,
        size,
      )
      const indices = cells.map((c) => c.row * size + c.col)
      const reversed = [...indices].reverse()

      const match = allPlacements.find(
        (p) =>
          !foundWordSet.has(p.word) &&
          (arraysEqual(p.cells, indices) || arraysEqual(p.cells, reversed)),
      )
      if (match) onWordFound(match)
    }
    setStart(null)
    setCurrent(null)
    onDragEnd?.()
  }

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={finishDrag}
      onPointerCancel={finishDrag}
      className="mx-auto grid aspect-square w-full max-w-[420px] touch-none select-none gap-[2px] rounded-[20px] border border-[var(--color-surface-outline)] bg-[var(--color-surface)] p-2 shadow-[0_10px_24px_var(--color-shadow)]"
      style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}
      data-testid="word-search-grid"
    >
      {grid.map((letter, i) => {
        const isFoundColor = foundCellColor.get(i)
        const isDragging = dragCellSet.has(i)
        const isHint = hintCells?.includes(i) ?? false
        return (
          <div
            key={i}
            className={`flex items-center justify-center rounded-md font-[var(--font-heading)] text-[clamp(10px,2.6vw,16px)] font-bold ${isHint ? 'animate-pulse' : ''}`}
            style={{
              background:
                isFoundColor ??
                (isHint
                  ? 'var(--butter-400)'
                  : isDragging
                    ? 'var(--color-accent-soft)'
                    : 'transparent'),
              color: isFoundColor || isHint ? 'var(--navy-900)' : 'var(--color-text-primary)',
            }}
          >
            {letter}
          </div>
        )
      })}
    </div>
  )
}
