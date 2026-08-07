import Card from './Card'

function StatCard({ label, value, change, tone = 'neutral' }) {
  const toneStyles = {
    neutral: 'border-slate-200 bg-white',
    indigo: 'border-indigo-100 bg-indigo-50',
    success: 'border-emerald-100 bg-emerald-50',
    warning: 'border-amber-100 bg-amber-50',
  }

  return (
    <Card className={`p-5 ${toneStyles[tone]}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">{value}</p>
        </div>
        {change ? (
          <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
            {change}
          </span>
        ) : null}
      </div>
    </Card>
  )
}

export default StatCard
