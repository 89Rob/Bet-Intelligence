const navItems = [
  { label: 'Overview', active: true },
  { label: 'Markets', active: false },
  { label: 'Performance', active: false },
  { label: 'Insights', active: false },
]

function Navigation() {
  return (
    <nav className="flex flex-wrap items-center gap-2">
      {navItems.map((item) => (
        <button
          key={item.label}
          type="button"
          className={`rounded-full px-3 py-2 text-sm font-medium transition-colors ${
            item.active
              ? 'bg-indigo-100 text-indigo-700'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          {item.label}
        </button>
      ))}
    </nav>
  )
}

export default Navigation
