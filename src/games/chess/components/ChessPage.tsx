import { useState } from 'react'
import { TopBar } from '../../../components/TopBar'
import { Card } from '../../../components/Card'
import { Mascot } from '../../../mascot/Mascot'
import { SpeechBubble } from '../../../components/SpeechBubble'
import { FullGamePage } from './FullGamePage'
import { PuzzleSetup } from './PuzzleSetup'
import { CapturePuzzlePlayer } from './CapturePuzzlePlayer'
import { MatePuzzlePlayer } from './MatePuzzlePlayer'
import { getCapturePuzzle } from '../engine/capturePuzzles'
import { getMatePuzzle } from '../engine/matePuzzles'

type Mode = 'menu' | 'full-game' | 'puzzle-setup' | 'capture-puzzle' | 'mate-puzzle'

export function ChessPage() {
  const [mode, setMode] = useState<Mode>('menu')
  const [puzzleId, setPuzzleId] = useState<string | null>(null)

  if (mode === 'full-game') {
    return <FullGamePage />
  }

  if (mode === 'capture-puzzle' && puzzleId) {
    const puzzle = getCapturePuzzle(puzzleId)
    if (puzzle) {
      return (
        <div className="flex flex-1 flex-col pb-10">
          <TopBar
            center={<span className="font-[var(--font-heading)] font-extrabold">Chess Puzzle</span>}
          />
          <CapturePuzzlePlayer
            puzzle={puzzle}
            onHome={() => setMode('menu')}
            onNext={() => setMode('puzzle-setup')}
          />
        </div>
      )
    }
  }

  if (mode === 'mate-puzzle' && puzzleId) {
    const puzzle = getMatePuzzle(puzzleId)
    if (puzzle) {
      return (
        <div className="flex flex-1 flex-col pb-10">
          <TopBar
            center={<span className="font-[var(--font-heading)] font-extrabold">Chess Puzzle</span>}
          />
          <MatePuzzlePlayer
            puzzle={puzzle}
            onHome={() => setMode('menu')}
            onNext={() => setMode('puzzle-setup')}
          />
        </div>
      )
    }
  }

  if (mode === 'puzzle-setup') {
    return (
      <div className="flex flex-1 flex-col pb-10">
        <TopBar
          center={<span className="font-[var(--font-heading)] font-extrabold">Chess Puzzles</span>}
        />
        <PuzzleSetup
          onSelectCapture={(id) => {
            setPuzzleId(id)
            setMode('capture-puzzle')
          }}
          onSelectMate={(id) => {
            setPuzzleId(id)
            setMode('mate-puzzle')
          }}
        />
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col pb-10">
      <TopBar center={<span className="font-[var(--font-heading)] font-extrabold">Chess</span>} />
      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col items-center px-6 pt-6 text-center">
        <Mascot mood="relaxed" size={90} />
        <SpeechBubble>
          <p className="font-[var(--font-heading)] font-extrabold text-[var(--color-text-primary)]">
            Full game or a quick puzzle?
          </p>
        </SpeechBubble>

        <div className="mt-8 flex w-full flex-col gap-3">
          <button type="button" onClick={() => setMode('full-game')} className="text-left">
            <Card className="p-4">
              <p className="font-[var(--font-heading)] font-bold text-[var(--color-text-primary)]">
                Full Game
              </p>
              <p className="text-xs text-[var(--color-text-secondary)]">
                Play a complete game vs the AI
              </p>
            </Card>
          </button>
          <button type="button" onClick={() => setMode('puzzle-setup')} className="text-left">
            <Card className="p-4">
              <p className="font-[var(--font-heading)] font-bold text-[var(--color-text-primary)]">
                Puzzles
              </p>
              <p className="text-xs text-[var(--color-text-secondary)]">
                Capture pieces or find checkmate in 1
              </p>
            </Card>
          </button>
        </div>
      </div>
    </div>
  )
}
