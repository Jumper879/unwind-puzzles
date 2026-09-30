import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TopBar } from '../../../components/TopBar'
import { Button } from '../../../components/Button'
import { Mascot } from '../../../mascot/Mascot'
import { SpeechBubble } from '../../../components/SpeechBubble'
import { ResultSheet } from '../../../components/ResultSheet'
import { recordLocalBest, recordLocalLevelResult } from '../../../lib/localGameStore'
import { usePlatform } from '../../../platform/PlatformProvider'
import { useRegisterActiveRound } from '../../../lib/useRegisterActiveRound'
import { SetupScreen } from './SetupScreen'
import { Scene } from './Scene'
import { generateScenePuzzle, getDifficultyConfig } from '../engine/generator'
import { computeScore, computeStars } from '../engine/scoring'
import type { Difficulty, ScenePuzzle, SceneDifference } from '../engine/types'

type Phase = 'setup' | 'playing' | 'result'

interface ResultState {
  score: number
  stars: 0 | 1 | 2 | 3
  timeMs: number
  isNewBest: boolean
}

function hotspotDistance(xNorm: number, yNorm: number, diff: SceneDifference): number {
  return Math.hypot(xNorm - diff.x, yNorm - diff.y)
}

export function SpotTheDifferencePage() {
  const navigate = useNavigate()
  const platform = usePlatform()

  const [difficulty, setDifficulty] = useState<Difficulty>('easy')
  const [level, setLevel] = useState(1)
  const [phase, setPhase] = useState<Phase>('setup')
  const [puzzle, setPuzzle] = useState<ScenePuzzle | null>(null)
  const [found, setFound] = useState<SceneDifference[]>([])
  const [wrongTaps, setWrongTaps] = useState(0)
  const [hintsUsed, setHintsUsed] = useState(0)
  const [hintHotspot, setHintHotspot] = useState<SceneDifference | null>(null)
  const [wrongMarker, setWrongMarker] = useState<{ x: number; y: number } | null>(null)
  const [result, setResult] = useState<ResultState | null>(null)

  useRegisterActiveRound(phase === 'playing', false)

  const startTimeRef = useRef(0)
  const wrongTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hintTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function handleStart(chosenLevel: number) {
    setLevel(chosenLevel)
    setPuzzle(generateScenePuzzle(difficulty, `local-${difficulty}-${chosenLevel}`))
    setFound([])
    setWrongTaps(0)
    setHintsUsed(0)
    setHintHotspot(null)
    setWrongMarker(null)
    setResult(null)
    startTimeRef.current = Date.now()
    setPhase('playing')
  }

  function finish(finalFound: SceneDifference[], finalWrongTaps: number, finalHints: number) {
    if (!puzzle) return
    const timeMs = Date.now() - startTimeRef.current
    const complete = finalFound.length === puzzle.differences.length
    const score = computeScore(finalFound.length, puzzle.differences.length, finalWrongTaps, finalHints)
    const stars = computeStars(complete, finalWrongTaps, finalHints)
    const isNewBest = recordLocalBest('spot-the-difference', 'classic', difficulty, score, timeMs)
    recordLocalLevelResult('spot-the-difference', 'classic', difficulty, level, stars)
    platform.haptics.notification(complete ? 'success' : 'warning')
    setResult({ score, stars, timeMs, isNewBest })
    setPhase('result')
  }

  function handleTap(xNorm: number, yNorm: number) {
    if (!puzzle || phase !== 'playing') return
    setHintHotspot(null)

    const foundIds = new Set(found.map((d) => d.objectId))
    const hit = puzzle.differences.find(
      (d) => !foundIds.has(d.objectId) && hotspotDistance(xNorm, yNorm, d) <= d.radius * 1.15,
    )

    if (hit) {
      const nextFound = [...found, hit]
      setFound(nextFound)
      platform.haptics.impact('light')
      if (nextFound.length === puzzle.differences.length) {
        finish(nextFound, wrongTaps, hintsUsed)
      }
      return
    }

    const nextWrong = wrongTaps + 1
    setWrongTaps(nextWrong)
    setWrongMarker({ x: xNorm, y: yNorm })
    platform.haptics.notification('error')
    if (wrongTimeoutRef.current) clearTimeout(wrongTimeoutRef.current)
    wrongTimeoutRef.current = setTimeout(() => setWrongMarker(null), 500)

    const limit = getDifficultyConfig(difficulty).wrongTapLimit
    if (nextWrong >= limit) finish(found, nextWrong, hintsUsed)
  }

  function handleHint() {
    if (!puzzle) return
    const foundIds = new Set(found.map((d) => d.objectId))
    const unfound = puzzle.differences.filter((d) => !foundIds.has(d.objectId))
    if (unfound.length === 0) return
    const pick = unfound[Math.floor(Math.random() * unfound.length)]
    setHintsUsed((h) => h + 1)
    setHintHotspot(pick)
    if (hintTimeoutRef.current) clearTimeout(hintTimeoutRef.current)
    hintTimeoutRef.current = setTimeout(() => setHintHotspot(null), 1600)
  }

  if (phase === 'setup') {
    return (
      <div className="flex flex-1 flex-col pb-10">
        <TopBar center={<span className="font-[var(--font-heading)] font-extrabold">Spot the Difference</span>} />
        <SetupScreen difficulty={difficulty} onDifficultyChange={setDifficulty} onStart={handleStart} />
      </div>
    )
  }

  if (!puzzle) return null

  const limit = getDifficultyConfig(difficulty).wrongTapLimit
  const wrongLeft = Math.max(0, limit - wrongTaps)

  return (
    <div className="flex flex-1 flex-col pb-10">
      <TopBar
        center={<span className="font-[var(--font-heading)] font-extrabold">Spot the Difference</span>}
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

      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col items-center px-4 pt-2">
        <Mascot mood="relaxed" size={44} />
        <SpeechBubble>
          <p className="text-xs font-bold text-[var(--color-text-primary)]">
            Found {found.length}/{puzzle.differences.length} · {wrongLeft} wrong taps left
          </p>
        </SpeechBubble>

        <div className="mt-3 flex w-full flex-col gap-3">
          <Scene objects={puzzle.sceneA} foundMarkers={found} hintHotspot={hintHotspot} wrongTapMarker={null} onTap={handleTap} label="Scene A" />
          <Scene objects={puzzle.sceneB} foundMarkers={found} hintHotspot={hintHotspot} wrongTapMarker={wrongMarker} onTap={handleTap} label="Scene B" />
        </div>

        <Button variant="surface" className="mt-4 w-full" onClick={handleHint}>
          Hint
        </Button>
      </div>

      {phase === 'result' && result && (
        <ResultSheet
          stars={result.stars}
          score={result.score}
          timeMs={result.timeMs}
          isNewBest={result.isNewBest}
          message={result.stars > 0 ? 'Great eye!' : 'Out of tries'}
          onReplay={() => handleStart(level)}
          onHome={() => navigate('/')}
        />
      )}
    </div>
  )
}
