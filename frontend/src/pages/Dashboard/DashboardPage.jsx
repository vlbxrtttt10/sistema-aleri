import { useEffect, useState } from 'react'
import {
  AlertTriangle, HardHat, Users,
  CheckCircle2, XCircle, ClipboardList,
  Activity, Shield, Building2, Globe
} from 'lucide-react'
import KpiCard from '../../components/dashboard/KpiCard.jsx'
import RecentIncidents from '../../components/dashboard/RecentIncidents.jsx'
import EppAlert from '../../components/dashboard/EppAlert.jsx'
import PlanUsage from '../../components/dashboard/PlanUsage.jsx'
import SelectorEmpresa from '../../components/dashboard/SelectorEmpresa.jsx'
import { useTheme } from '../../context/ThemeContext.jsx'
import { isAdmin } from '../../services/session.js'
import api from '../../services/api.js'

/**
 * Construye los KPI cards a partir del resumen real del backend.
 * Se llama después de fetch /api/dashboard/resumen.
 */
function buildKpis(resumen) {
  const r = resumen || {}
  return [
    {
      icon: AlertTriangle,
      label: 'Incidentes este mes',
      value: r.totalIncidentesMes ?? 0,
      trend: 'neutral',
      trendLabel: 'mes en curso',
      color: '#f59e0b',
      gradient: 'from-amber-50 to-orange-50',
      gradientDark: 'from-amber-950/30 to-orange-950/20',
    },
    {
      icon: XCircle,
      label: 'Accidentes este mes',
      value: r.totalAccidentesMes ?? 0,
      trend: 'neutral',
      trendLabel: 'mes en curso',
      color: '#ef4444',
      gradient: 'from-red-50 to-rose-50',
      gradientDark: 'from-red-950/30 to-rose-950/20',
    },
    {
      icon: HardHat,
      label: 'EPPs por vencer',
      value: r.eppsProximosVencer ?? 0,
      trend: 'neutral',
      trendLabel: 'próx. 15 días',
      color: '#8b5cf6',
      gradient: 'from-violet-50 to-purple-50',
      gradientDark: 'from-violet-950/30 to-purple-950/20',
    },
    {
      icon: Users,
      label: 'Colaboradores activos',
      value: r.colaboradoresActivos ?? 0,
      trend: 'neutral',
      trendLabel: 'activos',
      color: '#af2154',
      gradient: 'from-blue-50 to-sky-50',
      gradientDark: 'from-blue-950/30 to-sky-950/20',
    },
    {
      icon: CheckCircle2,
      label: 'Incidentes cerrados',
      value: r.incidentesCerrados ?? 0,
      trend: 'neutral',
      trendLabel: 'histórico',
      color: '#83266d',
      gradient: 'from-green-50 to-emerald-50',
      gradientDark: 'from-green-950/30 to-emerald-950/20',
    },
    {
      icon: ClipboardList,
      label: 'EPPs asignados',
      value: r.eppsAsignados ?? 0,
      trend: 'neutral',
      trendLabel: 'activos',
      color: '#06b6d4',
      gradient: 'from-cyan-50 to-teal-50',
      gradientDark: 'from-cyan-950/30 to-teal-950/20',
    },
  ]
}

export default function DashboardPage() {
  const { dark } = useTheme()
  const esAdmin = isAdmin()

  /* Lista de empresas para el selector y empresa actualmente filtrada (null = global) */
  const [empresas, setEmpresas] = useState([])
  const [empresaId, setEmpresaId] = useState(null)

  /* Resumen del backend */
  const [resumen, setResumen] = useState(null)
  const [cargandoResumen, setCargandoResumen] = useState(true)

  /* Cargar empresas SOLO si el usuario es admin */
  useEffect(() => {
    if (!esAdmin) return
    api.get('/empresas')
      .then(res => setEmpresas(res.data))
      .catch(() => { /* silencioso: el dashboard sigue funcionando con vista global */ })
  }, [esAdmin])

  /* Cargar resumen del dashboard. Si admin selecciona empresa, refresca. */
  useEffect(() => {
    setCargandoResumen(true)
    const params = empresaId ? { empresaId } : {}
    api.get('/dashboard/resumen', { params })
      .then(res => setResumen(res.data))
      .catch(() => setResumen(null))
      .finally(() => setCargandoResumen(false))
  }, [empresaId])

  /* Leer datos del usuario logueado */
  let userName = 'Usuario'
  let userEmpresa = null
  let userPlan = null
  try {
    const u = JSON.parse(localStorage.getItem('aleri-user') || '{}')
    if (u.nombre)        userName    = u.nombre.split(' ')[0]
    if (u.empresaNombre) userEmpresa = u.empresaNombre
    if (u.planNombre)    userPlan    = u.planNombre
  } catch (_) { /* ignore */ }

  const now = new Date()
  const mes = now.toLocaleDateString('es-PE', { month: 'long', year: 'numeric' })

  const empresaSeleccionada = empresas.find(e => e.id === empresaId) || null
  const kpis = buildKpis(resumen)

  /* Etiqueta superior del banner */
  const labelBanner = esAdmin
    ? (empresaSeleccionada ? 'Vista de empresa' : 'Panel del administrador')
    : (userEmpresa || 'Sistema SSOMA')

  const labelIcon = esAdmin
    ? (empresaSeleccionada ? Building2 : Shield)
    : (userEmpresa ? Building2 : Shield)

  /* Texto principal del banner */
  const tituloBanner = esAdmin
    ? (empresaSeleccionada ? empresaSeleccionada.nombre : `Bienvenido, ${userName}`)
    : `Bienvenido, ${userName}`

  /* Subtítulo del banner */
  let subtitleBanner
  if (esAdmin && empresaSeleccionada) {
    subtitleBanner = `RUC ${empresaSeleccionada.ruc} · Plan ${empresaSeleccionada.planNombre}`
  } else if (!esAdmin && userPlan) {
    subtitleBanner = `${mes} · Plan ${userPlan}`
  } else {
    subtitleBanner = `${mes} · Panel de Control`
  }

  return (
    <div className="space-y-6">

      {/* ── Encabezado con banner de bienvenida ── */}
      <div
        className="relative rounded-2xl px-7 py-6"
        style={{
          background: 'linear-gradient(135deg, #af2154 0%, #83266d 50%, #f58227 100%)',
        }}
      >
        {/* Decorativos contenidos en su propio layer recortado */}
        <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #ffffff 0%, transparent 70%)', transform: 'translate(30%, -40%)' }} />
          <div className="absolute bottom-0 left-1/2 w-40 h-40 rounded-full opacity-5"
            style={{ background: 'radial-gradient(circle, #ffffff 0%, transparent 70%)', transform: 'translate(-50%, 40%)' }} />
        </div>

        <div className="relative flex items-center justify-between flex-wrap gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {(() => {
                const Icon = labelIcon
                return <Icon size={16} className="text-white/70" />
              })()}
              <span className="text-white/70 text-xs font-medium uppercase tracking-widest truncate">
                {labelBanner}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white truncate">
              {tituloBanner}
            </h1>
            <p className="text-white/60 text-sm mt-0.5 capitalize">
              {subtitleBanner}
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">

            {/* Selector empresas (solo ADMIN) */}
            {esAdmin && (
              <SelectorEmpresa
                empresas={empresas}
                empresaId={empresaId}
                onChange={setEmpresaId}
              />
            )}

            <div className="px-4 py-2 rounded-xl text-center"
              style={{ backgroundColor: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)' }}>
              <p className="text-white/60 text-[10px] uppercase tracking-wider">Estado</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-white text-sm font-semibold">Operativo</span>
              </div>
            </div>
            <div className="px-4 py-2 rounded-xl text-center"
              style={{ backgroundColor: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)' }}>
              <p className="text-white/60 text-[10px] uppercase tracking-wider">Incidentes</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Activity size={14} className="text-amber-300" />
                <span className="text-white text-sm font-semibold">
                  {resumen?.totalIncidentesMes ?? 0} este mes
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Aviso visible cuando hay filtro activo */}
      {esAdmin && empresaSeleccionada && (
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm"
          style={{
            backgroundColor: dark ? '#1e293b' : '#fceef4',
            border: `1px solid ${dark ? '#334155' : '#f6ccdc'}`,
            color: dark ? '#f1f5f9' : '#83266d',
          }}>
          <Building2 size={15} style={{ color: '#af2154' }} />
          <span className="flex-1">
            Mostrando datos de <strong>{empresaSeleccionada.nombre}</strong>
          </span>
          <button onClick={() => setEmpresaId(null)}
            className="text-xs font-semibold flex items-center gap-1 hover:opacity-80 transition-opacity"
            style={{ color: '#af2154' }}>
            <Globe size={13} /> Volver a vista global
          </button>
        </div>
      )}

      {/* ── KPI Grid ── */}
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-widest mb-3"
          style={{ color: dark ? '#64748b' : '#9ca3af' }}>
          Indicadores clave
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {kpis.map((k) => (
            <KpiCard key={k.label} {...k}
              value={cargandoResumen ? '--' : k.value}
              dark={dark} />
          ))}
        </div>
      </div>

      {/* ── Sección inferior ── */}
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-widest mb-3"
          style={{ color: dark ? '#64748b' : '#9ca3af' }}>
          Actividad reciente
        </h2>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="xl:col-span-2">
            <RecentIncidents dark={dark} />
          </div>
          <div className="space-y-4">
            <EppAlert dark={dark} />
            <PlanUsage dark={dark} resumen={resumen}
              empresaSeleccionada={empresaSeleccionada}
              esAdmin={esAdmin}
              loading={cargandoResumen} />
          </div>
        </div>
      </div>

    </div>
  )
}
