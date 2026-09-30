import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TopBar } from '../../../components/TopBar'
import { Button } from '../../../components/Button'
import { Mascot } from '../../../mascot/Mascot'
import { SpeechBubble } from '../../../components/SpeechBubble'
import { ResultSheet } from '../../../components/ResultSheet'
import { recordLocalBest } from '../../../lib/localGameStore'
import { usePlatform } from '../../../platform/PlatformProvider'
import { useRegisterActiveRound } from '../../../lib/useRegisterActiveRound'
import { SetupScreen } from './SetupScreen'
import { Board } from './Board'
import { NumberHand } from './NumberHand'
import { generateSudoku } from '../engine/generator'
import { findConflicts, peers } from '../engine/board'
import { computeScore, computeStars } from '../engine/scoring'
import type { Difficulty, Grid, SudokuPuzzle, SudokuSize } from '../engine/types'

type Phase = 'setup' | 'playing' | 'result'

interface PlayState {
  userGrid: Grid
  notes: Set<number>[]
}

interface ResultState {
  score: number
  stars: 0 | 1 | 2 | 3
  timeMs: number
  isNewBest: boolean
}

export function SudokuPage() {
  const navigate = useNavigate()
  const platform = usePlatform()

  const [size, setSize] = useState<SudokuSize>(9)
  const [difficulty, setDifficulty] = useState<Difficulty>('easy')
  const [seedCounter, setSeedCounter] = useState(0)
  const [phase, setPhase] = useState<Phase>('setup')
  const [puzzle, setPuzzle] = useState<SudokuPuzzle | null>(null)
  const [play, setPlay] = useState<PlayState | null>(null)
  const [selectedDigit, setSelectedDigit] = useState<number | null>(null)
  const [notesMode, setNotesMode] = useState(false)
  const [mistakes, setMistakes] = useState(0)
  const [hintsUsed, setHintsUsed] = useState(0)
  const [result, setResult] = useState<ResultState | null>(null)

  useRegisterActiveRound(phase === 'playing', false)

  const startTimeRef = useRef(0)

  // Puzzle generation and play-state init happen together, right here, so
  // there's no separate "sync play state to a puzzle that just changed"
  // step that could get out of sync (e.g. replaying the same size would
  // never re-trigger a reset keyed on grid length alone).
  function handleStart() {
    const nextSeed = seedCounter + 1
    const nextPuzzle = generateSudoku(size, difficulty, `local-${size}-${difficulty}-${nextSeed}`)
    setSeedCounter(nextSeed)
    setPuzzle(nextPuzzle)
    setPlay({
      userGrid: [...nextPuzzle.puzzle],
      notes: nextPuzzle.puzzle.map(() => new Set<number>()),
    })
    setSelectedDigit(null)
    setNotesMode(false)
    setMistakes(0)
    setHintsUsed(0)
    setResult(null)
    startTimeRef.current = Date.now()
    setPhase('playing')
  }

  // Takes the current mistakes/hints explicitly rather than reading the
  // closed-over state — this can fire from the same handler that just
  // called setHintsUsed/setMistakes, whose new value isn't visible on the
  // state variable itself until the next render (same issue as
  // TicTacToePage's finishMatch).
  function finish(currentMistakes: number, currentHintsUsed: number) {
    if (!puzzle) return
    const timeMs = Date.now() - startTimeRef.current
    const score = computeScore(currentMistakes, currentHintsUsed)
    const stars = computeStars(currentMistakes, currentHintsUsed)
    const isNewBest = recordLocalBest('sudoku', String(size), difficulty, score, timeMs)
    platform.haptics.notification('success')
    setResult({ score, stars, timeMs, isNewBest })
    setPhase('result')
  }

  function handleCellClick(index: number) {
    if (!puzzle || !play || selectedDigit === null) return
    if (puzzle.puzzle[index] !== 0) return // given clue, locked

    const row = Math.floor(index / size)
    const col = index % size

    if (notesMode) {
      if (play.userGrid[index] !== 0) return
      const nextNotes = play.notes.map((s) => new Set(s))
      if (nextNotes[index].has(selectedDigit)) nextNotes[index].delete(selectedDigit)
      else nextNotes[index].add(selectedDigit)
      setPlay({ ...play, notes: nextNotes })
      return
    }

    const nextGrid = [...play.userGrid]
    const nextNotes = play.notes.map((s) => new Set(s))

    if (nextGrid[index] === selectedDigit) {
      nextGrid[index] = 0
    } else {
      nextGrid[index] = selectedDigit
      nextNotes[index] = new Set()
      for (const [r, c] of peers(row, col, size)) {
        nextNotes[r * size + c].delete(selectedDigit)
      }
      if (selectedDigit !== puzzle.solution[index]) {
        setMistakes((m) => m + 1)
        platform.haptics.notification('error')
      } else {
        platform.haptics.impact('light')
      }
    }

    setPlay({ userGrid: nextGrid, notes: nextNotes })

    if (nextGrid.every((v, i) => v === puzzle.solution[i])) {
      finish(mistakes, hintsUsed)
    }
  }

  function handleHint() {
    if (!puzzle || !play) return
    const emptyIndices = play.userGrid.reduce<number[]>((acc, v, i) => {
      if (v === 0) acc.push(i)
      return acc
    }, [])
    if (emptyIndices.length === 0) return
    const target = emptyIndices[Math.floor(Math.random() * emptyIndices.length)]
    const row = Math.floor(target / size)
    const col = target % size

    const nextGrid = [...play.userGrid]
    nextGrid[target] = puzzle.solution[target]
    const nextNotes = play.notes.map((s) => new Set(s))
    nextNotes[target] = new Set()
    for (const [r, c] of peers(row, col, size)) {
      nextNotes[r * size + c].delete(puzzle.solution[target])
    }

    const nextHintsUsed = hintsUsed + 1
    setHintsUsed(nextHintsUsed)
    setPlay({ userGrid: nextGrid, notes: nextNotes })

    if (nextGrid.every((v, i) => v === puzzle.solution[i])) {
      finish(mistakes, nextHintsUsed)
    }
  }

  if (phase === 'setup') {
    return (
      <div className="flex flex-1 flex-col pb-10">
        <TopBar
          center={<span className="font-[var(--font-heading)] font-extrabold">Sudoku Cards</span>}
        />
        <SetupScreen
          size={size}
          difficulty={difficulty}
          onSizeChange={setSize}
          onDifficultyChange={setDifficulty}
          onStart={handleStart}
        />
      </div>
    )
  }

  if (!puzzle || !play) return null

  const conflicts = findConflicts(play.userGrid, size)
  const remainingCounts = Array.from({ length: size }, (_, i) => {
    const digit = i + 1
    const needed = puzzle.solution.filter((v) => v === digit).length
    const placed = play.userGrid.filter((v) => v === digit).length
    return Math.max(0, needed - placed)
  })

  return (
    <div className="flex flex-1 flex-col pb-10">
      <TopBar
        center={<span className="font-[var(--font-heading)] font-extrabold">Sudoku Cards</span>}
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
            Mistakes: {mistakes} · Hints: {hintsUsed}
          </p>
        </SpeechBubble>

        <div className="mt-4 w-full">
          <Board
            size={size}
            userGrid={play.userGrid}
            notes={play.notes}
            givenMask={puzzle.puzzle.map((v) => v !== 0)}
            conflicts={conflicts}
            selectedDigit={selectedDigit}
            onCellClick={handleCellClick}
          />
        </div>

        <div className="mt-4 w-full">
          <NumberHand
            size={size}
            remainingCounts={remainingCounts}
            selectedDigit={selectedDigit}
            onSelect={setSelectedDigit}
          />
        </div>

        <div className="mt-4 flex w-full gap-3">
          <Button
            variant={notesMode ? 'primary' : 'surface'}
            className="flex-1"
            onClick={() => setNotesMode((m) => !m)}
          >
            Notes {notesMode ? 'on' : 'off'}
          </Button>
          <Button variant="surface" className="flex-1" onClick={handleHint}>
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
          message="Solved!"
          onReplay={handleStart}
          onHome={() => navigate('/')}
        />
      )}
    </div>
  )
}
