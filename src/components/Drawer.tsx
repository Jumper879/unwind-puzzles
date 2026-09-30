import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { NavLink, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useUiStore } from '../state/useUiStore'
import { GAMES } from '../games/registry'
import { BrandLogo } from './BrandLogo'
import { GameLineIcon } from './GameLineIcon'

const GAME_COLORS: Record<string, string> = {
  'tic-tac-toe': '#8EC5FF',
  crossword: '#FFE08A',
  'word-search': '#7FE0B0',
  mosaic: '#B9A6FF',
  'spot-the-difference': '#FFB38A',
  chess: '#C9CED8',
  'fruit-match': '#FF8FA8',
  sudoku: '#C6EF6B',
}

function HomeGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M3.5 9.5L10 4l6.5 5.5M5 8.5v7.5h4v-4h2v4h4V8.5"
        stroke="white"
        strokeWidth={1.9}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="mb-1.5 mt-5 px-4 text-[11px] font-extrabold uppercase tracking-wide text-white/40">
      {children}
    </p>
  )
}

export function Drawer() {
  const open = useUiStore((s) => s.drawerOpen)
  const close = useUiStore((s) => s.closeDrawer)
  const reduceMotion = useReducedMotion()
  const location = useLocation()

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
            className="fixed inset-y-0 left-0 z-50 flex w-[82%] max-w-[320px] flex-col bg-[var(--color-chrome-bg)]"
            initial={{ x: reduceMotion ? 0 : '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: reduceMotion ? 0 : '-100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 34 }}
          >
            <div
              className="flex shrink-0 items-center justify-between pl-5 pr-4"
              style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 24px)' }}
            >
              <BrandLogo variant="horizontal" tone="white" className="h-11" />
              <button
                type="button"
                onClick={close}
                aria-label="Close menu"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white/70 hover:bg-white/10 hover:text-white"
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

            <div className="mt-4 h-px bg-white/10" />

            <div className="flex-1 overflow-y-auto px-2 pb-4">
              <div className="flex flex-col gap-0.5">
                <DrawerItem
                  to="/"
                  label="Home"
                  active={location.pathname === '/'}
                  onNavigate={close}
                  tileColor="var(--blue-500)"
                  icon={<HomeGlyph />}
                />
              </div>

              <SectionLabel>Games</SectionLabel>
              <div className="flex flex-col gap-0.5">
                {GAMES.map((g) => (
                  <DrawerItem
                    key={g.id}
                    to={`/games/${g.id}`}
                    label={g.name}
                    active={location.pathname === `/games/${g.id}`}
                    onNavigate={close}
                    tileColor={GAME_COLORS[g.id] ?? '#8EC5FF'}
                    icon={<GameLineIcon gameId={g.id} size={18} />}
                  />
                ))}
              </div>

              <SectionLabel>More</SectionLabel>
              <div className="flex flex-col gap-0.5">
                <DrawerItem to="/leaderboard" label="Leaderboard" active={location.pathname === '/leaderboard'} onNavigate={close} />
                <DrawerItem to="/stats" label="Stats" active={location.pathname === '/stats'} onNavigate={close} />
                <DrawerItem to="/achievements" label="Achievements" active={location.pathname === '/achievements'} onNavigate={close} />
                <DrawerItem to="/settings" label="Settings" active={location.pathname === '/settings'} onNavigate={close} />
                <DrawerItem to="/daily" label="Daily Unwind" active={location.pathname === '/daily'} onNavigate={close} />
                <DrawerItem to="/records" label="My Records" active={location.pathname === '/records'} onNavigate={close} />
                <DrawerItem to="/how-to-play" label="How to play" active={location.pathname === '/how-to-play'} onNavigate={close} />
                <DrawerItem to="/about" label="About / Privacy" active={location.pathname === '/about'} onNavigate={close} />
              </div>
            </div>

            <div
              className="shrink-0 px-4 pb-4 pt-2 text-[11px] font-bold text-white/40"
              style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)' }}
            >
              unwind puzzles · v{__APP_VERSION__}
            </div>
          </motion.nav>
        </>
      )}
    </AnimatePresence>
  )
}

function DrawerItem({
  to,
  label,
  active,
  onNavigate,
  tileColor,
  icon,
}: {
  to: string
  label: string
  active: boolean
  onNavigate: () => void
  tileColor?: string
  icon?: ReactNode
}) {
  return (
    <NavLink
      to={to}
      onClick={onNavigate}
      className={`relative flex h-[52px] items-center gap-3 rounded-[14px] px-4 text-[17px] font-semibold transition-colors ${
        active ? 'bg-[var(--blue-500)]/[0.18] text-white' : 'text-white/90 hover:bg-white/5'
      }`}
    >
      {active && (
        <span
          className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-full"
          style={{ background: 'var(--blue-500)' }}
          aria-hidden
        />
      )}
      {icon && (
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px]"
          style={{ background: tileColor }}
          aria-hidden
        >
          {icon}
        </span>
      )}
      {label}
    </NavLink>
  )
}
