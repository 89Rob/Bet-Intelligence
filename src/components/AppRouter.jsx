import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import DashboardLayout from './layout/DashboardLayout'
import HomePage from './pages/HomePage'
import SettingsPage from './pages/SettingsPage'

function AppRouter({ theme, toggleTheme }) {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<DashboardLayout theme={theme} toggleTheme={toggleTheme} />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/dashboard" element={<HomePage />} />
          <Route path="/bets" element={<HomePage />} />
          <Route path="/analytics" element={<HomePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default AppRouter
