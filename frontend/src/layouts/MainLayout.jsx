import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar.jsx'
import Navbar from './Navbar.jsx'
import { useTheme } from '../context/ThemeContext.jsx'
import api from '../services/api.js'

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const { dark } = useTheme()

  /* Refresca los datos de sesión (rol, módulos habilitados) al entrar,
     por si un admin/empresa cambió permisos mientras el usuario estaba logueado. */
  useEffect(() => {
    api.get('/auth/me')
      .then(res => {
        const actual = JSON.parse(localStorage.getItem('aleri-user') || '{}')
        localStorage.setItem('aleri-user', JSON.stringify({ ...actual, ...res.data }))
        window.dispatchEvent(new Event('aleri-user-updated'))
      })
      .catch(() => {})
  }, [])

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
