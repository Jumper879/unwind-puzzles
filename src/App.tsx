import { useEffect, useState } from 'react'
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
import { ComingSoon } from './routes/ComingSoon'
import { Records } from './routes/Records'
import { Leaderboard } from './routes/Leaderboard'
import { Settings } from './routes/Settings'
import { HowToPlay } from './routes/HowToPlay'
import { About } from './routes/About'
import { IconsPreview } from './routes/dev/IconsPreview'

function SessionBootstrap() {
  useBootstrapSession()
  return null
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
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/games/:id" element={<GameRoute />} />
            <Route path="/daily" element={<ComingSoon title="Daily Unwind" phase={7} />} />
            <Route path="/records" element={<Records />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/achievements" element={<ComingSoon title="Achievements" phase={7} />} />
            <Route path="/stats" element={<ComingSoon title="Stats" phase={7} />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/how-to-play" element={<HowToPlay />} />
            <Route path="/about" element={<About />} />
            <Route path="/dev/icons" element={<IconsPreview />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <PwaUpdateToast />
        </BrowserRouter>
      )}
    </PlatformProvider>
  )
}
