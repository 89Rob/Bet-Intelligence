import { useLocation, useNavigate } from 'react-router-dom'
import Button from '../ui/Button'

function TopBar({ theme, toggleTheme, onToggleMenu }) {
  const location = useLocation()
  const navigate = useNavigate()

  const titleMap = {
    '/': 'Dashboard',
    '/dashboard': 'Dashboard',
    '/bets': 'Bets',
    '/analytics': 'Analytics',
    '/settings': 'Settings',
    '/help': 'Help',
  }

  const currentTitle = titleMap[location.pathname] || 'Dashboard'

  return (
    <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-[var(--header-bg)]/90 backdrop-blur-sm">
      <div className="flex items-center justify-between gap-4 px-4 py-4 md:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleMenu}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--panel)] text-lg text-[var(--text)] transition hover:bg-[var(--panel-muted)] md:hidden"
            aria-label="Toggle navigation"
          >
            ☰
          </button>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
              Overview
            </p>
            <h1 className="text-lg font-semibold text-[var(--text)]">{currentTitle}</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2 text-sm font-medium text-[var(--text)] transition hover:bg-[var(--panel-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <span aria-hidden="true">{theme === 'light' ? '🌙' : '☀️'}</span>
            {theme === 'light' ? 'Dark mode' : 'Light mode'}
          </button>
          <Button type="button" size="sm" variant="secondary" onClick={() => navigate('/help')}>
            Help
          </Button>
        </div>
      </div>
    </header>
  )
}

export default TopBar
