function Skeleton({ className = '', ...props }) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-slate-200/80 dark:bg-slate-700/60 ${className}`}
      {...props}
    />
  )
}

export function MetricsSkeleton() {
  return (
    <section className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="mt-4 h-9 w-28" />
          <Skeleton className="mt-3 h-4 w-16" />
        </div>
      ))}
    </section>
  )
}

export function AnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-4 h-8 w-20" />
          </div>
        ))}
      </section>
      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="mt-4 h-32 w-full" />
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="mt-4 h-32 w-full" />
        </div>
      </section>
    </div>
  )
}

export default Skeleton
