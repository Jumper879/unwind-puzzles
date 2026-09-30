import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TopBar } from '../../../components/TopBar'
import { Button } from '../../../components/Button'
import { Mascot } from '../../../mascot/Mascot'
import { SpeechBubble } from '../../../components/SpeechBubble'
import { ResultSheet } from '../../../components/ResultSheet'
import { recordLocalBest, recordLocalLevelResult } from '../../../lib/localGameStore'
import { usePlatform } from '../../../platform/PlatformProvider'
import { useRegisterActiveRound } from '../../../lib/useRegisterActiveRound'
import { useKeyboardOpenStore } from '../../../state/useKeyboardOpenStore'
import { SetupScreen } from './SetupScreen'
import { CrosswordGrid } from './CrosswordGrid'
import { Keyboard } from './Keyboard'
import { generateCrossword } from '../engine/generator'
import { slotsAtCell } from '../engine/slots'
import { computeScore, computeStars } from '../engine/scoring'
import type { CrosswordPuzzle } from '../engine/types'

type Phase = 'setup' | 'playing' | 'result'
type Direction = 'across' | 'down'

interface ResultState {
  score: number
  stars: 0 | 1 | 2 | 3
  timeMs: number
  isNewBest: boolean
}

export function CrosswordPage() {
  const navigate = useNavigate()
  const platform = usePlatform()

  const [level, setLevel] = useState(1)
  const [phase, setPhase] = useState<Phase>('setup')
  const [puzzle, setPuzzle] = useState<CrosswordPuzzle | null>(null)
  const [userGrid, setUserGrid] = useState<(string | null)[]>([])
  const [selectedCell, setSelectedCell] = useState<number | null>(null)
  const [direction, setDirection] = useState<Direction>('across')
  const [revealsUsed, setRevealsUsed] = useState(0)
  const [incorrectCells, setIncorrectCells] = useState<Set<number>>(new Set())
  const [result, setResult] = useState<ResultState | null>(null)

  const startTimeRef = useRef(0)
  const incorrectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useRegisterActiveRound(phase === 'playing', false)

  // The custom on-screen keyboard (not a real <input>) is visible any time
  // we're past setup — BottomNav can't detect this on its own the way it
  // detects a native input focusing, so it's signalled explicitly.
  const setCustomKeyboardOpen = useKeyboardOpenStore((s) => s.setCustomKeyboardOpen)
  useEffect(() => {
    setCustomKeyboardOpen(phase !== 'setup')
    return () => setCustomKeyboardOpen(false)
  }, [phase, setCustomKeyboardOpen])

  function handleStart(chosenLevel: number) {
    const nextPuzzle = generateCrossword('mini-5', 'easy', `local-${chosenLevel}`)
    setLevel(chosenLevel)
    setPuzzle(nextPuzzle)
    setUserGrid(nextPuzzle.solution.map((c) => (c === null ? null : '')))
    const firstFillable = nextPuzzle.solution.findIndex((c) => c !== null)
    setSelectedCell(firstFillable)
    setDirection(slotsAtCell(nextPuzzle.slots, firstFillable).across ? 'across' : 'down')
    setRevealsUsed(0)
    setIncorrectCells(new Set())
    setResult(null)
    startTimeRef.current = Date.now()
    setPhase('playing')
  }

  function currentSlot(puzzleArg: CrosswordPuzzle, cell: number, dir: Direction) {
    return slotsAtCell(puzzleArg.slots, cell)[dir]
  }

  function finish(finalGrid: (string | null)[], currentReveals: number) {
    if (!puzzle) return
    const totalCells = puzzle.solution.filter((c) => c !== null).length
    const correctCells = puzzle.solution.filter((c, i) => c !== null && finalGrid[i] === c).length
    const complete = correctCells === totalCells
    const timeMs = Date.now() - startTimeRef.current
    const score = computeScore(correctCells, totalCells, currentReveals)
    const stars = computeStars(complete, currentReveals)
    const isNewBest = recordLocalBest('crossword', 'classic', 'easy', score, timeMs)
    recordLocalLevelResult('crossword', 'classic', 'easy', level, stars)
    platform.haptics.notification(complete ? 'success' : 'warning')
    setResult({ score, stars, timeMs, isNewBest })
    setPhase('result')
  }

  function handleCellClick(index: number) {
    if (!puzzle || puzzle.solution[index] === null) return
    const { across, down } = slotsAtCell(puzzle.slots, index)
    if (selectedCell === index) {
      if (across && down) setDirection((d) => (d === 'across' ? 'down' : 'across'))
    } else {
      setSelectedCell(index)
      setDirection(across ? 'across' : 'down')
    }
  }

  function handleLetter(letter: string) {
    if (!puzzle || selectedCell === null) return
    const nextGrid = [...userGrid]
    nextGrid[selectedCell] = letter
    setUserGrid(nextGrid)
    setIncorrectCells(new Set())

    const slot = currentSlot(puzzle, selectedCell, direction)
    if (slot) {
      const posInSlot = slot.cells.indexOf(selectedCell)
      if (posInSlot < slot.cells.length - 1) setSelectedCell(slot.cells[posInSlot + 1])
    }

    if (nextGrid.every((v, i) => puzzle.solution[i] === null || v === puzzle.solution[i])) {
      finish(nextGrid, revealsUsed)
    }
  }

  function handleBackspace() {
    if (!puzzle || selectedCell === null) return
    const nextGrid = [...userGrid]
    if (nextGrid[selectedCell]) {
      nextGrid[selectedCell] = ''
      setUserGrid(nextGrid)
      return
    }
    const slot = currentSlot(puzzle, selectedCell, direction)
    if (slot) {
      const posInSlot = slot.cells.indexOf(selectedCell)
      if (posInSlot > 0) {
        const prevCell = slot.cells[posInSlot - 1]
        nextGrid[prevCell] = ''
        setUserGrid(nextGrid)
        setSelectedCell(prevCell)
      }
    }
  }

  function handleCheck() {
    if (!puzzle) return
    const wrong = new Set<number>()
    userGrid.forEach((v, i) => {
      if (v && puzzle.solution[i] !== null && v !== puzzle.solution[i]) wrong.add(i)
    })
    setIncorrectCells(wrong)
    if (incorrectTimeoutRef.current) clearTimeout(incorrectTimeoutRef.current)
    incorrectTimeoutRef.current = setTimeout(() => setIncorrectCells(new Set()), 1500)
  }

  function handleReveal() {
    if (!puzzle) return
    const targetIndex = puzzle.solution.findIndex((c, i) => c !== null && userGrid[i] !== c)
    if (targetIndex === -1) return
    const nextGrid = [...userGrid]
    nextGrid[targetIndex] = puzzle.solution[targetIndex]
    const nextReveals = revealsUsed + 1
    setRevealsUsed(nextReveals)
    setUserGrid(nextGrid)
    setSelectedCell(targetIndex)

    if (nextGrid.every((v, i) => puzzle.solution[i] === null || v === puzzle.solution[i])) {
      finish(nextGrid, nextReveals)
    }
  }

  if (phase === 'setup') {
    return (
      <div className="flex flex-1 flex-col pb-10">
        <TopBar
          center={<span className="font-[var(--font-heading)] font-extrabold">Crossword</span>}
        />
        <SetupScreen onStart={handleStart} />
      </div>
    )
  }

  if (!puzzle) return null

  const activeSlot =
    selectedCell !== null ? currentSlot(puzzle, selectedCell, direction) : undefined
  const activeCells = new Set(activeSlot?.cells ?? [])

  return (
    <div className="flex flex-1 flex-col pb-6">
      <TopBar
        center={
          <span className="font-[var(--font-heading)] font-extrabold">Crossword · Lv {level}</span>
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

      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col items-center px-4 pt-2">
        <Mascot mood="relaxed" size={44} />
        <SpeechBubble>
          <p className="text-xs font-bold text-[var(--color-text-primary)]">
            {activeSlot
              ? `${activeSlot.number} ${direction}: ${activeSlot.clue}`
              : 'Tap a cell to begin'}
          </p>
        </SpeechBubble>

        <div className="mt-3 w-full">
          <CrosswordGrid
            puzzle={puzzle}
            userGrid={userGrid}
            selectedCell={selectedCell}
            activeCells={activeCells}
            incorrectCells={incorrectCells}
            onCellClick={handleCellClick}
          />
        </div>

        <div className="mt-3 flex w-full gap-2">
          <Button variant="surface" className="flex-1 px-2 py-2 text-sm" onClick={handleCheck}>
            Check
          </Button>
          <Button variant="surface" className="flex-1 px-2 py-2 text-sm" onClick={handleReveal}>
            Reveal
          </Button>
        </div>

        <div className="mt-3 w-full">
          <Keyboard onLetter={handleLetter} onBackspace={handleBackspace} />
        </div>
      </div>

      {phase === 'result' && result && (
        <ResultSheet
          stars={result.stars}
          score={result.score}
          timeMs={result.timeMs}
          isNewBest={result.isNewBest}
          message={result.stars > 0 ? 'Puzzle complete!' : 'Nice try!'}
          onReplay={() => handleStart(level)}
          onHome={() => navigate('/')}
        />
      )}
    </div>
  )
}
