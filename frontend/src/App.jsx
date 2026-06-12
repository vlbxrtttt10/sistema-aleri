import { Routes, Route, Navigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import LoginPage from './pages/Login/LoginPage.jsx'
import MainLayout from './layouts/MainLayout.jsx'
import DashboardPage from './pages/Dashboard/DashboardPage.jsx'
import PerfilPage from './pages/Perfil/PerfilPage.jsx'
import ColaboradoresPage from './pages/Colaboradores/ColaboradoresPage.jsx'
import EmpresasPage from './pages/Empresas/EmpresasPage.jsx'
import EmpresaDashboardPage from './pages/Empresas/EmpresaDashboardPage.jsx'
import MiEquipoPage from './pages/MiEquipo/MiEquipoPage.jsx'
import IncidentesPage from './pages/Incidentes/IncidentesPage.jsx'
import ReportesPage from './pages/Reportes/ReportesPage.jsx'
import EppsPage from './pages/Epps/EppsPage.jsx'

/* Lee el rol del usuario logueado */
function getRol() {
  try {
    return JSON.parse(localStorage.getItem('aleri-user') || '{}').rol || null
  } catch (_) { return null }
}

/**
 * Protege rutas:
 *  - si no hay token → /login
 *  - si se pasan `roles` y el rol del usuario no está en la lista → /dashboard con toast
 *
 * Importante: esto es solo UX. La verdadera autorización está en el backend
 * con @PreAuthorize. Si alguien manipula localStorage, igual el backend devuelve 403.
 */
function PrivateRoute({ children, roles }) {
  const token = localStorage.getItem('aleri-token')
  if (!token) return <Navigate to="/login" replace />

  if (roles && roles.length > 0) {
    const rol = getRol()
    if (!roles.includes(rol)) {
      // Disparamos el toast con id fijo: react-hot-toast colapsa duplicados
      // (importante con React StrictMode que monta dos veces en dev).
      toast.error('No tienes permiso para entrar a esa sección', { id: 'no-permiso' })
      return <Navigate to="/dashboard" replace />
    }
  }
  return children
}

function App() {
  return (
    <Routes>
      {/* Publica */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protegidas — dentro del layout con sidebar */}
      <Route
        element={
          <PrivateRoute>
            <MainLayout />
          </PrivateRoute>
        }
      >
        <Route path="/dashboard"     element={<DashboardPage />} />

        {/* Incidentes/accidentes: admin (vista global) + roles de empresa (su empresa) */}
        <Route path="/incidentes"
          element={<PrivateRoute roles={['ADMIN', 'SUBADMIN', 'EMPRESA', 'SUPERVISOR', 'COLABORADOR']}><IncidentesPage /></PrivateRoute>} />

        <Route path="/epps"          element={<EppsPage />} />

        {/* Rutas SOLO admin / subadmin */}
        <Route path="/colaboradores"
          element={<PrivateRoute roles={['ADMIN', 'SUBADMIN']}><ColaboradoresPage /></PrivateRoute>} />
        <Route path="/empresas"
          element={<PrivateRoute roles={['ADMIN', 'SUBADMIN']}><EmpresasPage /></PrivateRoute>} />
        <Route path="/empresas/:id/dashboard"
          element={<PrivateRoute roles={['ADMIN', 'SUBADMIN']}><EmpresaDashboardPage /></PrivateRoute>} />

        <Route path="/reportes"      element={<ReportesPage />} />

        {/* Mi equipo: solo el dueño EMPRESA y supervisores */}
        <Route path="/mi-equipo"
          element={<PrivateRoute roles={['EMPRESA', 'SUPERVISOR']}><MiEquipoPage /></PrivateRoute>} />

        <Route path="/perfil"        element={<PerfilPage />} />
      </Route>

      {/* Redireccion raiz y 404 → login */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

/* Placeholder temporal para modulos pendientes */
function PlaceholderPage({ title }) {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <p className="text-2xl font-bold text-primary-500">{title}</p>
        <p className="text-sm text-gray-400 mt-2">Modulo en construccion</p>
      </div>
    </div>
  )
}

export default App
