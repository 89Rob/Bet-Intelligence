import { NavLink } from 'react-router-dom'

const navItems = [
  { label: 'Dashboard', to: '/' },
  { label: 'Bets', to: '/bets' },
  { label: 'Analytics', to: '/analytics' },
  { label: 'Settings', to: '/settings' },
]

function Navigation({ onNavigate }) {
  return (
    <nav className="space-y-2">
      {navItems.map((item) => (
        <NavLink
          key={item.label}
          to={item.to}
          end={item.to === '/'}
          onClick={onNavigate}
          className={({ isActive }) =>
            [
              'flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ease-out hover:-translate-y-0.5',
              isActive
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                : 'text-[var(--muted)] hover:bg-[var(--panel-muted)] hover:text-[var(--text)]',
            ].join(' ')
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}

export default Navigation
