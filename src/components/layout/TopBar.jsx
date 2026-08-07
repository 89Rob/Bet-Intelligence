import Button from '../ui/Button'

function TopBar() {
  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur-sm">
      <div className="flex items-center justify-between gap-4 px-4 py-4 md:px-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Dashboard
          </p>
          <h1 className="text-lg font-semibold text-slate-900">Overview</h1>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm">
            Export
          </Button>
          <Button size="sm">New View</Button>
        </div>
      </div>
    </header>
  )
}

export default TopBar
