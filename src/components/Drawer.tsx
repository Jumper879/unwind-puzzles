import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { NavLink } from 'react-router-dom'
import { useUiStore } from '../state/useUiStore'
import { GAMES } from '../games/registry'
import { BrandMark } from './BrandMark'

const NAV_LINK_CLASS =
  'block rounded-2xl px-4 py-2.5 text-white/85 transition-colors hover:bg-white/10 hover:text-white'
const NAV_LINK_ACTIVE = 'bg-white/10 text-white'

export function Drawer() {
  const open = useUiStore((s) => s.drawerOpen)
  const close = useUiStore((s) => s.closeDrawer)
  const reduceMotion = useReducedMotion()

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            aria-hidden
          />
          <motion.nav
            aria-label="Main menu"
            className="fixed inset-y-0 left-0 z-50 flex w-[82%] max-w-[320px] flex-col overflow-y-auto bg-[var(--color-chrome-bg)] px-4 pb-6 pt-[calc(env(safe-area-inset-top,0px)+20px)]"
            initial={{ x: reduceMotion ? 0 : '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: reduceMotion ? 0 : '-100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 34 }}
          >
            <div className="flex items-center justify-between">
              <BrandMark size={30} textClassName="text-white" />
              <button
                type="button"
                onClick={close}
                aria-label="Close menu"
                className="flex h-9 w-9 items-center justify-center rounded-full text-white/70 hover:bg-white/10 hover:text-white"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                  <path
                    d="M2 2l12 12M14 2 2 14"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            <div className="mt-6 flex flex-col gap-1">
              <DrawerLink to="/" label="Home" onNavigate={close} />
              {GAMES.map((g) => (
                <DrawerLink key={g.id} to={`/games/${g.id}`} label={g.name} onNavigate={close} />
              ))}
            </div>

            <div className="mt-6 h-px bg-white/10" />

            <div className="mt-6 flex flex-col gap-1">
              <DrawerLink to="/daily" label="Daily Unwind" onNavigate={close} />
              <DrawerLink to="/records" label="My Records" onNavigate={close} />
              <DrawerLink to="/leaderboard" label="Global Leaderboard" onNavigate={close} />
              <DrawerLink to="/achievements" label="Achievements" onNavigate={close} />
              <DrawerLink to="/stats" label="Stats" onNavigate={close} />
            </div>

            <div className="mt-6 h-px bg-white/10" />

            <div className="mt-6 flex flex-col gap-1">
              <DrawerLink to="/settings" label="Settings" onNavigate={close} />
              <DrawerLink to="/how-to-play" label="How to play" onNavigate={close} />
              <DrawerLink to="/about" label="About / Privacy" onNavigate={close} />
            </div>
          </motion.nav>
        </>
      )}
    </AnimatePresence>
  )
}

function DrawerLink({
  to,
  label,
  onNavigate,
}: {
  to: string
  label: string
  onNavigate: () => void
}) {
  return (
    <NavLink
      to={to}
      onClick={onNavigate}
      className={({ isActive }) => `${NAV_LINK_CLASS} ${isActive ? NAV_LINK_ACTIVE : ''}`}
    >
      {label}
    </NavLink>
  )
}
