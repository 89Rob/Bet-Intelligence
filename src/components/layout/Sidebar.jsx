import Navigation from '../navigation/Navigation'

function Sidebar() {
  return (
    <aside className="w-full shrink-0 border-b border-slate-200 bg-white p-4 md:w-72 md:border-b-0 md:border-r">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-sm font-bold text-white">
          BI
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Portfolio</p>
          <h2 className="text-lg font-semibold text-slate-900">Bet Intelligence</h2>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Navigation
          </p>
          <Navigation />
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
