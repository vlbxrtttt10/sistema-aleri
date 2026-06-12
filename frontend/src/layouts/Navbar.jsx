import { Search, ChevronDown, LogOut, User } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ThemeToggle from '../components/ThemeToggle.jsx'
import LogoutTransition from '../components/LogoutTransition.jsx'

const rolLabel = {
  ADMIN:       'Administrador',
  EMPRESA:     'Empresa',
  SUPERVISOR:  'Supervisor',
  COLABORADOR: 'Colaborador',
}

/* Badge de rol con color según nivel */
function RolBadge({ rol, dark }) {
  const cfg = {
    ADMIN:       { bg: '#af215418', color: '#af2154', label: 'Admin' },
    EMPRESA:     { bg: '#83266d18', color: '#83266d', label: 'Empresa' },
    SUPERVISOR:  { bg: '#f59e0b18', color: '#b45309', label: 'Supervisor' },
    COLABORADOR: { bg: '#8b5cf618', color: '#6d28d9', label: 'Colaborador' },
  }
  const c = cfg[rol] || { bg: '#64748b18', color: '#64748b', label: rol }
  return (
    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
      style={{ backgroundColor: c.bg, color: c.color }}>
      {c.label}
    </span>
  )
}

export default function Navbar({ dark }) {
  const [showMenu, setShowMenu] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const [userData, setUserData] = useState(() =>
    JSON.parse(localStorage.getItem('aleri-user') || '{}')
  )
  const navigate = useNavigate()

  const nombre  = userData.nombre || 'Usuario'
  const rol     = userData.rol    || 'ADMIN'
  const empresa = userData.empresaNombre || ''
  const inicial = nombre.charAt(0).toUpperCase()

  useEffect(() => {
    const handler = () => setUserData(JSON.parse(localStorage.getItem('aleri-user') || '{}'))
    window.addEventListener('aleri-user-updated', handler)
    return () => window.removeEventListener('aleri-user-updated', handler)
  }, [])

  /* Cierra el dropdown al hacer clic fuera */
  useEffect(() => {
    if (!showMenu) return
    const close = (e) => {
      if (!e.target.closest('[data-user-menu]')) setShowMenu(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [showMenu])

  const handleLogout = () => { setShowMenu(false); setLoggingOut(true) }
  const handleLogoutDone = () => {
    localStorage.removeItem('aleri-token')
    localStorage.removeItem('aleri-user')
    sessionStorage.clear()
    navigate('/login')
  }

  const bg      = dark ? '#0b1120' : '#ffffff'
  const border  = dark ? '#1e293b' : '#e2e8f0'
  const text    = dark ? '#f1f5f9' : '#111827'
  const sub     = dark ? '#64748b' : '#6b7280'
  const inputBg = dark ? '#1e293b' : '#f8fafc'
  const inputBorder = dark ? '#334155' : '#e2e8f0'
  const dropBg  = dark ? '#1e293b' : '#ffffff'
  const dropBorder = dark ? '#334155' : '#e2e8f0'

  return (
    <>
      {loggingOut && <LogoutTransition onDone={handleLogoutDone} />}

      <header
        className="sticky top-0 z-10 flex items-center justify-between px-5 py-2.5 border-b transition-colors duration-300"
        style={{ backgroundColor: bg, borderColor: border }}
      >

        {/* ── Buscador ── */}
        <div className="relative hidden sm:block">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: sub }} />
          <input
            type="text"
            placeholder="Buscar en SSOMA..."
            className="pl-9 pr-4 py-2 text-sm rounded-xl border focus:outline-none transition-all w-52 focus:w-64"
            style={{
              backgroundColor: inputBg,
              borderColor: inputBorder,
              color: text,
            }}
            onFocus={e => { e.currentTarget.style.borderColor = '#af2154'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(175,33,84,0.12)' }}
            onBlur={e => { e.currentTarget.style.borderColor = inputBorder; e.currentTarget.style.boxShadow = 'none' }}
          />
        </div>

        {/* ── Acciones derecha ── */}
        <div className="flex items-center gap-2 ml-auto">

          {/* Theme toggle */}
          <ThemeToggle />

          {/* ── Usuario ── */}
          <div className="relative" data-user-menu>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="flex items-center gap-2.5 pl-1 pr-3 py-1 rounded-xl transition-colors cursor-pointer"
              style={{ backgroundColor: showMenu ? (dark ? '#334155' : '#f1f5f9') : inputBg }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = dark ? '#334155' : '#f1f5f9'}
              onMouseLeave={e => { if (!showMenu) e.currentTarget.style.backgroundColor = inputBg }}
            >
              {/* Avatar */}
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #af2154 0%, #83266d 100%)' }}
              >
                {inicial}
              </div>

              <div className="hidden sm:flex flex-col items-start">
                <p className="text-xs font-semibold leading-none truncate max-w-[110px]" style={{ color: text }}>
                  {nombre}
                </p>
                <p className="text-[10px] mt-0.5 truncate max-w-[110px]" style={{ color: sub }}>
                  {empresa || rolLabel[rol] || rol}
                </p>
              </div>
              <ChevronDown
                size={13}
                className="transition-transform duration-200"
                style={{ color: sub, transform: showMenu ? 'rotate(180deg)' : 'rotate(0deg)' }}
              />
            </button>

            {/* Dropdown */}
            {showMenu && (
              <div
                className="absolute right-0 top-full mt-2 w-52 rounded-2xl shadow-xl border overflow-hidden z-50"
                style={{ backgroundColor: dropBg, borderColor: dropBorder }}
              >
                {/* Info usuario */}
                <div className="px-4 py-3 border-b" style={{ borderColor: dropBorder }}>
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, #af2154 0%, #83266d 100%)' }}
                    >
                      {inicial}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold truncate" style={{ color: text }}>{nombre}</p>
                      <RolBadge rol={rol} dark={dark} />
                    </div>
                  </div>
                </div>

                {/* Opciones */}
                <div className="py-1">
                  <button
                    onClick={() => { navigate('/perfil'); setShowMenu(false) }}
                    className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm transition-colors text-left"
                    style={{ color: text }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = dark ? '#334155' : '#f8fafc'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <User size={15} style={{ color: '#af2154' }} />
                    Mi perfil
                  </button>
                </div>

                <div className="border-t py-1" style={{ borderColor: dropBorder }}>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm transition-colors text-left text-red-500"
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = dark ? '#450a0a' : '#fff5f5'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <LogOut size={15} />
                    Cerrar sesión
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  )
}
