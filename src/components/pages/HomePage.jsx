import { useState } from 'react'
import Button from '../ui/Button'
import Card from '../ui/Card'
import PageHeader from '../ui/PageHeader'
import StatCard from '../ui/StatCard'
import DashboardLayout from '../layout/DashboardLayout'
import BetTable from '../BetTable'
import AddBetForm from '../forms/AddBetForm'
import { calculateBetProfit, mockBets } from '../../data/bets'
import {
  calculateAverageOdds,
  calculateAverageStake,
  calculateLosingBets,
  calculatePendingBets,
  calculateRoi,
  calculateSportPerformance,
  calculateTotalProfit,
  calculateTotalStaked,
  calculateWinRate,
  calculateWinningBets,
} from '../../lib/analytics'

function HomePage() {
  const [bets, setBets] = useState(mockBets)
  const [searchTerm, setSearchTerm] = useState('')
  const [sportFilter, setSportFilter] = useState('All')
  const [resultFilter, setResultFilter] = useState('All')

  const sports = ['All', ...new Set(bets.map((bet) => bet.sport).filter(Boolean))]

  const filteredBets = bets.filter((bet) => {
    const combinedText = [bet.event, bet.selection, bet.bookmaker, bet.market]
      .join(' ')
      .toLowerCase()
    const matchesSearch = !searchTerm || combinedText.includes(searchTerm.toLowerCase())
    const matchesSport = sportFilter === 'All' || bet.sport === sportFilter
    const matchesResult = resultFilter === 'All' || bet.result === resultFilter

    return matchesSearch && matchesSport && matchesResult
  })

  const totalStaked = calculateTotalStaked(filteredBets)
  const totalProfit = calculateTotalProfit(filteredBets)
  const roi = calculateRoi(totalProfit, totalStaked)
  const averageStake = calculateAverageStake(totalStaked, filteredBets.length)
  const averageOdds = calculateAverageOdds(filteredBets)
  const winRate = calculateWinRate(filteredBets)
  const winningBets = calculateWinningBets(filteredBets)
  const losingBets = calculateLosingBets(filteredBets)
  const pendingBets = calculatePendingBets(filteredBets)
  const { best: bestSport, worst: worstSport } = calculateSportPerformance(filteredBets)

  const handleAddBet = (newBet) => {
    const betToAdd = {
      ...newBet,
      profit: calculateBetProfit(newBet),
    }

    setBets((currentBets) => [betToAdd, ...currentBets])
  }

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

      <section className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Staked" value={`£${totalStaked.toFixed(2)}`} change="All bets" tone="indigo" />
        <StatCard label="Total Profit" value={`£${totalProfit.toFixed(2)}`} change="Net" tone="warning" />
        <StatCard label="ROI" value={`${roi.toFixed(1)}%`} change="Profit / stake" tone="success" />
        <StatCard label="Average Stake" value={`£${averageStake.toFixed(2)}`} change="Per bet" tone="neutral" />
      </section>

      <section className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Average Odds" value={averageOdds.toFixed(2)} change="Decimal" tone="indigo" />
        <StatCard label="Win Rate" value={`${winRate.toFixed(1)}%`} change="Settled" tone="success" />
        <StatCard label="Winning Bets" value={String(winningBets)} change="Won" tone="success" />
        <StatCard label="Losing Bets" value={String(losingBets)} change="Lost" tone="warning" />
      </section>

      <section className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Pending Bets" value={String(pendingBets)} change="Open" tone="neutral" />
        <StatCard label="Best Sport" value={bestSport} change="Highest profit" tone="indigo" />
        <StatCard label="Worst Sport" value={worstSport} change="Lowest profit" tone="warning" />
        <StatCard label="Tracked Bets" value={String(filteredBets.length)} change="Visible" tone="neutral" />
      </section>

      <section className="mb-8">
        <ProfessionalAnalytics bets={filteredBets} />
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[1.1fr_1.4fr]">
        <AddBetForm onSubmit={handleAddBet} />

        <div>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Betting Records</h2>
              <p className="text-sm text-slate-500">Recent football bets tracked in the system.</p>
            </div>
            <span className="rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-medium text-indigo-700">
              {filteredBets.length} bets
            </span>
          </div>

          <Card className="mb-4 p-4">
            <div className="space-y-4">
              <label className="block text-sm font-medium text-slate-700">
                Search
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search event, selection, bookmaker or market"
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block text-sm font-medium text-slate-700">
                  Sport
                  <select
                    value={sportFilter}
                    onChange={(event) => setSportFilter(event.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  >
                    {sports.map((sport) => (
                      <option key={sport} value={sport}>
                        {sport}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block text-sm font-medium text-slate-700">
                  Result
                  <select
                    value={resultFilter}
                    onChange={(event) => setResultFilter(event.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  >
                    <option value="All">All</option>
                    <option value="Won">Won</option>
                    <option value="Lost">Lost</option>
                    <option value="Pending">Pending</option>
                    <option value="Void">Void</option>
                  </select>
                </label>
              </div>
            </div>
          </Card>

          <BetTable bets={filteredBets} />
        </div>
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
