import { Chess } from 'chess.js'
import { describe, expect, it } from 'vitest'
import { MATE_PUZZLES } from './matePuzzles'

describe('MATE_PUZZLES', () => {
  it('every puzzle FEN is a legal, valid position', () => {
    for (const puzzle of MATE_PUZZLES) {
      expect(() => new Chess(puzzle.fen), `"${puzzle.id}" FEN should be valid`).not.toThrow()
    }
  })

  it("every puzzle's claimed solution move is actually checkmate — verified by chess.js, not hand-reasoning", () => {
    for (const puzzle of MATE_PUZZLES) {
      const chess = new Chess(puzzle.fen)
      expect(
        puzzle.solution,
        `"${puzzle.id}" should have exactly one move for a mate-in-1`,
      ).toHaveLength(1)

      const uciMove = puzzle.solution[0]
      const move = chess.move({ from: uciMove.slice(0, 2), to: uciMove.slice(2, 4) })
      expect(move, `"${puzzle.id}"'s claimed move ${uciMove} should be legal`).toBeTruthy()
      expect(
        chess.isCheckmate(),
        `"${puzzle.id}"'s claimed move ${uciMove} should deliver checkmate`,
      ).toBe(true)
    }
  })

  it('the side to move matches playerColor', () => {
    for (const puzzle of MATE_PUZZLES) {
      const chess = new Chess(puzzle.fen)
      expect(chess.turn()).toBe(puzzle.playerColor)
    }
  })
})
