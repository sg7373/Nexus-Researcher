import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { to: '/dashboard', icon: '🏠', label: 'Dashboard & Projects' },
  { to: '/graph', icon: '🕸️', label: 'Knowledge Graph' },
  { to: '/assistant', icon: '🤖', label: 'AI Assistant' },
  { to: '/similarity', icon: '🔍', label: 'Similarity Check' },
  { to: '/about', icon: '🚀', label: 'About Nexus' },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const initials = user?.name
    ? user.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
    : 'U'

  return (
    <aside className="w-64 min-h-screen bg-[#150825] flex flex-col border-r border-white/5 shrink-0">
      <div className="px-6 py-6">
        <h1 className="text-2xl font-bold tracking-wider text-[#A855F7]">NEXUS</h1>
        <p className="text-xs text-gray-400 mt-1">Research Intelligence</p>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                isActive
                  ? 'bg-[#0A000F] text-[#A855F7] border-l-2 border-[#A855F7]'
                  : 'text-gray-400 hover:text-white hover:bg-white/5 border-l-2 border-transparent'
              }`
            }
          >
            <span className="text-lg">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="px-4 py-4 border-t border-white/5">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-full bg-linear-to-br from-[#A855F7] to-[#7C3AED] flex items-center justify-center text-sm font-bold">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-white truncate">{user?.name || 'Researcher'}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email || ''}</p>
          </div>
          <button
            onClick={handleLogout}
            title="Sign out"
            className="text-gray-500 hover:text-red-400 transition-colors text-lg"
          >
            ⏻
          </button>
        </div>
      </div>
    </aside>
  )
}
