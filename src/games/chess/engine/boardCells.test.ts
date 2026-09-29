import { Chess } from 'chess.js'
import { describe, expect, it } from 'vitest'
import { toBoardCells } from './boardCells'

describe('toBoardCells', () => {
  it('produces 64 cells, all with a real square name', () => {
    const cells = toBoardCells(new Chess())
    expect(cells).toHaveLength(64)
    for (const cell of cells) {
      expect(cell.square).toMatch(/^[a-h][1-8]$/)
    }
    expect(new Set(cells.map((c) => c.square)).size).toBe(64)
  })

  it('places the starting position correctly', () => {
    const cells = toBoardCells(new Chess())
    const at = (sq: string) => cells.find((c) => c.square === sq)?.piece

    expect(at('a1')).toEqual({ type: 'r', color: 'w' })
    expect(at('e1')).toEqual({ type: 'k', color: 'w' })
    expect(at('d8')).toEqual({ type: 'q', color: 'b' })
    expect(at('e2')).toEqual({ type: 'p', color: 'w' })
    expect(at('e4')).toBeNull()
  })

  it('reflects a position after a move', () => {
    const chess = new Chess()
    chess.move('e4')
    const cells = toBoardCells(chess)
    const at = (sq: string) => cells.find((c) => c.square === sq)?.piece

    expect(at('e2')).toBeNull()
    expect(at('e4')).toEqual({ type: 'p', color: 'w' })
  })
})
