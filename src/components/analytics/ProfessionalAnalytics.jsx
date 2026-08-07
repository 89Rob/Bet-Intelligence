import Badge from '../ui/Badge'
import Card from '../ui/Card'
import StatCard from '../ui/StatCard'

function formatCurrency(value) {
  return `£${Number(value).toFixed(2)}`
}

function LineChart({ points, height = 130 }) {
  if (!points.length) {
    return (
      <div className="flex h-[130px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500">
        No data available
      </div>
    )
  }

  const maxValue = Math.max(...points.map((point) => point.value), 1)
  const minValue = Math.min(...points.map((point) => point.value), 0)
  const range = maxValue - minValue || 1

  const path = points
    .map((point, index) => {
      const x = (index / Math.max(points.length - 1, 1)) * 100
      const y = 100 - ((point.value - minValue) / range) * 100
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
    })
    .join(' ')

  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-[130px] w-full">
      <path d={path} fill="none" stroke="#4f46e5" strokeWidth="2.5" strokeLinecap="round" />
      {points.map((point, index) => {
        const x = (index / Math.max(points.length - 1, 1)) * 100
        const y = 100 - ((point.value - minValue) / range) * 100
        return <circle key={`${point.label}-${index}`} cx={x} cy={y} r="1.8" fill="#4f46e5" />
      })}
    </svg>
  )
}

function BarChart({ data }) {
  if (!data.length) {
    return (
      <div className="flex h-[130px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500">
        No data available
      </div>
    )
  }

  const maxValue = Math.max(...data.map((item) => item.value), 1)

  return (
    <div className="flex h-[150px] items-end gap-3 pt-3">
      {data.map((item) => (
        <div key={item.label} className="flex flex-1 flex-col items-center gap-2">
          <div className="flex h-full w-full items-end justify-center">
            <div
              className="w-full rounded-t-lg bg-indigo-500/80"
              style={{ height: `${(item.value / maxValue) * 100}%`, minHeight: item.value === 0 ? '6px' : '12px' }}
            />
          </div>
          <span className="text-[10px] text-slate-500">{item.label}</span>
        </div>
      ))}
    </div>
  )
}

function ProfessionalAnalytics({ bets }) {
  if (!bets.length) {
    return (
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-slate-900">Analytics Overview</h2>
        <p className="mt-2 text-sm text-slate-500">No bets match the current criteria.</p>
      </Card>
    )
  }

  const sortedBets = [...bets].sort((a, b) => new Date(a.date) - new Date(b.date))
  const profitHistory = sortedBets.map((bet) => ({
    label: bet.date.slice(5),
    value: bet.profit,
  }))

  const bankroll = sortedBets.reduce((acc, bet) => {
    const last = acc[acc.length - 1]?.value ?? 0
    acc.push({ label: bet.date.slice(5), value: last + Number(bet.profit || 0) })
    return acc
  }, [])

  const monthlySummary = Array.from({ length: 6 }, (_, index) => {
    const currentDate = new Date()
    currentDate.setMonth(currentDate.getMonth() - (5 - index))
    const key = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`
    const label = currentDate.toLocaleString('en-GB', { month: 'short' })
    const total = sortedBets
      .filter((bet) => {
        const date = new Date(bet.date)
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}` === key
      })
      .reduce((sum, bet) => sum + Number(bet.profit || 0), 0)

    return { label, value: total }
  })

  const recentForm = sortedBets.slice(-10).map((bet) => {
    const variant = bet.result === 'Won' ? 'success' : bet.result === 'Lost' ? 'danger' : 'neutral'
    return { ...bet, variant }
  })

  const sportBreakdown = Object.entries(
    sortedBets.reduce((acc, bet) => {
      const key = bet.sport || 'Unknown'
      acc[key] = (acc[key] || 0) + Number(bet.profit || 0)
      return acc
    }, {}),
  ).map(([sport, total]) => ({ sport, total }))

  const totalProfit = sortedBets.reduce((sum, bet) => sum + Number(bet.profit || 0), 0)
  const averageProfit = totalProfit / sortedBets.length
  const largestWin = Math.max(...sortedBets.filter((bet) => bet.result === 'Won').map((bet) => Number(bet.profit || 0)), 0)
  const largestLoss = Math.min(...sortedBets.filter((bet) => bet.result === 'Lost').map((bet) => Number(bet.profit || 0)), 0)

  const streaks = sortedBets.reduce(
    (acc, bet) => {
      if (bet.result === 'Won') {
        acc.currentWin += 1
        acc.bestWin = Math.max(acc.bestWin, acc.currentWin)
        acc.currentLoss = 0
      } else if (bet.result === 'Lost') {
        acc.currentLoss += 1
        acc.worstLoss = Math.max(acc.worstLoss, acc.currentLoss)
        acc.currentWin = 0
      } else {
        acc.currentWin = 0
        acc.currentLoss = 0
      }
      return acc
    },
    { currentWin: 0, bestWin: 0, currentLoss: 0, worstLoss: 0 },
  )

  const overallForm = recentForm.map((bet) => ({
    ...bet,
    symbol: bet.result === 'Won' ? 'W' : bet.result === 'Lost' ? 'L' : bet.result === 'Void' ? 'V' : 'P',
  }))

  const performanceSummary = [
    `Your current view shows a total profit of ${formatCurrency(totalProfit)} across ${sortedBets.length} bets.`,
    `Average profit per bet sits at ${formatCurrency(averageProfit)} with the strongest sport return coming from ${sportBreakdown[0]?.sport || 'N/A'}.`,
    `The longest positive run is ${streaks.bestWin} wins, while the longest losing run is ${streaks.worstLoss} losses.`,
  ]

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Best Winning Streak" value={`${streaks.bestWin}`} change="Wins" tone="success" />
        <StatCard label="Worst Losing Streak" value={`${streaks.worstLoss}`} change="Losses" tone="warning" />
        <StatCard label="Largest Win" value={formatCurrency(largestWin)} change="Best result" tone="success" />
        <StatCard label="Largest Loss" value={formatCurrency(largestLoss)} change="Worst result" tone="warning" />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Profit Over Time</h3>
              <p className="text-sm text-slate-500">Cumulative profit across the visible bets</p>
            </div>
          </div>
          <LineChart points={sortedBets.map((bet, index) => ({ label: bet.date.slice(5), value: sortedBets.slice(0, index + 1).reduce((sum, item) => sum + Number(item.profit || 0), 0) }))} />
        </Card>

        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Bankroll Growth</h3>
              <p className="text-sm text-slate-500">Running bank total over the current dataset</p>
            </div>
          </div>
          <LineChart points={bankroll.map((point) => ({ label: point.label, value: point.value }))} />
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {monthlySummary.map((month) => (
          <Card key={month.label} className="p-5">
            <p className="text-sm font-medium text-slate-500">{month.label}</p>
            <p className="mt-3 text-2xl font-semibold text-slate-900">{formatCurrency(month.value)}</p>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_1.4fr]">
        <Card className="p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Profit by Sport</h3>
            <p className="text-sm text-slate-500">Net performance across sports</p>
          </div>
          <BarChart data={sportBreakdown.map((item) => ({ label: item.sport.slice(0, 8), value: item.total }))} />
          <div className="mt-4 space-y-2">
            {sportBreakdown.map((item) => (
              <div key={item.sport} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
                <span className="font-medium text-slate-700">{item.sport}</span>
                <span className="font-semibold text-slate-900">{formatCurrency(item.total)}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Recent Form</h3>
            <p className="text-sm text-slate-500">Last 10 bets</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {overallForm.map((bet, index) => (
              <Badge key={`${bet.event}-${index}`} variant={bet.variant}>{bet.symbol}</Badge>
            ))}
          </div>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Card className="p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Performance Insights</h3>
            <p className="text-sm text-slate-500">Key takeaways from the current view</p>
          </div>
          <div className="space-y-3">
            {performanceSummary.map((insight, index) => (
              <div key={index} className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                {insight}
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Average Profit / Bet</h3>
            <p className="text-sm text-slate-500">Net average from visible bets</p>
          </div>
          <p className="text-3xl font-semibold text-slate-900">{formatCurrency(averageProfit)}</p>
        </Card>
      </section>
    </div>
  )
}

export default ProfessionalAnalytics
