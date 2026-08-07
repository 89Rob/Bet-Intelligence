import Badge from './ui/Badge'
import Card from './ui/Card'

const resultVariants = {
  Won: 'success',
  Lost: 'danger',
  Void: 'neutral',
  Pending: 'indigo',
}

const formatCurrency = (value) => `£${Number(value).toFixed(2)}`
const formatOdds = (value) => Number(value).toFixed(2)

function BetTable({ bets }) {
  if (!bets.length) {
    return (
      <Card className="p-8">
        <div className="flex flex-col items-center justify-center text-center">
          <svg viewBox="0 0 64 64" aria-hidden="true" className="mb-4 h-16 w-16 text-indigo-500">
            <circle cx="28" cy="28" r="18" fill="none" stroke="currentColor" strokeWidth="3" />
            <path d="M40 40l14 14" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
            <path d="M24 20l8 8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            <circle cx="24" cy="24" r="2" fill="currentColor" />
          </svg>
          <h3 className="text-lg font-semibold text-slate-900">No bets match your filters</h3>
          <p className="mt-2 max-w-md text-sm text-slate-500">
            Try clearing your search or changing the sport and result filters to see more betting records.
          </p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-0 text-left text-sm text-[var(--text)]">
          <thead className="sticky top-0 z-10 bg-[var(--panel-muted)] text-[11px] uppercase tracking-[0.12em] text-[var(--muted)]">
            <tr>
              <th className="px-4 py-3 font-semibold">Date</th>
              <th className="px-4 py-3 font-semibold">Event</th>
              <th className="px-4 py-3 font-semibold">Market</th>
              <th className="px-4 py-3 font-semibold">Selection</th>
              <th className="px-4 py-3 font-semibold">Bookmaker</th>
              <th className="px-4 py-3 font-semibold">Stake</th>
              <th className="px-4 py-3 font-semibold">Odds</th>
              <th className="px-4 py-3 font-semibold">Result</th>
              <th className="px-4 py-3 font-semibold">Profit</th>
            </tr>
          </thead>
          <tbody className="bg-[var(--panel)]">
            {bets.map((bet, index) => (
              <tr
                key={bet.id}
                className={`align-top transition-colors duration-200 hover:bg-slate-50/80 ${
                  index % 2 === 0 ? 'bg-white/60' : 'bg-slate-50/40'
                }`}
              >
                <td className="px-4 py-3 whitespace-nowrap">{bet.date}</td>
                <td className="px-4 py-3">
                  <div className="font-medium text-[var(--text)]">{bet.event}</div>
                  <div className="text-xs text-[var(--muted)]">{bet.sport}</div>
                </td>
                <td className="px-4 py-3">{bet.market}</td>
                <td className="px-4 py-3 font-medium text-[var(--text)]">{bet.selection}</td>
                <td className="px-4 py-3">{bet.bookmaker}</td>
                <td className="px-4 py-3 whitespace-nowrap">{formatCurrency(bet.stake)}</td>
                <td className="px-4 py-3 whitespace-nowrap">{formatOdds(bet.odds)}</td>
                <td className="px-4 py-3">
                  <Badge variant={resultVariants[bet.result] || 'neutral'}>{bet.result}</Badge>
                </td>
                <td className="px-4 py-3 whitespace-nowrap font-semibold text-[var(--text)]">
                  {formatCurrency(bet.profit)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

export default BetTable
