import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'

export default function Layout() {
  const location = useLocation()
  const hideSidebar = location.pathname === '/about'

  return (
    <div className="flex min-h-screen bg-[#0A000F]">
      {!hideSidebar && <Sidebar />}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
