import { Suspense } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { getGame } from '../games/registry'
import { GAME_COMPONENTS } from '../games/gameComponents'
import { ComingSoon } from './ComingSoon'

export function GameRoute() {
  const { id } = useParams<{ id: string }>()
  const game = id ? getGame(id) : undefined

  if (!game) return <Navigate to="/" replace />

  const GameComponent = id ? GAME_COMPONENTS[id] : undefined
  if (!GameComponent) {
    return <ComingSoon title={game.name} phase={game.phase} message={game.tagline} />
  }

  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center text-[var(--color-text-secondary)]">
          Loading…
        </div>
      }
    >
      <GameComponent />
    </Suspense>
  )
}
