import { Routes, Route, useLocation } from 'react-router-dom'
import { NavProvider } from './contexts/NavContext'
import ErrorBoundary from './components/ErrorBoundary'
import NavBar from './components/NavBar'
import ConnectionBanner from './components/ConnectionBanner'
import Home from './pages/Home'
import Onboarding from './pages/Onboarding'
import Dashboard from './pages/Dashboard'
import Interview from './pages/Interview'
import ProjectDetail from './pages/ProjectDetail'
import TaskDetail from './pages/TaskDetail'
import Settings from './pages/Settings'

const NAV_HIDDEN_ROUTES = ['/onboarding', '/']

function AppLayout({ children }) {
  const { pathname } = useLocation()
  const hideNav = NAV_HIDDEN_ROUTES.some(
    (r) => pathname === r || pathname.includes('/interview')
  )

  return (
    <>
      {!hideNav && <NavBar />}
      <ConnectionBanner />
      {children}
    </>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <NavProvider>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/project/:id/interview" element={<Interview />} />
            <Route path="/project/:id/task/:taskId" element={<TaskDetail />} />
            <Route path="/project/:id" element={<ProjectDetail />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </AppLayout>
      </NavProvider>
    </ErrorBoundary>
  )
}
