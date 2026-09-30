import { Chess } from 'chess.js'
import type { Square } from 'chess.js'
import { useState } from 'react'
import { Button } from '../../../components/Button'
import { Mascot } from '../../../mascot/Mascot'
import { SpeechBubble } from '../../../components/SpeechBubble'
import { ResultSheet } from '../../../components/ResultSheet'
import { Board } from './Board'
import { toBoardCells } from '../engine/boardCells'
import { recordLocalBest } from '../../../lib/localGameStore'
import { usePlatform } from '../../../platform/PlatformProvider'
import { useRegisterActiveRound } from '../../../lib/useRegisterActiveRound'
import { computePuzzleScore, computePuzzleStars } from '../engine/scoring'
import type { ChessPuzzle } from '../engine/types'

export function MatePuzzlePlayer({
  puzzle,
  onHome,
  onNext,
}: {
  puzzle: ChessPuzzle
  onHome: () => void
  onNext: () => void
}) {
  const platform = usePlatform()
  const [fen, setFen] = useState(puzzle.fen)
  const [selected, setSelected] = useState<string | null>(null)
  const [hintUsed, setHintUsed] = useState(false)
  const [hintMove, setHintMove] = useState<[string, string] | null>(null)
  const [solved, setSolved] = useState<boolean | null>(null)

  useRegisterActiveRound(solved === null, false)

  const chess = new Chess(fen)

  function reset() {
    setFen(puzzle.fen)
    setSelected(null)
    setHintMove(null)
    setSolved(null)
  }

  function handleSquareClick(square: string) {
    if (solved !== null) return
    setHintMove(null)

    if (selected) {
      if (selected === square) {
        setSelected(null)
        return
      }
      const legal = chess.moves({ square: selected as Square, verbose: true })
      const move = legal.find((m) => m.to === square)
      if (move) {
        const next = new Chess(fen)
        next.move({ from: selected, to: square, promotion: 'q' })
        setSelected(null)
        setFen(next.fen())

        const success = next.isCheckmate()
        setSolved(success)
        platform.haptics.notification(success ? 'success' : 'warning')
        const score = computePuzzleScore(success, hintUsed ? 1 : 0)
        recordLocalBest('chess', 'puzzle', puzzle.difficulty, score, 0)
        return
      }
    }

    const piece = chess.get(square as Square)
    if (piece && piece.color === chess.turn()) {
      setSelected(square)
    } else {
      setSelected(null)
    }
  }

  function handleHint() {
    if (solved !== null) return
    setHintUsed(true)
    setHintMove([puzzle.solution[0].slice(0, 2), puzzle.solution[0].slice(2, 4)])
  }

  const legalTargets = new Set(
    selected ? chess.moves({ square: selected as Square, verbose: true }).map((m) => m.to) : [],
  )
  const score = solved ? computePuzzleScore(true, hintUsed ? 1 : 0) : 0
  const stars = solved ? computePuzzleStars(true, hintUsed ? 1 : 0) : 0

  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col items-center px-4 pt-3">
      <Mascot mood={solved === false ? 'encouraging' : 'thinking'} size={56} />
      <SpeechBubble>
        <p className="text-sm font-bold text-[var(--color-text-primary)]">{puzzle.goal}</p>
      </SpeechBubble>

      <div className="mt-4 w-full">
        <Board
          cells={toBoardCells(chess)}
          size={8}
          flipped={false}
          selected={selected}
          legalTargets={legalTargets}
          lastMove={hintMove}
          onSquareClick={handleSquareClick}
        />
      </div>

      <div className="mt-4 flex w-full gap-3">
        <Button
          variant="surface"
          className="flex-1"
          onClick={handleHint}
          disabled={solved !== null}
        >
          Hint
        </Button>
        <Button variant="surface" className="flex-1" onClick={reset}>
          Reset
        </Button>
      </div>

      {solved === false && (
        <p className="mt-3 text-sm text-[var(--color-text-secondary)]">
          Not quite — that's not checkmate. Try again.
        </p>
      )}

      {solved === true && (
        <ResultSheet
          stars={stars}
          score={score}
          timeMs={0}
          isNewBest={false}
          message="Checkmate!"
          onReplay={onNext}
          onHome={onHome}
        />
      )}
    </div>
  )
}
