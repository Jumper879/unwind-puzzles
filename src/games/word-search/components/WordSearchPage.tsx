import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TopBar } from '../../../components/TopBar'
import { Button } from '../../../components/Button'
import { Mascot } from '../../../mascot/Mascot'
import { SpeechBubble } from '../../../components/SpeechBubble'
import { ResultSheet } from '../../../components/ResultSheet'
import { recordLocalBest, recordLocalLevelResult } from '../../../lib/localGameStore'
import { usePlatform } from '../../../platform/PlatformProvider'
import { SetupScreen } from './SetupScreen'
import { WordSearchGrid } from './WordSearchGrid'
import { WordList } from './WordList'
import { generateWordSearch } from '../engine/generator'
import { computeScore, computeStars } from '../engine/scoring'
import type { Difficulty } from '../engine/types'

type Phase = 'setup' | 'playing' | 'result'

interface ResultState {
  score: number
  stars: 0 | 1 | 2 | 3
  timeMs: number
  isNewBest: boolean
}

export function WordSearchPage() {
  const navigate = useNavigate()
  const platform = usePlatform()

  const [theme, setTheme] = useState('Animals')
  const [difficulty, setDifficulty] = useState<Difficulty>('easy')
  const [level, setLevel] = useState(1)
  const [phase, setPhase] = useState<Phase>('setup')
  const [foundWords, setFoundWords] = useState<Set<string>>(new Set())
  const [hintsUsed, setHintsUsed] = useState(0)
  const [hintCells, setHintCells] = useState<number[] | null>(null)
  const [result, setResult] = useState<ResultState | null>(null)

  const startTimeRef = useRef(0)
  const hintTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(
    () => () => {
      if (hintTimeoutRef.current) clearTimeout(hintTimeoutRef.current)
    },
    [],
  )

  const puzzle = useMemo(
    () =>
      phase === 'playing' || phase === 'result'
        ? generateWordSearch(theme, difficulty, `level-${level}`)
        : null,
    [phase, theme, difficulty, level],
  )

  function handleStart(chosenLevel: number) {
    setLevel(chosenLevel)
    setFoundWords(new Set())
    setHintsUsed(0)
    setResult(null)
    startTimeRef.current = Date.now()
    setPhase('playing')
  }

  function finish(finalFound: Set<string>) {
    if (!puzzle) return
    const timeMs = Date.now() - startTimeRef.current
    const score = computeScore(finalFound.size, puzzle.placements.length, hintsUsed)
    const stars = computeStars(finalFound.size, puzzle.placements.length, hintsUsed)
    const isNewBest = recordLocalBest('word-search', theme, difficulty, score, timeMs)
    recordLocalLevelResult('word-search', theme, difficulty, level, stars)
    platform.haptics.notification(stars > 0 ? 'success' : 'warning')
    setResult({ score, stars, timeMs, isNewBest })
    setPhase('result')
  }

  function handleWordFound(word: { word: string }) {
    setFoundWords((prev) => {
      const next = new Set(prev)
      next.add(word.word)
      if (puzzle && next.size === puzzle.placements.length) {
        // Defer so this render commits (found-word highlight) before the result sheet appears.
        setTimeout(() => finish(next), 300)
      }
      return next
    })
    platform.haptics.impact('light')
  }

  function handleHint() {
    if (!puzzle) return
    const unfound = puzzle.placements.filter((p) => !foundWords.has(p.word))
    if (unfound.length === 0) return
    const pick = unfound[Math.floor(Math.random() * unfound.length)]
    setHintsUsed((h) => h + 1)
    setHintCells(pick.cells)
    if (hintTimeoutRef.current) clearTimeout(hintTimeoutRef.current)
    hintTimeoutRef.current = setTimeout(() => setHintCells(null), 1600)
  }

  if (phase === 'setup') {
    return (
      <div className="flex flex-1 flex-col pb-10">
        <TopBar
          center={<span className="font-[var(--font-heading)] font-extrabold">Word Search</span>}
        />
        <SetupScreen
          theme={theme}
          difficulty={difficulty}
          onThemeChange={setTheme}
          onDifficultyChange={setDifficulty}
          onStart={handleStart}
        />
      </div>
    )
  }

  if (!puzzle) return null

  const foundPlacements = puzzle.placements.filter((p) => foundWords.has(p.word))
  const allWords = puzzle.placements.map((p) => p.word)

  return (
    <div className="flex flex-1 flex-col pb-10">
      <TopBar
        center={
          <span className="font-[var(--font-heading)] font-extrabold">
            {theme} · Level {level}
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

      <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center px-4 pt-3">
        <Mascot mood="relaxed" size={56} />
        <SpeechBubble>
          <p className="text-sm font-bold text-[var(--color-text-primary)]">
            Found {foundWords.size}/{allWords.length}
          </p>
        </SpeechBubble>

        <div className="mt-4 w-full">
          <WordSearchGrid
            grid={puzzle.grid}
            size={puzzle.size}
            allPlacements={puzzle.placements}
            foundPlacements={foundPlacements}
            hintCells={hintCells}
            onWordFound={handleWordFound}
            onDragStart={() => platform.gestures.disableVerticalSwipes()}
            onDragEnd={() => platform.gestures.enableVerticalSwipes()}
          />
        </div>

        <div className="mt-4 w-full">
          <WordList words={allWords} found={foundWords} />
        </div>

        <div className="mt-4 flex w-full gap-3">
          <Button
            variant="surface"
            className="flex-1"
            onClick={handleHint}
            disabled={foundWords.size === allWords.length}
          >
            Hint
          </Button>
          <Button variant="surface" className="flex-1" onClick={() => finish(foundWords)}>
            Finish
          </Button>
        </div>
      </div>

      {phase === 'result' && result && (
        <ResultSheet
          stars={result.stars}
          score={result.score}
          timeMs={result.timeMs}
          isNewBest={result.isNewBest}
          message={foundWords.size === allWords.length ? 'All words found!' : 'Nice try!'}
          onReplay={() => handleStart(level)}
          onHome={() => navigate('/')}
        />
      )}
    </div>
  )
}
