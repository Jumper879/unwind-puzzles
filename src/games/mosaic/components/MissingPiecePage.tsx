import { useCallback, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TopBar } from '../../../components/TopBar'
import { Button } from '../../../components/Button'
import { Mascot } from '../../../mascot/Mascot'
import { SpeechBubble } from '../../../components/SpeechBubble'
import { ResultSheet } from '../../../components/ResultSheet'
import { recordLocalBest, recordLocalLevelResult } from '../../../lib/localGameStore'
import { usePlatform } from '../../../platform/PlatformProvider'
import { SetupScreen } from './SetupScreen'
import { MosaicGrid } from './MosaicGrid'
import { ChoiceGrid } from './ChoiceGrid'
import { generateMosaicPuzzle, getDifficultyConfig } from '../engine/generator'
import { computeScore, computeStars } from '../engine/scoring'
import type { Difficulty, MosaicChoice, MosaicPuzzle } from '../engine/types'

type Phase = 'setup' | 'playing' | 'result'

interface ResultState {
  score: number
  stars: 0 | 1 | 2 | 3
  timeMs: number
  isNewBest: boolean
}

export function MissingPiecePage() {
  const navigate = useNavigate()
  const platform = usePlatform()

  const [difficulty, setDifficulty] = useState<Difficulty>('easy')
  const [level, setLevel] = useState(1)
  const [phase, setPhase] = useState<Phase>('setup')
  const [puzzle, setPuzzle] = useState<MosaicPuzzle | null>(null)
  const [wrongIds, setWrongIds] = useState<Set<string>>(new Set())
  const [solved, setSolved] = useState(false)
  const [hintUsed, setHintUsed] = useState(false)
  const [hintShapeType, setHintShapeType] = useState<string | null>(null)
  const [result, setResult] = useState<ResultState | null>(null)

  const startTimeRef = useRef(0)

  function handleStart(chosenLevel: number) {
    setLevel(chosenLevel)
    setPuzzle(generateMosaicPuzzle(difficulty, `local-${difficulty}-${chosenLevel}`))
    setWrongIds(new Set())
    setSolved(false)
    setHintUsed(false)
    setHintShapeType(null)
    setResult(null)
    startTimeRef.current = Date.now()
    setPhase('playing')
  }

  const finish = useCallback(
    (attemptsUsed: number, hintsUsed: number) => {
      const timeMs = Date.now() - startTimeRef.current
      const score = computeScore(true, attemptsUsed, hintsUsed)
      const stars = computeStars(true, attemptsUsed, hintsUsed)
      const isNewBest = recordLocalBest('mosaic', 'classic', difficulty, score, timeMs)
      recordLocalLevelResult('mosaic', 'classic', difficulty, level, stars)
      platform.haptics.notification('success')
      setResult({ score, stars, timeMs, isNewBest })
      setPhase('result')
    },
    [difficulty, level, platform],
  )

  function handleSelect(choice: MosaicChoice) {
    if (!puzzle || solved) return

    if (choice.correct) {
      setSolved(true)
      platform.haptics.impact('light')
      const attemptsUsed = wrongIds.size + 1
      window.setTimeout(() => finish(attemptsUsed, hintUsed ? 1 : 0), 700)
      return
    }

    const nextWrong = new Set(wrongIds)
    nextWrong.add(choice.id)
    setWrongIds(nextWrong)
    platform.haptics.notification('error')
  }

  function handleHint() {
    if (!puzzle || solved || hintUsed) return
    const correct = puzzle.choices.find((c) => c.correct)
    if (!correct) return
    setHintUsed(true)
    setHintShapeType(correct.pattern.shapeType)
  }

  if (phase === 'setup') {
    return (
      <div className="flex flex-1 flex-col pb-10">
        <TopBar center={<span className="font-[var(--font-heading)] font-extrabold">Missing Piece</span>} />
        <SetupScreen difficulty={difficulty} onDifficultyChange={setDifficulty} onStart={handleStart} />
      </div>
    )
  }

  if (!puzzle) return null

  const limit = getDifficultyConfig(difficulty).attemptLimit
  const attemptsLeft = Math.max(0, limit - wrongIds.size)
  const correctChoice = puzzle.choices.find((c) => c.correct) ?? null

  return (
    <div className="flex flex-1 flex-col pb-10">
      <TopBar
        center={<span className="font-[var(--font-heading)] font-extrabold">Missing Piece</span>}
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
        <Mascot mood={solved ? 'celebrating' : 'thinking'} size={44} />
        <SpeechBubble>
          <p className="text-xs font-bold text-[var(--color-text-primary)]">
            {solved
              ? 'Nicely spotted!'
              : hintShapeType
                ? `Hint: it's a ${hintShapeType} tile · ${attemptsLeft} tries left`
                : `Which tile completes the picture? · ${attemptsLeft} tries left`}
          </p>
        </SpeechBubble>

        <div className="mt-3 w-full">
          <MosaicGrid
            grid={puzzle.grid}
            missingRow={puzzle.missingRow}
            missingCol={puzzle.missingCol}
            revealed={solved ? correctChoice?.pattern ?? null : null}
          />
        </div>

        <div className="mt-4 w-full">
          <ChoiceGrid choices={puzzle.choices} wrongIds={wrongIds} solved={solved} onSelect={handleSelect} />
        </div>

        <Button
          variant="surface"
          className="mt-4 w-full"
          onClick={handleHint}
          disabled={hintUsed || solved}
        >
          {hintUsed ? 'Hint used' : 'Hint'}
        </Button>
      </div>

      {phase === 'result' && result && (
        <ResultSheet
          stars={result.stars}
          score={result.score}
          timeMs={result.timeMs}
          isNewBest={result.isNewBest}
          message={result.stars === 3 ? 'Perfect eye!' : 'Nicely spotted!'}
          onReplay={() => handleStart(level)}
          onHome={() => navigate('/')}
        />
      )}
    </div>
  )
}
