import type { GridTemplate, Slot } from './types'

export function slotsAtCell(slots: Slot[], cellIndex: number): { across?: Slot; down?: Slot } {
  const across = slots.find((s) => s.direction === 'across' && s.cells.includes(cellIndex))
  const down = slots.find((s) => s.direction === 'down' && s.cells.includes(cellIndex))
  return { across, down }
}

export function templateToSolution(template: GridTemplate): {
  width: number
  height: number
  solution: (string | null)[]
} {
  const height = template.rows.length
  const width = template.rows[0].length
  const solution: (string | null)[] = []
  for (const row of template.rows) {
    for (const ch of row) solution.push(ch === '#' ? null : '')
  }
  return { width, height, solution }
}

/** Standard crossword numbering: a fillable cell gets the next number if it starts an across and/or down run of length >= 2. Reading order, left-to-right then top-to-bottom. */
export function computeSlots(width: number, height: number, solution: (string | null)[]): Slot[] {
  const slots: Slot[] = []
  let number = 0

  const isBlock = (row: number, col: number) =>
    row < 0 || row >= height || col < 0 || col >= width || solution[row * width + col] === null

  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      if (isBlock(row, col)) continue

      const startsAcross = isBlock(row, col - 1) && !isBlock(row, col + 1)
      const startsDown = isBlock(row - 1, col) && !isBlock(row + 1, col)
      if (!startsAcross && !startsDown) continue

      number++

      if (startsAcross) {
        const cells: number[] = []
        let c = col
        while (!isBlock(row, c)) {
          cells.push(row * width + c)
          c++
        }
        slots.push({ number, direction: 'across', cells, length: cells.length })
      }
      if (startsDown) {
        const cells: number[] = []
        let r = row
        while (!isBlock(r, col)) {
          cells.push(r * width + col)
          r++
        }
        slots.push({ number, direction: 'down', cells, length: cells.length })
      }
    }
  }

  return slots
}
