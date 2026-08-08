import { useEffect, useState } from 'react'
import Card from '../ui/Card'
import PageHeader from '../ui/PageHeader'
import StatCard from '../ui/StatCard'
import { mockBets } from '../../data/bets'
import {
  calculateAverageStake,
  calculateRoi,
  calculateSportPerformance,
  calculateTotalProfit,
  calculateTotalStaked,
  calculateWinRate,
  calculateWinningBets,
  calculateLosingBets,
} from '../../lib/analytics'

const BETS_STORAGE_KEY = 'bet-intelligence-bets'

function getStoredBets() {
  if (typeof window === 'undefined') {
    return mockBets
  }

  try {
    const savedBets = localStorage.getItem(BETS_STORAGE_KEY)
    if (!savedBets) {
      return mockBets
    }

    const parsed = JSON.parse(savedBets)
    return Array.isArray(parsed) ? parsed : mockBets
  } catch (error) {
    console.error('Failed to load dashboard bets:', error)
    return mockBets
  }
}

function HomePage() {
  const [bets, setBets] = useState(() => getStoredBets())

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const syncBets = () => setBets(getStoredBets())
    window.addEventListener('storage', syncBets)
    window.addEventListener('bet-data-updated', syncBets)
    return () => {
      window.removeEventListener('storage', syncBets)
      window.removeEventListener('bet-data-updated', syncBets)
    }
  }, [])

  const totalStaked = calculateTotalStaked(bets)
  const totalProfit = calculateTotalProfit(bets)
  const roi = calculateRoi(totalProfit, totalStaked)
  const averageStake = calculateAverageStake(totalStaked, bets.length)
  const winRate = calculateWinRate(bets)
  const winningBets = calculateWinningBets(bets)
  const losingBets = calculateLosingBets(bets)
  const { best: bestSport, worst: worstSport } = calculateSportPerformance(bets)
  const recentBets = [...bets].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5)

  return (
    <>
      <PageHeader
        eyebrow="Portfolio"
        title="Dashboard"
        description="A quick overview of your betting performance, portfolio health, and recent activity."
      />

      <section className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Staked" value="£0.00" change="All bets" tone="indigo" />
        <StatCard label="Total Profit" value="£0.00" change="Net" tone="warning" />
        <StatCard label="ROI" value="0%" change="Profit / stake" tone="success" />
        <StatCard label="Average Stake" value="£0.00" change="Per bet" tone="neutral" />
      </section>

      <section className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Win Rate" value={`${winRate.toFixed(1)}%`} change="Settled" tone="success" />
        <StatCard label="Winning Bets" value={String(winningBets)} change="Won" tone="success" />
        <StatCard label="Losing Bets" value={String(losingBets)} change="Lost" tone="warning" />
        <StatCard label="Best Sport" value={bestSport || 'N/A'} change="Highest profit" tone="indigo" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Card className="p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-[var(--text)]">Portfolio snapshot</h2>
              <p className="text-sm text-[var(--muted)]">Current performance across your active betting record.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel-muted)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Strongest market</p>
              <p className="mt-2 text-2xl font-semibold text-[var(--text)]">{bestSport || 'No data'}</p>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel-muted)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Weakest market</p>
              <p className="mt-2 text-2xl font-semibold text-[var(--text)]">{worstSport || 'No data'}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-[var(--text)]">Key insights</h2>
              <p className="text-sm text-[var(--muted)]">Quick takeaways from the current ledger.</p>
            </div>
          </div>

          <ul className="space-y-3 text-sm text-[var(--muted)]">
            <li className="rounded-xl border border-[var(--border)] bg-[var(--panel-muted)] p-3">Net profit is <span className="font-semibold text-[var(--text)]">£{totalProfit.toFixed(2)}</span> across the current dataset.</li>
            <li className="rounded-xl border border-[var(--border)] bg-[var(--panel-muted)] p-3">Current ROI sits at <span className="font-semibold text-[var(--text)]">{roi.toFixed(1)}%</span> based on active stakes.</li>
            <li className="rounded-xl border border-[var(--border)] bg-[var(--panel-muted)] p-3">The leading sport is <span className="font-semibold text-[var(--text)]">{bestSport || 'not yet determined'}</span>.</li>
          </ul>
        </Card>
      </section>

      <section className="mt-8">
        <Card className="p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-[var(--text)]">Recent activity</h2>
              <p className="text-sm text-[var(--muted)]">Latest entries in your bet history.</p>
            </div>
          </div>

          {recentBets.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--panel-muted)] p-4 text-sm text-[var(--muted)]">
              No recent bets available yet.
            </div>
          ) : (
            <div className="space-y-3">
              {recentBets.map((bet) => (
                <div key={bet.id} className="flex flex-col gap-2 rounded-xl border border-[var(--border)] bg-[var(--panel-muted)] p-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-medium text-[var(--text)]">{bet.event}</p>
                    <p className="text-sm text-[var(--muted)]">{bet.market} • {bet.selection} • {bet.result}</p>
                  </div>
                  <div className="text-left md:text-right">
                    <p className="font-semibold text-[var(--text)]">£{Number(bet.profit || 0).toFixed(2)}</p>
                    <p className="text-xs text-[var(--muted)]">{bet.date}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </section>
    </>
  )
}

export default HomePage
