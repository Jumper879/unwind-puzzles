import { Suspense, useEffect, useState, lazy } from 'react'
import { AnimatePresence } from 'framer-motion'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { PlatformProvider } from './platform/PlatformProvider'
import { useBootstrapSession } from './platform/useBootstrapSession'
import { initSyncQueue } from './lib/syncQueue'
import { SplashScreen } from './routes/SplashScreen'
import { Drawer } from './components/Drawer'
import { PwaUpdateToast } from './components/PwaUpdateToast'
import { Home } from './routes/Home'
import { GameRoute } from './routes/GameRoute'

// Only the home screen and the game shell are needed for the very first
// paint — every other route is code-split so its JS (and, for
// Records/Leaderboard, the Supabase client it pulls in) doesn't add to the
// initial bundle a player never asked for. Lighthouse's Total Blocking Time
// audit caught the previous all-eager version costing 830ms on load.
const Records = lazy(() => import('./routes/Records').then((m) => ({ default: m.Records })))
const Leaderboard = lazy(() =>
  import('./routes/Leaderboard').then((m) => ({ default: m.Leaderboard })),
)
const DailyUnwind = lazy(() =>
  import('./routes/DailyUnwind').then((m) => ({ default: m.DailyUnwind })),
)
const Achievements = lazy(() =>
  import('./routes/Achievements').then((m) => ({ default: m.Achievements })),
)
const Stats = lazy(() => import('./routes/Stats').then((m) => ({ default: m.Stats })))
const Settings = lazy(() => import('./routes/Settings').then((m) => ({ default: m.Settings })))
const HowToPlay = lazy(() =>
  import('./routes/HowToPlay').then((m) => ({ default: m.HowToPlay })),
)
const About = lazy(() => import('./routes/About').then((m) => ({ default: m.About })))
const IconsPreview = lazy(() =>
  import('./routes/dev/IconsPreview').then((m) => ({ default: m.IconsPreview })),
)

function SessionBootstrap() {
  useBootstrapSession()
  return null
}

function RouteFallback() {
  return (
    <div className="flex flex-1 items-center justify-center text-[var(--color-text-secondary)]">
      Loading…
    </div>
  )
}

export default function App() {
  // /dev/* are developer-only tool pages (e.g. the icon comparison), not
  // part of the player-facing experience — skip the splash gate for them.
  const isDevRoute = window.location.pathname.startsWith('/dev/')
  const [showSplash, setShowSplash] = useState(!isDevRoute)

  useEffect(() => {
    initSyncQueue()
  }, [])

  return (
    <PlatformProvider>
      <SessionBootstrap />
      <AnimatePresence>
        {showSplash && <SplashScreen key="splash" onFinish={() => setShowSplash(false)} />}
      </AnimatePresence>

      {!showSplash && (
        <BrowserRouter>
          <Drawer />
          <main className="flex min-h-screen flex-1 flex-col">
            <Suspense fallback={<RouteFallback />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/games/:id" element={<GameRoute />} />
                <Route path="/daily" element={<DailyUnwind />} />
                <Route path="/records" element={<Records />} />
                <Route path="/leaderboard" element={<Leaderboard />} />
                <Route path="/achievements" element={<Achievements />} />
                <Route path="/stats" element={<Stats />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/how-to-play" element={<HowToPlay />} />
                <Route path="/about" element={<About />} />
                <Route path="/dev/icons" element={<IconsPreview />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </main>
          <PwaUpdateToast />
        </BrowserRouter>
      )}
    </PlatformProvider>
  )
}
