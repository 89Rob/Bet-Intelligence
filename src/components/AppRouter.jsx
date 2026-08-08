import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import DashboardLayout from './layout/DashboardLayout'
import HomePage from './pages/HomePage'
import SettingsPage from './pages/SettingsPage'
import HelpPage from './pages/HelpPage'

function KeyboardShortcuts() {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const handleKeyDown = (event) => {
      const isModifierPressed = event.ctrlKey || event.metaKey
      const target = event.target
      const isTypingTarget =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)

      if (isModifierPressed && event.key.toLowerCase() === 'n') {
        event.preventDefault()
        const addBetInput = document.getElementById('add-bet-form')?.querySelector('input, select, textarea')
        if (addBetInput) {
          addBetInput.focus()
        }
      }

      if (isModifierPressed && event.key.toLowerCase() === 'f') {
        event.preventDefault()
        if (!isTypingTarget) {
          const searchField = document.getElementById('bet-search')
          searchField?.focus()
        }
      }

      if (event.key === 'Escape') {
        if (location.pathname === '/help') {
          navigate(-1)
          return
        }

        const overlay = document.querySelector('[data-mobile-overlay="true"]')
        if (overlay) {
          overlay.click()
        }
      }

      if (event.key === '?') {
        if (event.target instanceof HTMLElement && (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA' || event.target.isContentEditable)) {
          return
        }
        event.preventDefault()
        if (location.pathname === '/help') {
          navigate(-1)
          return
        }
        navigate('/help')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [location.pathname, navigate])

  return null
}

import BetsPage from './pages/BetsPage'
import AnalyticsPage from './pages/AnalyticsPage'

function AppRouter({ theme, toggleTheme }) {
  return (
    <BrowserRouter>
      <KeyboardShortcuts />
      <Routes>
        <Route element={<DashboardLayout theme={theme} toggleTheme={toggleTheme} />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/dashboard" element={<HomePage />} />
          <Route path="/bets" element={<BetsPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default AppRouter
