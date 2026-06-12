import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar.jsx'
import Navbar from './Navbar.jsx'
import { useTheme } from '../context/ThemeContext.jsx'

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const { dark } = useTheme()

  const pageBg = dark ? '#0b1120' : '#f1f5f9'

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: pageBg }}>
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} dark={dark} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar dark={dark} />
        <main className="flex-1 overflow-y-auto p-6 transition-colors duration-300">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
