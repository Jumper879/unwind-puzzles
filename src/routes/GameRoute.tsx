import { Navigate, useParams } from 'react-router-dom'
import { getGame } from '../games/registry'
import { ComingSoon } from './ComingSoon'

export function GameRoute() {
  const { id } = useParams<{ id: string }>()
  const game = id ? getGame(id) : undefined

  if (!game) return <Navigate to="/" replace />

  return <ComingSoon title={game.name} phase={game.phase} message={game.tagline} />
}
