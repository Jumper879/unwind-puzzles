import { Link } from 'react-router-dom'
import { EmptyState } from '../components/EmptyState'
import { Button } from '../components/Button'

export function ComingSoon({
  title,
  phase,
  message,
}: {
  title: string
  phase?: number
  message?: string
}) {
  return (
    <EmptyState
      mood="thinking"
      title={title}
      message={
        message ?? (phase ? `Coming in Phase ${phase} of the build.` : 'This is coming soon.')
      }
      action={
        <Link to="/">
          <Button variant="primary">Back to Home</Button>
        </Link>
      }
    />
  )
}
