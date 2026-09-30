import { Chess } from 'chess.js'
import type { Square } from 'chess.js'
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
import { FullGameSetup } from './FullGameSetup'
import { Board } from './Board'
import { toBoardCells } from '../engine/boardCells'
import { StockfishEngine } from '../engine/stockfish'
import { DIFFICULTY_CONFIG } from '../engine/types'
import { computeFullGameScore, computeFullGameStars } from '../engine/scoring'
import type { GameOutcome } from '../engine/scoring'
import type { ChessDifficulty } from '../engine/types'

type Phase = 'setup' | 'playing' | 'result'

interface ResultState {
  outcome: GameOutcome
  score: number
  stars: 0 | 1 | 2 | 3
  timeMs: number
  isNewBest: boolean
}

export function FullGamePage() {
  const navigate = useNavigate()
  const platform = usePlatform()

  const [difficulty, setDifficulty] = useState<ChessDifficulty>('medium')
  const [phase, setPhase] = useState<Phase>('setup')
  const [fen, setFen] = useState(new Chess().fen())
  const [history, setHistory] = useState<string[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [flipped, setFlipped] = useState(false)
  const [isThinking, setIsThinking] = useState(false)
  const [lastMove, setLastMove] = useState<[string, string] | null>(null)
  const [hintMove, setHintMove] = useState<[string, string] | null>(null)
  const [result, setResult] = useState<ResultState | null>(null)

  useRegisterActiveRound(phase === 'playing', false)

  const engineRef = useRef<StockfishEngine | null>(null)
  const startTimeRef = useRef(0)

  useEffect(() => {
    return () => engineRef.current?.terminate()
  }, [])

  const chess = new Chess(fen)

  const finish = useCallback(
    (outcome: GameOutcome) => {
      const timeMs = Date.now() - startTimeRef.current
      const score = computeFullGameScore(outcome, difficulty)
      const stars = computeFullGameStars(outcome)
      const isNewBest = recordLocalBest('chess', 'full-game', difficulty, score, timeMs)
      platform.haptics.notification(
        outcome === 'win' ? 'success' : outcome === 'loss' ? 'error' : 'warning',
      )
      setResult({ outcome, score, stars, timeMs, isNewBest })
      setPhase('result')
    },
    [difficulty, platform],
  )

  function checkGameOver(position: Chess): GameOutcome | null {
    if (!position.isGameOver()) return null
    if (position.isCheckmate()) return position.turn() === 'b' ? 'win' : 'loss'
    return 'draw'
  }

  async function handleStart() {
    engineRef.current?.terminate()
    const engine = new StockfishEngine()
    await engine.setSkillLevel(DIFFICULTY_CONFIG[difficulty].skillLevel)
    engineRef.current = engine

    const fresh = new Chess()
    setFen(fresh.fen())
    setHistory([])
    setSelected(null)
    setLastMove(null)
    setHintMove(null)
    setResult(null)
    startTimeRef.current = Date.now()
    setPhase('playing')
  }

  async function playAiMove(position: Chess) {
    const engine = engineRef.current
    if (!engine) return
    setIsThinking(true)
    const uci = await engine.bestMove(position.fen(), DIFFICULTY_CONFIG[difficulty].moveTimeMs)
    const from = uci.slice(0, 2)
    const to = uci.slice(2, 4)
    const promotion = uci.length > 4 ? uci.slice(4) : undefined
    position.move({ from, to, promotion })
    setLastMove([from, to])
    setIsThinking(false)
    setFen(position.fen())

    const outcome = checkGameOver(position)
    if (outcome) finish(outcome)
  }

  function handleSquareClick(square: string) {
    if (isThinking || phase !== 'playing') return
    setHintMove(null)

    if (selected) {
      if (selected === square) {
        setSelected(null)
        return
      }
      const legal = chess.moves({ square: selected as Square, verbose: true })
      const move = legal.find((m) => m.to === square)
      if (move) {
        setHistory((h) => [...h, fen])
        const next = new Chess(fen)
        next.move({ from: selected, to: square, promotion: 'q' })
        setLastMove([selected, square])
        setSelected(null)
        setFen(next.fen())

        const outcome = checkGameOver(next)
        if (outcome) {
          finish(outcome)
        } else {
          void playAiMove(next)
        }
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

  function handleUndo() {
    if (isThinking || history.length === 0) return
    const prevFen = history[history.length - 1]
    setHistory((h) => h.slice(0, -1))
    setFen(prevFen)
    setSelected(null)
    setLastMove(null)
  }

  async function handleHint() {
    if (isThinking || !engineRef.current) return
    const uci = await engineRef.current.bestMove(fen, 500)
    setHintMove([uci.slice(0, 2), uci.slice(2, 4)])
  }

  if (phase === 'setup') {
    return (
      <div className="flex flex-1 flex-col pb-10">
        <TopBar center={<span className="font-[var(--font-heading)] font-extrabold">Chess</span>} />
        <FullGameSetup
          difficulty={difficulty}
          onDifficultyChange={setDifficulty}
          onStart={handleStart}
        />
      </div>
    )
  }

  const legalTargets = new Set(
    selected ? chess.moves({ square: selected as Square, verbose: true }).map((m) => m.to) : [],
  )
  const statusText = isThinking
    ? "Opponent's move…"
    : chess.inCheck()
      ? 'Check!'
      : chess.turn() === 'w'
        ? 'Your move'
        : "Opponent's move"

  return (
    <div className="flex flex-1 flex-col pb-10">
      <TopBar
        center={<span className="font-[var(--font-heading)] font-extrabold">Chess</span>}
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
        <Mascot mood={isThinking ? 'thinking' : 'relaxed'} size={56} />
        <SpeechBubble>
          <p className="text-sm font-bold text-[var(--color-text-primary)]">{statusText}</p>
        </SpeechBubble>

        <div className="mt-4 w-full">
          <Board
            cells={toBoardCells(chess)}
            size={8}
            flipped={flipped}
            selected={selected}
            legalTargets={legalTargets}
            lastMove={hintMove ?? lastMove}
            onSquareClick={handleSquareClick}
          />
        </div>

        <div className="mt-4 grid w-full grid-cols-3 gap-2">
          <Button
            variant="surface"
            className="text-sm"
            onClick={handleUndo}
            disabled={isThinking || history.length === 0}
          >
            Undo
          </Button>
          <Button variant="surface" className="text-sm" onClick={handleHint} disabled={isThinking}>
            Hint
          </Button>
          <Button variant="surface" className="text-sm" onClick={() => setFlipped((f) => !f)}>
            Flip
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
                : 'Opponent wins'
          }
          onReplay={handleStart}
          onHome={() => navigate('/')}
        />
      )}
    </div>
  )
}
