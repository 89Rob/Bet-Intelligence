import Button from '../ui/Button'
import Card from '../ui/Card'
import PageHeader from '../ui/PageHeader'
import StatCard from '../ui/StatCard'
import DashboardLayout from '../layout/DashboardLayout'
import BetTable from '../BetTable'
import { mockBets } from '../../data/bets'

function HomePage() {
  return (
    <DashboardLayout>
      <PageHeader
        eyebrow="Operations"
        title="Welcome back"
        description="Overview of your betting activity and upcoming opportunities."
        actions={
          <>
            <Button variant="secondary" size="sm">
              Filters
            </Button>
            <Button size="sm">Create report</Button>
          </>
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Games Today" value="0" change="Live" tone="indigo" />
        <StatCard label="Tracked Bets" value={String(mockBets.length)} change="Latest" tone="neutral" />
        <StatCard label="Win Rate" value="--" change="N/A" tone="success" />
        <StatCard label="Profit" value="£0.00" change="+0.00%" tone="warning" />
      </section>

      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Betting Records</h2>
            <p className="text-sm text-slate-500">Recent football bets tracked in the system.</p>
          </div>
          <span className="rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-medium text-indigo-700">
            {mockBets.length} bets
          </span>
        </div>
        <BetTable bets={mockBets} />
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Recent Activity</h2>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
              Placeholder
            </span>
          </div>
          <div className="space-y-4">
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
              No recent activity yet.
            </div>
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
              Upcoming insights will appear here.
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Upcoming Matches</h2>
            <span className="rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-medium text-indigo-700">
              Soon
            </span>
          </div>
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
              No games scheduled.
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
              Match listings will be added later.
            </div>
          </div>
        </Card>
      </section>
    </DashboardLayout>
  )
}

export default HomePage
