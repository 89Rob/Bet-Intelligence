import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopBar from './TopBar'

function DashboardLayout({ theme, toggleTheme }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div data-theme={theme} className="min-h-screen bg-[var(--page-bg)] text-[var(--text)] transition-colors duration-300">
      <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col md:flex-row">
        <Sidebar mobileOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} theme={theme} />

        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar
            theme={theme}
            toggleTheme={toggleTheme}
            onToggleMenu={() => setMobileMenuOpen((value) => !value)}
          />
          <main className="flex-1 p-4 md:p-6 xl:p-8">
            <div className="mx-auto w-full max-w-[1400px] fade-in">
              <Outlet />
            </div>
          </main>
        </div>
      </div>

      {mobileMenuOpen ? (
        <button
          type="button"
          aria-label="Close navigation"
          data-mobile-overlay="true"
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-30 bg-slate-950/50 md:hidden"
        />
      ) : null}
    </div>
  )
}

export default DashboardLayout
