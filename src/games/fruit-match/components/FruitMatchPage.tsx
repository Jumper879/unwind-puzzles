import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TopBar } from '../../../components/TopBar'
import { Mascot } from '../../../mascot/Mascot'
import { SpeechBubble } from '../../../components/SpeechBubble'
import { ResultSheet } from '../../../components/ResultSheet'
import { recordLocalBest, recordLocalLevelResult } from '../../../lib/localGameStore'
import { usePlatform } from '../../../platform/PlatformProvider'
import { useRegisterActiveRound } from '../../../lib/useRegisterActiveRound'
import { createRng } from '../../../lib/rng'
import { SetupScreen } from './SetupScreen'
import { Board } from './Board'
import { createPlayableBoard, hasAnyPossibleMove, isAdjacent } from '../engine/board'
import { findMatchedCellIndices } from '../engine/match'
import { resolveSwap } from '../engine/resolve'
import { computeStars, moveLimitFor, targetScoreFor } from '../engine/scoring'
import type { Board as BoardType, Difficulty } from '../engine/types'

type Phase = 'setup' | 'playing' | 'result'

interface ResultState {
  score: number
  stars: 0 | 1 | 2 | 3
  timeMs: number
  isNewBest: boolean
  reachedTarget: boolean
}

export function FruitMatchPage() {
  const navigate = useNavigate()
  const platform = usePlatform()

  const [difficulty, setDifficulty] = useState<Difficulty>('easy')
  const [level, setLevel] = useState(1)
  const [phase, setPhase] = useState<Phase>('setup')
  const [board, setBoard] = useState<BoardType>([])
  const [selected, setSelected] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [movesUsed, setMovesUsed] = useState(0)
  const [result, setResult] = useState<ResultState | null>(null)

  useRegisterActiveRound(phase === 'playing', false)

  const rngRef = useRef<() => number>(() => 0)
  const startTimeRef = useRef(0)
  const targetScore = targetScoreFor(level, difficulty)
  const moveLimit = moveLimitFor(difficulty)

  function handleStart(chosenLevel: number) {
    const rng = createRng(`${difficulty}-level-${chosenLevel}`)
    rngRef.current = rng
    setLevel(chosenLevel)
    setBoard(createPlayableBoard(rng, findMatchedCellIndices))
    setSelected(null)
    setScore(0)
    setMovesUsed(0)
    setResult(null)
    startTimeRef.current = Date.now()
    setPhase('playing')
  }

  function finish(finalScore: number, reachedTarget: boolean) {
    const timeMs = Date.now() - startTimeRef.current
    const stars = reachedTarget ? computeStars(finalScore, targetScore) : 0
    const isNewBest = recordLocalBest('fruit-match', 'classic', difficulty, finalScore, timeMs)
    recordLocalLevelResult('fruit-match', 'classic', difficulty, level, stars)
    platform.haptics.notification(reachedTarget ? 'success' : 'warning')
    setResult({ score: finalScore, stars, timeMs, isNewBest, reachedTarget })
    setPhase('result')
  }

  function handleCellClick(index: number) {
    if (selected === null) {
      setSelected(index)
      return
    }
    if (selected === index) {
      setSelected(null)
      return
    }
    if (!isAdjacent(selected, index)) {
      setSelected(index)
      return
    }

    const result = resolveSwap(board, selected, index, rngRef.current)
    setSelected(null)
    if (!result.valid) return // no match — a calm no-op, not an error state

    platform.haptics.impact(result.cascades > 1 ? 'heavy' : 'light')

    let nextBoard = result.board
    if (!hasAnyPossibleMove(nextBoard, findMatchedCellIndices)) {
      nextBoard = createPlayableBoard(rngRef.current, findMatchedCellIndices)
    }
    setBoard(nextBoard)

    const nextScore = score + result.scoreGained
    const nextMoves = movesUsed + 1
    setScore(nextScore)
    setMovesUsed(nextMoves)

    if (nextScore >= targetScore) {
      finish(nextScore, true)
    } else if (nextMoves >= moveLimit) {
      finish(nextScore, false)
    }
  }

  if (phase === 'setup') {
    return (
      <div className="flex flex-1 flex-col pb-10">
        <TopBar
          center={<span className="font-[var(--font-heading)] font-extrabold">Fruit Match</span>}
        />
        <SetupScreen
          difficulty={difficulty}
          onDifficultyChange={setDifficulty}
          onStart={handleStart}
        />
      </div>
    )
  }

  const movesLeft = Math.max(0, moveLimit - movesUsed)

  return (
    <div className="flex flex-1 flex-col pb-10">
      <TopBar
        center={
          <span className="font-[var(--font-heading)] font-extrabold">
            Fruit Match · Lv {level}
          </span>
        }
        right={
          <button
            type="button"
            onClick={() => setPhase('setup')}
            aria-label="Restart"
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--color-surface-outline)] bg-[var(--color-surface)] shadow-[0_6px_14px_var(--color-shadow)] active:scale-95"
          >
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden>
              <path
                d="M16 4v4h-4M4 16v-4h4M4.5 8a5.5 5.5 0 019.6-2.7M15.5 12A5.5 5.5 0 015.9 14.7"
                stroke="currentColor"
                strokeWidth={1.6}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        }
      />

      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col items-center px-4 pt-3">
        <Mascot mood="relaxed" size={56} />
        <SpeechBubble>
          <p className="text-sm font-bold text-[var(--color-text-primary)]">
            {score} / {targetScore} · {movesLeft} moves left
          </p>
        </SpeechBubble>

        <div className="mt-4 w-full">
          <Board
            board={board}
            selected={selected}
            onCellClick={handleCellClick}
            disabled={phase !== 'playing'}
          />
        </div>
      </div>

      {phase === 'result' && result && (
        <ResultSheet
          stars={result.stars}
          score={result.score}
          timeMs={result.timeMs}
          isNewBest={result.isNewBest}
          message={result.reachedTarget ? 'Target reached!' : 'Out of moves'}
          onReplay={() => handleStart(level)}
          onHome={() => navigate('/')}
        />
      )}
    </div>
  )
}
