import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, AlertTriangle, HardHat,
  Users, Building2, ChevronLeft, ChevronRight,
  LogOut, FileBarChart2
} from 'lucide-react'
import LogoutTransition from '../components/LogoutTransition.jsx'
import { useEffect, useState } from 'react'

function leerUsuario() {
  try { return JSON.parse(localStorage.getItem('aleri-user') || '{}') } catch (_) { return {} }
}

/**
 * Items del menú por rol.
 * El plan ya NO controla qué se ve — solo cuántos supervisores/colaboradores
 * puede crear el usuario EMPRESA o SUPERVISOR (eso se valida en el backend).
 *
 * Roles:
 *  - ADMIN/SUBADMIN: ven todo el sistema, gestión de empresas y de admins.
 *  - EMPRESA:        4 módulos base + "Mi equipo" para gestionar supervisores.
 *  - SUPERVISOR:     4 módulos base + "Mis colaboradores" para gestionar su equipo.
 *  - COLABORADOR:    4 módulos base, sin gestión de equipo.
 */
const ITEMS_BASE = [
  { to: '/dashboard',  icon: LayoutDashboard, label: 'Dashboard'              },
  { to: '/incidentes', icon: AlertTriangle,   label: 'Incidentes / Accidentes' },
  { to: '/epps',       icon: HardHat,         label: 'EPPs'                   },
  { to: '/reportes',   icon: FileBarChart2,   label: 'Reportes'               },
]

const NAV_POR_ROL = {
  ADMIN: [
    { to: '/dashboard',     icon: LayoutDashboard, label: 'Dashboard'              },
    { to: '/incidentes',    icon: AlertTriangle,   label: 'Incidentes / Accidentes' },
    { to: '/epps',          icon: HardHat,         label: 'EPPs'                   },
    { to: '/colaboradores', icon: Users,           label: 'Administradores'        },
    { to: '/reportes',      icon: FileBarChart2,   label: 'Reportes'               },
    { to: '/empresas',      icon: Building2,       label: 'Empresas'               },
  ],
  SUBADMIN: [
    { to: '/dashboard',     icon: LayoutDashboard, label: 'Dashboard'              },
    { to: '/incidentes',    icon: AlertTriangle,   label: 'Incidentes / Accidentes' },
    { to: '/epps',          icon: HardHat,         label: 'EPPs'                   },
    { to: '/colaboradores', icon: Users,           label: 'Administradores'        },
    { to: '/reportes',      icon: FileBarChart2,   label: 'Reportes'               },
    { to: '/empresas',      icon: Building2,       label: 'Empresas'               },
  ],
  EMPRESA: [
    ...ITEMS_BASE,
    { to: '/mi-equipo',  icon: Users,         label: 'Mi equipo' },
  ],
  SUPERVISOR: [
    ...ITEMS_BASE,
    { to: '/mi-equipo',  icon: Users,         label: 'Mis colaboradores', modulo: 'COLABORADORES' },
  ],
  COLABORADOR: ITEMS_BASE,
}

/* Mapea cada ruta base a su módulo — para filtrar el menú del SUPERVISOR según permisos */
const MODULO_POR_RUTA = {
  '/incidentes': 'INCIDENTES',
  '/epps':       'EPPS',
  '/reportes':   'REPORTES',
}

const rolLabel = {
  ADMIN:       'Administrador',
  EMPRESA:     'Empresa',
  SUPERVISOR:  'Supervisor',
  COLABORADOR: 'Colaborador',
}

export default function Sidebar({ collapsed, setCollapsed, dark }) {
  const [loggingOut, setLoggingOut] = useState(false)
  const [userData, setUserData] = useState(leerUsuario)
  const navigate = useNavigate()

  /* Refresca los datos de sesión cuando MainLayout confirma con el backend
     los módulos vigentes (por si un admin/empresa cambió permisos recién). */
  useEffect(() => {
    const onUpdate = () => setUserData(leerUsuario())
    window.addEventListener('aleri-user-updated', onUpdate)
    return () => window.removeEventListener('aleri-user-updated', onUpdate)
  }, [])

  const nombre  = userData.nombre || 'Usuario'
  const rol     = userData.rol    || 'ADMIN'
  const empresa = userData.empresaNombre || ''
  const inicial = nombre.charAt(0).toUpperCase()
  const modulosUsuario = userData.modulos || null

  /* Items del sidebar según rol del usuario logueado.
     Para SUPERVISOR, se filtra además por los módulos que su empresa le habilitó. */
  let navItems = NAV_POR_ROL[rol] || ITEMS_BASE
  if (rol === 'SUPERVISOR' && Array.isArray(modulosUsuario)) {
    navItems = navItems.filter(item => {
      const modulo = item.modulo || MODULO_POR_RUTA[item.to]
      return !modulo || modulosUsuario.includes(modulo)
    })
  }

  const handleLogoutDone = () => {
    localStorage.removeItem('aleri-token')
    localStorage.removeItem('aleri-user')
    sessionStorage.clear()
    navigate('/login')
  }

  /* Colores base del sidebar — siempre azul oscuro de marca */
  const bg          = '#2a0a1e'
  const bgDeep      = '#1a0613'
  const accent      = '#af2154'   /* rosa para item activo */
  const hoverBg     = 'rgba(255,255,255,0.07)'
  const activeBg    = accent
  const borderLine  = 'rgba(255,255,255,0.08)'

  return (
    <>
      {loggingOut && <LogoutTransition onDone={handleLogoutDone} />}

      <aside
        className="flex flex-col h-screen sticky top-0 z-20 select-none transition-all duration-300"
        style={{
          width: collapsed ? 72 : 248,
          minWidth: collapsed ? 72 : 248,
          backgroundColor: bg,
        }}
      >

        {/* ── Logo / marca (wordmark estilo login) ── */}
        <div
          className="flex flex-col items-center justify-center px-4 py-5 flex-shrink-0"
          style={{ borderBottom: `1px solid ${borderLine}` }}
        >
          <span
            className="font-extrabold text-white tracking-tight leading-none drop-shadow-[0_2px_12px_rgba(175,33,84,0.5)]"
            style={{ fontSize: collapsed ? '1.5rem' : '2rem' }}
          >
            {collapsed ? 'a' : 'aleri'}
          </span>
          <div
            className="mt-1.5 h-[3px] rounded-full"
            style={{
              width: collapsed ? '60%' : '70%',
              background: 'linear-gradient(90deg, #af2154 0%, #f58227 100%)',
              boxShadow: '0 0 16px rgba(245,130,39,0.5)',
            }}
          />
        </div>

        {/* ── Navegación ── */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5">

          {/* Etiqueta de sección */}
          {!collapsed && (
            <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.15em]"
              style={{ color: 'rgba(255,255,255,0.3)' }}>
              Menú
            </p>
          )}

          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              title={collapsed ? label : undefined}
              className="block"
            >
              {({ isActive }) => (
                <div
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer"
                  style={{
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    backgroundColor: isActive ? activeBg : 'transparent',
                    color: isActive ? '#ffffff' : 'rgba(255,255,255,0.55)',
                    boxShadow: isActive ? '0 2px 8px rgba(175,33,84,0.35)' : 'none',
                  }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.backgroundColor = hoverBg; e.currentTarget.style.color = '#fff' }}
                  onMouseLeave={e => { if (!isActive) { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.55)' } }}
                >
                  {/* Indicador lateral cuando activo */}
                  {!collapsed && isActive && (
                    <span className="absolute left-0 w-1 h-6 rounded-r-full" style={{ backgroundColor: '#f58227' }} />
                  )}
                  <Icon size={18} className="flex-shrink-0" />
                  {!collapsed && <span className="truncate">{label}</span>}
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* ── Perfil del usuario ── */}
        {!collapsed && (
          <div
            className="mx-2 mb-2 rounded-xl p-3"
            style={{ backgroundColor: bgDeep }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                style={{ backgroundColor: accent }}
              >
                {inicial}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-white text-xs font-semibold truncate leading-none">{nombre}</p>
                <p className="text-white/40 text-[10px] mt-0.5 truncate">{empresa || rolLabel[rol] || rol}</p>
              </div>
              <button
                onClick={() => { setLoggingOut(true) }}
                title="Cerrar sesión"
                className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                style={{ color: 'rgba(255,255,255,0.4)' }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.2)'; e.currentTarget.style.color = '#ef4444' }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)' }}
              >
                <LogOut size={15} />
              </button>
            </div>
          </div>
        )}

        {/* ── Toggle colapsar ── */}
        <div
          className="px-2 py-3 flex-shrink-0"
          style={{ borderTop: `1px solid ${borderLine}` }}
        >
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center w-full py-2 px-3 rounded-xl transition-all duration-150 text-xs font-medium"
            style={{ color: 'rgba(255,255,255,0.4)', justifyContent: collapsed ? 'center' : 'flex-start' }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = hoverBg; e.currentTarget.style.color = '#fff' }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)' }}
            title={collapsed ? 'Expandir menú' : 'Colapsar menú'}
          >
            {collapsed ? <ChevronRight size={17} /> : <><ChevronLeft size={17} /><span className="ml-2">Colapsar</span></>}
          </button>
        </div>

      </aside>
    </>
  )
}
