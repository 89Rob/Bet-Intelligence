import Card from './Card'

function StatCard({ label, value, change, tone = 'neutral' }) {
  const toneStyles = {
    neutral: 'border-slate-200 bg-[var(--panel)]',
    indigo: 'border-indigo-100 bg-indigo-50 dark:bg-indigo-950/20',
    success: 'border-emerald-100 bg-emerald-50 dark:bg-emerald-950/20',
    warning: 'border-amber-100 bg-amber-50 dark:bg-amber-950/20',
  }

  return (
    <Card className={`p-5 transition-transform duration-200 hover:-translate-y-0.5 ${toneStyles[tone]}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-[var(--muted)]">{label}</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-[var(--text)]">{value}</p>
        </div>
        {change ? (
          <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-200">
            {change}
          </span>
        ) : null}
      </div>
    </Card>
  )
}

export default StatCard
