import { Suspense, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { getGame } from '../games/registry'
import { GAME_COMPONENTS } from '../games/gameComponents'
import { ComingSoon } from './ComingSoon'
import { TutorialOverlay } from '../components/TutorialOverlay'
import { TUTORIALS } from '../content/tutorials'
import { hasSeenTutorial, markTutorialSeen } from '../lib/tutorialSeen'

export function GameRoute() {
  const { id } = useParams<{ id: string }>()
  const game = id ? getGame(id) : undefined
  // Re-checked per gameId (not just once) so navigating tic-tac-toe -> chess
  // shows chess's tutorial even though tic-tac-toe's was already dismissed.
  const [dismissedFor, setDismissedFor] = useState<string | null>(null)

  if (!game) return <Navigate to="/" replace />

  const GameComponent = id ? GAME_COMPONENTS[id] : undefined
  if (!GameComponent) {
    return <ComingSoon title={game.name} phase={game.phase} message={game.tagline} />
  }

  const tutorial = TUTORIALS[game.id]
  const showTutorial = tutorial && dismissedFor !== game.id && !hasSeenTutorial(game.id)

  return (
    <>
      <Suspense
        fallback={
          <div className="flex flex-1 items-center justify-center text-[var(--color-text-secondary)]">
            Loading…
          </div>
        }
      >
        <GameComponent />
      </Suspense>
      {showTutorial && (
        <TutorialOverlay
          gameName={game.name}
          tutorial={tutorial}
          onDismiss={() => {
            markTutorialSeen(game.id)
            setDismissedFor(game.id)
          }}
        />
      )}
    </>
  )
}
