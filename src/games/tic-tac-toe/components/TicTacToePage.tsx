import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TopBar } from '../../../components/TopBar'
import { Button } from '../../../components/Button'
import { Mascot } from '../../../mascot/Mascot'
import { SpeechBubble } from '../../../components/SpeechBubble'
import { ResultSheet } from '../../../components/ResultSheet'
import { recordLocalBest } from '../../../lib/localGameStore'
import { usePlatform } from '../../../platform/PlatformProvider'
import { useRegisterActiveRound } from '../../../lib/useRegisterActiveRound'
import { clearResumeState, loadResumeState, saveResumeState } from '../resume'
import { SetupScreen } from './SetupScreen'
import { Board } from './Board'
import { applyMove, checkWinner, createEmptyBoard, isBoardFull } from '../engine/board'
import { pickAiMove, suggestMove } from '../engine/ai'
import { computeScore, computeStars } from '../engine/scoring'
import type { Board as BoardType, Difficulty, TicTacToeMode } from '../engine/types'

const PLAYER = 'X' as const
const AI = 'O' as const
const AI_MOVE_DELAY_MS = 450

type Phase = 'setup' | 'playing' | 'result'
type Outcome = 'win' | 'draw' | 'loss'

interface ResultState {
  outcome: Outcome
  score: number
  stars: 0 | 1 | 2 | 3
  timeMs: number
  isNewBest: boolean
}

export function TicTacToePage() {
  const navigate = useNavigate()
  const platform = usePlatform()

  // Resume a saved mid-match, computed once via a lazy initializer (not an
  // effect + setState, which the React Compiler flags as a cascading
  // render) — this is what lets Back then Forward land back in the same
  // match instead of a fresh setup screen. X&O is the one game with real
  // save support so far; see resume.ts.
  const [resumed] = useState(() => loadResumeState())

  const [mode, setMode] = useState<TicTacToeMode>(resumed?.mode ?? 'classic')
  const [difficulty, setDifficulty] = useState<Difficulty>(resumed?.difficulty ?? 'medium')
  const [phase, setPhase] = useState<Phase>(resumed ? 'playing' : 'setup')

  const [history, setHistory] = useState<BoardType[]>(resumed?.history ?? [])
  const [turn, setTurn] = useState<'X' | 'O'>(resumed?.turn ?? PLAYER)
  const [playerMoveCount, setPlayerMoveCount] = useState(resumed?.playerMoveCount ?? 0)
  const [isAiThinking, setIsAiThinking] = useState(false)
  const [winLine, setWinLine] = useState<number[] | null>(null)
  const [hintCell, setHintCell] = useState<number | null>(null)
  const [result, setResult] = useState<ResultState | null>(null)

  const startTimeRef = useRef(resumed?.startTime ?? 0)
  const aiTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const board = history[history.length - 1] ?? createEmptyBoard(mode)

  useRegisterActiveRound(phase === 'playing', true)

  useEffect(
    () => () => {
      if (aiTimeoutRef.current) clearTimeout(aiTimeoutRef.current)
    },
    [],
  )

  // playerMoveCount takes a setter-updater to read, not a closed-over
  // value — this fires from the same synchronous handler that just called
  // setPlayerMoveCount(c => c + 1), whose new value isn't visible on
  // `playerMoveCount` itself until the next render.
  const finishMatch = useCallback(
    (finalBoard: BoardType, outcome: Outcome, movesAtFinish: number) => {
      const timeMs = Date.now() - startTimeRef.current
      const score = computeScore(outcome, movesAtFinish, mode)
      const stars = computeStars(score)
      const isNewBest = recordLocalBest('tic-tac-toe', mode, difficulty, score, timeMs)
      clearResumeState()
      platform.haptics.notification(
        outcome === 'win' ? 'success' : outcome === 'loss' ? 'error' : 'warning',
      )
      setWinLine(checkWinner(finalBoard, finalBoard.length === 9 ? 3 : 4)?.line ?? null)
      setResult({ outcome, score, stars, timeMs, isNewBest })
      setPhase('result')
    },
    [difficulty, mode, platform],
  )

  // Takes the full history-so-far explicitly (including the player's move
  // that triggered this AI turn) rather than closing over the `history`
  // state — this setTimeout callback runs 450ms after being scheduled, by
  // which point a closed-over `history` would be stale (the same class of
  // bug already fixed elsewhere in this codebase, e.g. finishMatch above).
  const runAiTurn = useCallback(
    (historySoFar: BoardType[], movesSoFar: number) => {
      const currentBoard = historySoFar[historySoFar.length - 1]
      setIsAiThinking(true)
      aiTimeoutRef.current = setTimeout(() => {
        const move = pickAiMove(currentBoard, mode, AI, difficulty)
        const next = applyMove(currentBoard, move, AI)
        const nextHistory = [...historySoFar, next]
        setHistory(nextHistory)
        setIsAiThinking(false)

        const size = mode === 'classic' ? 3 : 4
        const win = checkWinner(next, size)
        if (win) {
          finishMatch(next, 'loss', movesSoFar)
        } else if (isBoardFull(next)) {
          finishMatch(next, 'draw', movesSoFar)
        } else {
          setTurn(PLAYER)
          saveResumeState({
            mode,
            difficulty,
            history: nextHistory,
            turn: PLAYER,
            playerMoveCount: movesSoFar,
            startTime: startTimeRef.current,
          })
        }
      }, AI_MOVE_DELAY_MS)
    },
    [mode, difficulty, finishMatch],
  )

  function handleStart() {
    const empty = createEmptyBoard(mode)
    clearResumeState()
    setHistory([empty])
    setTurn(PLAYER)
    setPlayerMoveCount(0)
    setWinLine(null)
    setHintCell(null)
    setResult(null)
    startTimeRef.current = Date.now()
    setPhase('playing')
  }

  function handleCellClick(index: number) {
    if (isAiThinking || turn !== PLAYER) return
    const next = applyMove(board, index, PLAYER)
    const movesAtFinish = playerMoveCount + 1
    const nextHistory = [...history, next]
    setHistory(nextHistory)
    setPlayerMoveCount(movesAtFinish)
    setHintCell(null)

    const size = mode === 'classic' ? 3 : 4
    const win = checkWinner(next, size)
    if (win) {
      finishMatch(next, 'win', movesAtFinish)
      return
    }
    if (isBoardFull(next)) {
      finishMatch(next, 'draw', movesAtFinish)
      return
    }
    setTurn(AI)
    saveResumeState({
      mode,
      difficulty,
      history: nextHistory,
      turn: AI,
      playerMoveCount: movesAtFinish,
      startTime: startTimeRef.current,
    })
    runAiTurn(nextHistory, movesAtFinish)
  }

  function handleUndo() {
    if (isAiThinking || history.length < 3) return
    const nextHistory = history.slice(0, -2)
    const nextMoveCount = Math.max(0, playerMoveCount - 1)
    setHistory(nextHistory)
    setPlayerMoveCount(nextMoveCount)
    setHintCell(null)
    saveResumeState({
      mode,
      difficulty,
      history: nextHistory,
      turn: PLAYER,
      playerMoveCount: nextMoveCount,
      startTime: startTimeRef.current,
    })
  }

  function handleHint() {
    if (isAiThinking || turn !== PLAYER) return
    setHintCell(suggestMove(board, mode, PLAYER))
  }

  if (phase === 'setup') {
    return (
      <div className="flex flex-1 flex-col pb-10">
        <TopBar center={<span className="font-[var(--font-heading)] font-extrabold">X&O</span>} />
        <SetupScreen
          mode={mode}
          difficulty={difficulty}
          onModeChange={setMode}
          onDifficultyChange={setDifficulty}
          onStart={handleStart}
        />
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col pb-10">
      <TopBar
        center={<span className="font-[var(--font-heading)] font-extrabold">X&O</span>}
        right={
          <button
            type="button"
            onClick={() => {
              clearResumeState()
              setPhase('setup')
            }}
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

      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col items-center px-6 pt-4">
        <Mascot mood={isAiThinking ? 'thinking' : 'relaxed'} size={72} />
        <SpeechBubble>
          <p className="font-[var(--font-heading)] font-bold text-[var(--color-text-primary)]">
            {isAiThinking ? 'Thinking…' : turn === PLAYER ? 'Your move' : "Opponent's move"}
          </p>
        </SpeechBubble>

        <div className="mt-6 w-full">
          <Board
            board={board}
            mode={mode}
            onCellClick={handleCellClick}
            disabled={isAiThinking || turn !== PLAYER}
            winLine={winLine}
            hintCell={hintCell}
          />
        </div>

        <div className="mt-6 flex w-full gap-3">
          <Button
            variant="surface"
            className="flex-1"
            onClick={handleUndo}
            disabled={isAiThinking || history.length < 3}
          >
            Undo
          </Button>
          <Button
            variant="surface"
            className="flex-1"
            onClick={handleHint}
            disabled={isAiThinking || turn !== PLAYER}
          >
            Hint
          </Button>
        </div>
      </div>

      {phase === 'result' && result && (
        <ResultSheet
          stars={result.stars}
          score={result.score}
          timeMs={result.timeMs}
          isNewBest={result.isNewBest}
          message={
            result.outcome === 'win'
              ? 'You won!'
              : result.outcome === 'draw'
                ? 'Draw!'
                : 'AI wins this one'
          }
          onReplay={handleStart}
          onHome={() => navigate('/')}
        />
      )}
    </div>
  )
}
