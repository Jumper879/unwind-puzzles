import { useState } from 'react'
import { Button } from '../../../components/Button'
import { Mascot } from '../../../mascot/Mascot'
import { SpeechBubble } from '../../../components/SpeechBubble'
import { ResultSheet } from '../../../components/ResultSheet'
import { CaptureBoard } from './CaptureBoard'
import { movesFrom, solveMinMoves } from '../engine/capturePuzzle'
import { recordLocalBest } from '../../../lib/localGameStore'
import { usePlatform } from '../../../platform/PlatformProvider'
import { computePuzzleScore, computePuzzleStars } from '../engine/scoring'
import type { CapturePuzzleDef } from '../engine/capturePuzzle'

export function CapturePuzzlePlayer({
  puzzle,
  onHome,
  onNext,
}: {
  puzzle: CapturePuzzleDef
  onHome: () => void
  onNext: () => void
}) {
  const platform = usePlatform()
  const [position, setPosition] = useState(puzzle.start)
  const [remaining, setRemaining] = useState(new Set(puzzle.targets))
  const [moveCount, setMoveCount] = useState(0)
  const [solved, setSolved] = useState(false)

  const minMoves = solveMinMoves(puzzle) ?? puzzle.targets.length
  const legalMoves = new Set(movesFrom(puzzle.pieceType, position, puzzle.size, remaining))

  function handleSquareClick(square: number) {
    if (solved || !legalMoves.has(square)) return
    const nextRemaining = new Set(remaining)
    nextRemaining.delete(square)
    setRemaining(nextRemaining)
    setPosition(square)
    const nextCount = moveCount + 1
    setMoveCount(nextCount)

    if (nextRemaining.size === 0) {
      setSolved(true)
      platform.haptics.notification('success')
      const extra = Math.max(0, nextCount - minMoves)
      const score = computePuzzleScore(true, extra)
      recordLocalBest('chess', 'puzzle', puzzle.difficulty, score, 0)
    }
  }

  function reset() {
    setPosition(puzzle.start)
    setRemaining(new Set(puzzle.targets))
    setMoveCount(0)
    setSolved(false)
  }

  const extraMoves = Math.max(0, moveCount - minMoves)
  const score = solved ? computePuzzleScore(true, extraMoves) : 0
  const stars = solved ? computePuzzleStars(true, extraMoves) : 0

  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col items-center px-4 pt-3">
      <Mascot mood="relaxed" size={56} />
      <SpeechBubble>
        <p className="text-sm font-bold text-[var(--color-text-primary)]">
          Capture all the black pieces! ({remaining.size} left, {moveCount} moves)
        </p>
      </SpeechBubble>

      <div className="mt-4 w-full">
        <CaptureBoard
          size={puzzle.size}
          pieceType={puzzle.pieceType}
          position={position}
          targets={remaining}
          legalMoves={legalMoves}
          onSquareClick={handleSquareClick}
        />
      </div>

      <Button variant="surface" className="mt-4 w-full" onClick={reset}>
        Reset
      </Button>

      {solved && (
        <ResultSheet
          stars={stars}
          score={score}
          timeMs={0}
          isNewBest={false}
          message="All captured!"
          onReplay={onNext}
          onHome={onHome}
        />
      )}
    </div>
  )
}
