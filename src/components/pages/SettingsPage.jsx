import Card from '../ui/Card'

function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Preferences</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[var(--text)]">Settings</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-[var(--text)]">Theme selection</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">Choose your preferred appearance for this session.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <span className="rounded-full bg-indigo-100 px-3 py-1.5 text-sm font-medium text-indigo-700">
              Light
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700">
              Dark
            </span>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-[var(--text)]">Currency</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">All balances and calculations are displayed in GBP.</p>
          <div className="mt-4 inline-flex rounded-full bg-emerald-100 px-3 py-1.5 text-sm font-semibold text-emerald-700">
            £ GBP
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-[var(--text)]">About</h2>
        <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
          Bet Intelligence is a betting dashboard focused on tracking records, monitoring performance,
          and reviewing analytics without storing data externally. This build keeps the experience local to
          the current session and uses the existing mock betting dataset.
        </p>
      </Card>
    </div>
  )
}

export default SettingsPage
