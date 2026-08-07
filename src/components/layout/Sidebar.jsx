import Navigation from '../navigation/Navigation'

function Sidebar({ mobileOpen = false, onClose = () => {}, theme }) {
  return (
    <>
      <aside
        className={[
          'fixed inset-y-0 left-0 z-40 w-72 shrink-0 border-r border-[var(--border)] bg-[var(--panel)] p-4 shadow-lg transition-transform duration-300 ease-out md:static md:z-auto md:translate-x-0 md:shadow-none',
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
        ].join(' ')}
      >
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-sm font-bold text-white shadow-lg shadow-indigo-500/20">
            BI
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--muted)]">Portfolio</p>
            <h2 className="text-lg font-semibold text-[var(--text)]">Bet Intelligence</h2>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
              Navigation
            </p>
            <Navigation onNavigate={onClose} theme={theme} />
          </div>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
