import { useRegisterSW } from 'virtual:pwa-register/react'
import { Button } from './Button'

/** "A new version is available" banner, per PLAN.md's PWA update-prompt requirement. */
export function PwaUpdateToast() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW()

  if (!needRefresh) return null

  return (
    <div className="fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom,0px)+16px)] z-[90] mx-auto flex w-[92%] max-w-sm items-center justify-between gap-3 rounded-2xl border border-[var(--color-surface-outline)] bg-[var(--color-surface)] px-4 py-3 shadow-[0_10px_24px_var(--color-shadow)]">
      <p className="text-sm font-semibold text-[var(--color-text-primary)]">
        A new version is ready
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setNeedRefresh(false)}
          className="rounded-xl px-2 py-1 text-sm text-[var(--color-text-secondary)]"
        >
          Later
        </button>
        <Button
          variant="primary"
          className="px-3 py-1.5 text-sm"
          onClick={() => updateServiceWorker(true)}
        >
          Update
        </Button>
      </div>
    </div>
  )
}
