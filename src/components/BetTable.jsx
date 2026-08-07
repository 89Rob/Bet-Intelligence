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
  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm text-slate-700">
          <thead className="bg-slate-50 text-xs uppercase tracking-[0.08em] text-slate-600">
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
          <tbody className="divide-y divide-slate-200 bg-white">
            {bets.map((bet) => (
              <tr key={bet.id} className="align-top hover:bg-slate-50">
                <td className="px-4 py-3 whitespace-nowrap">{bet.date}</td>
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-900">{bet.event}</div>
                  <div className="text-xs text-slate-500">{bet.sport}</div>
                </td>
                <td className="px-4 py-3">{bet.market}</td>
                <td className="px-4 py-3 font-medium text-slate-800">{bet.selection}</td>
                <td className="px-4 py-3">{bet.bookmaker}</td>
                <td className="px-4 py-3 whitespace-nowrap">{formatCurrency(bet.stake)}</td>
                <td className="px-4 py-3 whitespace-nowrap">{formatOdds(bet.odds)}</td>
                <td className="px-4 py-3">
                  <Badge variant={resultVariants[bet.result] || 'neutral'}>{bet.result}</Badge>
                </td>
                <td className="px-4 py-3 whitespace-nowrap font-medium text-slate-900">
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
