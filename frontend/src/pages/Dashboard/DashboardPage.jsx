import { useEffect, useState } from 'react'
import {
  AlertTriangle, HardHat, Users,
  Activity, Shield, Building2, Globe
} from 'lucide-react'
import RecentIncidents from '../../components/dashboard/RecentIncidents.jsx'
import EppAlert from '../../components/dashboard/EppAlert.jsx'
import PlanUsage from '../../components/dashboard/PlanUsage.jsx'
import SelectorEmpresa from '../../components/dashboard/SelectorEmpresa.jsx'
import { useTheme } from '../../context/ThemeContext.jsx'
import { isAdmin } from '../../services/session.js'
import api from '../../services/api.js'

/* ── Gráfico de dona SVG ──────────────────────────────────────────── */
function DonaChart({ segments, size = 120, stroke = 18, label, sublabel, dark }) {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const cx = size / 2
  const cy = size / 2

  const total = segments.reduce((s, seg) => s + seg.value, 0)
  let offset = 0
  const arcs = segments.map(seg => {
    const frac = total > 0 ? seg.value / total : 0
    const dash = frac * circ
    const arc = { ...seg, dash, gap: circ - dash, offset }
    offset += dash
    return arc
  })

  const textColor = dark ? '#f1f5f9' : '#111827'
  const subColor  = dark ? '#64748b' : '#9ca3af'

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          {/* Track */}
          <circle cx={cx} cy={cy} r={r} fill="none"
            stroke={dark ? '#1e293b' : '#f1f5f9'} strokeWidth={stroke} />
          {/* Segments */}
          {arcs.map((arc, i) => (
            <circle key={i} cx={cx} cy={cy} r={r} fill="none"
              stroke={arc.color} strokeWidth={stroke}
              strokeDasharray={`${arc.dash} ${arc.gap}`}
              strokeDashoffset={-arc.offset}
              strokeLinecap="butt"
              style={{ transition: 'stroke-dasharray 0.6s ease' }}
            />
          ))}
        </svg>
        {/* Centro */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-extrabold leading-none" style={{ color: textColor }}>
            {label}
          </span>
          <span className="text-[10px] font-medium mt-0.5" style={{ color: subColor }}>
            {sublabel}
          </span>
        </div>
      </div>
    </div>
  )
}

/* ── Barras horizontales SVG ──────────────────────────────────────── */
function BarChart({ bars, dark }) {
  const max = Math.max(...bars.map(b => b.value), 1)
  const labelColor = dark ? '#94a3b8' : '#6b7280'
  const trackColor = dark ? '#1e293b' : '#f1f5f9'

  return (
    <div className="flex flex-col gap-3 w-full">
      {bars.map((bar, i) => (
        <div key={i} className="flex flex-col gap-1">
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium" style={{ color: labelColor }}>{bar.label}</span>
            <span className="text-xs font-bold tabular-nums" style={{ color: bar.color }}>{bar.value}</span>
          </div>
          <div className="h-2 rounded-full w-full" style={{ backgroundColor: trackColor }}>
            <div
              className="h-2 rounded-full transition-all duration-700"
              style={{
                width: `${(bar.value / max) * 100}%`,
                backgroundColor: bar.color,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

/* ── Tarjeta gráfica genérica ─────────────────────────────────────── */
function ChartCard({ title, icon: Icon, iconColor, children, dark, badge }) {
  const cardBg     = dark ? '#0f172a' : '#ffffff'
  const cardBorder = dark ? '#1e293b' : '#f1f5f9'
  const titleColor = dark ? '#f1f5f9' : '#111827'
  const subColor   = dark ? '#475569' : '#d1d5db'

  return (
    <div
      className="rounded-2xl border p-5 flex flex-col gap-4 transition-all duration-200 hover:shadow-lg"
      style={{ backgroundColor: cardBg, borderColor: cardBorder, boxShadow: dark ? '0 1px 3px rgba(0,0,0,0.4)' : '0 1px 3px rgba(0,0,0,0.06)' }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${iconColor}18` }}>
            <Icon size={16} style={{ color: iconColor }} />
          </div>
          <span className="text-sm font-semibold" style={{ color: titleColor }}>{title}</span>
        </div>
        {badge && (
          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
            style={{ backgroundColor: `${iconColor}15`, color: iconColor }}>
            {badge}
          </span>
        )}
      </div>
      <div className="h-px" style={{ backgroundColor: subColor }} />
      {children}
    </div>
  )
}

/* ── Leyenda de dona ──────────────────────────────────────────────── */
function Leyenda({ items, dark }) {
  const labelColor = dark ? '#94a3b8' : '#6b7280'
  return (
    <div className="flex flex-col gap-2 w-full">
      {items.map((item, i) => (
        <div key={i} className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
            <span className="text-xs" style={{ color: labelColor }}>{item.label}</span>
          </div>
          <span className="text-xs font-bold tabular-nums" style={{ color: item.color }}>{item.value}</span>
        </div>
      ))}
    </div>
  )
}

/* ── Gráfico de líneas SVG ────────────────────────────────────────── */
function LineChart({ puntos, color, dark, height = 80 }) {
  const w = 260, h = height
  const pad = { top: 8, bottom: 20, left: 28, right: 8 }
  const iw = w - pad.left - pad.right
  const ih = h - pad.top - pad.bottom

  if (!puntos || puntos.length < 2) {
    return (
      <div className="flex items-center justify-center" style={{ height: h }}>
        <span className="text-xs" style={{ color: dark ? '#475569' : '#cbd5e1' }}>Sin datos</span>
      </div>
    )
  }

  const maxVal = Math.max(...puntos.map(p => p.v), 1)
  const xs = puntos.map((_, i) => pad.left + (i / (puntos.length - 1)) * iw)
  const ys = puntos.map(p => pad.top + ih - (p.v / maxVal) * ih)

  const linePath = xs.map((x, i) => `${i === 0 ? 'M' : 'L'}${x},${ys[i]}`).join(' ')
  const areaPath = `${linePath} L${xs[xs.length-1]},${pad.top+ih} L${xs[0]},${pad.top+ih} Z`

  const gridColor = dark ? '#1e293b' : '#f1f5f9'
  const labelColor = dark ? '#475569' : '#cbd5e1'

  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} style={{ overflow: 'visible' }}>
      {/* Grid lines */}
      {[0, 0.5, 1].map((frac, i) => (
        <line key={i}
          x1={pad.left} y1={pad.top + ih * (1 - frac)}
          x2={pad.left + iw} y2={pad.top + ih * (1 - frac)}
          stroke={gridColor} strokeWidth={1} />
      ))}
      {/* Area fill */}
      <defs>
        <linearGradient id={`lg-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#lg-${color.replace('#','')})`} />
      {/* Line */}
      <path d={linePath} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
      {/* Puntos */}
      {xs.map((x, i) => (
        <circle key={i} cx={x} cy={ys[i]} r={3} fill={color} stroke={dark ? '#0f172a' : '#fff'} strokeWidth={1.5} />
      ))}
      {/* Labels eje X */}
      {puntos.map((p, i) => (
        <text key={i} x={xs[i]} y={h - 4} textAnchor="middle"
          fontSize={8} fill={labelColor}>{p.label}</text>
      ))}
      {/* Labels eje Y */}
      {[0, maxVal].map((v, i) => (
        <text key={i} x={pad.left - 4}
          y={i === 0 ? pad.top + ih + 2 : pad.top + 4}
          textAnchor="end" fontSize={8} fill={labelColor}>{v}</text>
      ))}
    </svg>
  )
}

/* ── Mini stat inline ─────────────────────────────────────────────── */
function MiniStat({ label, value, color, dark }) {
  const sub = dark ? '#475569' : '#e2e8f0'
  const lbl = dark ? '#64748b' : '#9ca3af'
  return (
    <div className="flex flex-col items-center gap-1 px-4 py-3 rounded-xl" style={{ backgroundColor: sub }}>
      <span className="text-2xl font-extrabold tabular-nums leading-none" style={{ color }}>{value}</span>
      <span className="text-[10px] font-medium text-center leading-tight" style={{ color: lbl }}>{label}</span>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════ */
export default function DashboardPage() {
  const { dark } = useTheme()
  const esAdmin = isAdmin()

  const [empresas,       setEmpresas]       = useState([])
  const [empresaId,      setEmpresaId]      = useState(null)
  const [resumen,        setResumen]        = useState(null)
  const [cargando,       setCargando]       = useState(true)
  const [puntosVenc,     setPuntosVenc]     = useState([])

  useEffect(() => {
    if (!esAdmin) return
    api.get('/empresas').then(res => setEmpresas(res.data)).catch(() => {})
  }, [esAdmin])

  useEffect(() => {
    setCargando(true)
    const params = empresaId ? { empresaId } : {}
    api.get('/dashboard/resumen', { params })
      .then(res => setResumen(res.data))
      .catch(() => setResumen(null))
      .finally(() => setCargando(false))

    // Cargar asignaciones para construir línea de vencimientos
    const eppParams = empresaId ? `?empresaId=${empresaId}` : ''
    api.get(`/epps/asignaciones${eppParams}`)
      .then(res => {
        const asigs = res.data || []
        // Agrupar por mes de vencimiento (próximos 6 meses)
        const now = new Date()
        const meses = Array.from({ length: 6 }, (_, i) => {
          const d = new Date(now.getFullYear(), now.getMonth() + i, 1)
          return {
            key: `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`,
            label: d.toLocaleDateString('es-PE', { month: 'short' }),
            v: 0
          }
        })
        asigs.forEach(a => {
          if (!a.fechaVencimiento || !a.activo) return
          const key = a.fechaVencimiento.slice(0, 7)
          const m = meses.find(m => m.key === key)
          if (m) m.v++
        })
        setPuntosVenc(meses)
      })
      .catch(() => setPuntosVenc([]))
  }, [empresaId])

  let userName = 'Usuario', userEmpresa = null, userPlan = null
  try {
    const u = JSON.parse(localStorage.getItem('aleri-user') || '{}')
    if (u.nombre)        userName    = u.nombre.split(' ')[0]
    if (u.empresaNombre) userEmpresa = u.empresaNombre
    if (u.planNombre)    userPlan    = u.planNombre
  } catch (_) {}

  const now = new Date()
  const mes = now.toLocaleDateString('es-PE', { month: 'long', year: 'numeric' })

  const empresaSeleccionada = empresas.find(e => e.id === empresaId) || null

  const r = resumen || {}
  const totalInc   = r.totalIncidentesMes   ?? 0
  const totalAcc   = r.totalAccidentesMes   ?? 0
  const cerrados   = r.incidentesCerrados   ?? 0
  const eppsVencer = r.eppsProximosVencer   ?? 0
  const eppsAsig   = r.eppsAsignados        ?? 0
  const colabs     = r.colaboradoresActivos ?? 0

  /* Segmentos dona incidentes */
  const abiertos = Math.max(totalInc - cerrados, 0)
  const donaIncidentes = [
    { label: 'Cerrados',   value: cerrados, color: '#22c55e' },
    { label: 'Abiertos',   value: abiertos, color: '#f59e0b' },
    { label: 'Accidentes', value: totalAcc, color: '#ef4444' },
  ]

  /* Barras EPPs */
  const barrasEpp = [
    { label: 'EPPs asignados',    value: eppsAsig,   color: '#af2154' },
    { label: 'Próx. a vencer',    value: eppsVencer, color: '#f58227' },
  ]

  const labelBanner   = esAdmin ? (empresaSeleccionada ? 'Vista de empresa' : 'Panel del administrador') : (userEmpresa || 'Sistema SSOMA')
  const labelIcon     = esAdmin ? (empresaSeleccionada ? Building2 : Shield) : (userEmpresa ? Building2 : Shield)
  const tituloBanner  = esAdmin ? (empresaSeleccionada ? empresaSeleccionada.nombre : `Bienvenido, ${userName}`) : `Bienvenido, ${userName}`
  let subtitleBanner
  if (esAdmin && empresaSeleccionada) {
    subtitleBanner = `RUC ${empresaSeleccionada.ruc} · Plan ${empresaSeleccionada.planNombre}`
  } else if (!esAdmin && userPlan) {
    subtitleBanner = `${mes} · Plan ${userPlan}`
  } else {
    subtitleBanner = `${mes} · Panel de Control`
  }

  const subColor = dark ? '#64748b' : '#9ca3af'

  return (
    <div className="space-y-6">

      {/* ── Banner ── */}
      <div className="relative rounded-2xl px-7 py-6"
        style={{ background: 'linear-gradient(135deg, #af2154 0%, #83266d 50%, #f58227 100%)' }}>
        <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #ffffff 0%, transparent 70%)', transform: 'translate(30%, -40%)' }} />
          <div className="absolute bottom-0 left-1/2 w-40 h-40 rounded-full opacity-5"
            style={{ background: 'radial-gradient(circle, #ffffff 0%, transparent 70%)', transform: 'translate(-50%, 40%)' }} />
        </div>
        <div className="relative flex items-center justify-between flex-wrap gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {(() => { const Icon = labelIcon; return <Icon size={16} className="text-white/70" /> })()}
              <span className="text-white/70 text-xs font-medium uppercase tracking-widest truncate">{labelBanner}</span>
            </div>
            <h1 className="text-2xl font-bold text-white truncate">{tituloBanner}</h1>
            <p className="text-white/60 text-sm mt-0.5 capitalize">{subtitleBanner}</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {esAdmin && (
              <SelectorEmpresa empresas={empresas} empresaId={empresaId} onChange={setEmpresaId} />
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
                <span className="text-white text-sm font-semibold">{totalInc} este mes</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Aviso filtro activo */}
      {esAdmin && empresaSeleccionada && (
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm"
          style={{ backgroundColor: dark ? '#1e293b' : '#fceef4', border: `1px solid ${dark ? '#334155' : '#f6ccdc'}`, color: dark ? '#f1f5f9' : '#83266d' }}>
          <Building2 size={15} style={{ color: '#af2154' }} />
          <span className="flex-1">Mostrando datos de <strong>{empresaSeleccionada.nombre}</strong></span>
          <button onClick={() => setEmpresaId(null)}
            className="text-xs font-semibold flex items-center gap-1 hover:opacity-80 transition-opacity"
            style={{ color: '#af2154' }}>
            <Globe size={13} /> Volver a vista global
          </button>
        </div>
      )}

      {/* ── Sección de gráficos ── */}
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: subColor }}>
          Indicadores clave
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">

          {/* 1. Dona — Incidentes */}
          <ChartCard title="Incidentes" icon={AlertTriangle} iconColor="#f59e0b"
            dark={dark} badge={`${totalInc} este mes`}>
            {cargando ? (
              <div className="flex justify-center py-6">
                <div className="w-24 h-24 rounded-full border-4 animate-pulse" style={{ borderColor: dark ? '#1e293b' : '#f1f5f9' }} />
              </div>
            ) : (
              <div className="flex items-center justify-between gap-4">
                <DonaChart
                  segments={donaIncidentes.filter(s => s.value > 0).length > 0
                    ? donaIncidentes
                    : [{ label: 'Sin datos', value: 1, color: dark ? '#1e293b' : '#e2e8f0' }]}
                  label={totalInc}
                  sublabel="total"
                  dark={dark}
                  size={110}
                  stroke={16}
                />
                <Leyenda items={donaIncidentes} dark={dark} />
              </div>
            )}
          </ChartCard>

          {/* 2. Barras — EPPs */}
          <ChartCard title="Equipos de Protección" icon={HardHat} iconColor="#af2154"
            dark={dark} badge={`${eppsAsig} asignados`}>
            {cargando ? (
              <div className="space-y-3 py-2">
                {[1,2].map(i => (
                  <div key={i} className="h-6 rounded animate-pulse" style={{ backgroundColor: dark ? '#1e293b' : '#f1f5f9' }} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <BarChart bars={barrasEpp} dark={dark} />
                <div className="flex gap-2">
                  <MiniStat label="Asignados"    value={eppsAsig}   color="#af2154" dark={dark} />
                  <MiniStat label="Por vencer"   value={eppsVencer} color="#f58227" dark={dark} />
                </div>
              </div>
            )}
          </ChartCard>

          {/* 3. Dona — Colaboradores vs Supervisores */}
          <ChartCard title="Equipo" icon={Users} iconColor="#83266d"
            dark={dark} badge={`${colabs} activos`}>
            {cargando ? (
              <div className="flex justify-center py-6">
                <div className="w-24 h-24 rounded-full border-4 animate-pulse" style={{ borderColor: dark ? '#1e293b' : '#f1f5f9' }} />
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between gap-4">
                  <DonaChart
                    segments={colabs > 0
                      ? [
                          { label: 'Colaboradores', value: colabs,                        color: '#83266d' },
                          { label: 'Supervisores',  value: resumen?.supervisoresUsados ?? 0, color: '#af2154' },
                        ]
                      : [{ label: 'Sin datos', value: 1, color: dark ? '#1e293b' : '#e2e8f0' }]}
                    label={colabs}
                    sublabel="colaboradores"
                    dark={dark}
                    size={110}
                    stroke={16}
                  />
                  <Leyenda items={[
                    { label: 'Colaboradores', value: colabs,                            color: '#83266d' },
                    { label: 'Supervisores',  value: resumen?.supervisoresUsados ?? 0, color: '#af2154' },
                    { label: 'Inc. cerrados', value: cerrados,                          color: '#22c55e' },
                  ]} dark={dark} />
                </div>
              </div>
            )}
          </ChartCard>

          {/* 4. Línea — Vencimientos próximos 6 meses */}
          <ChartCard title="Vencimientos" icon={AlertTriangle} iconColor="#f58227"
            dark={dark} badge={`próx. 6 meses`}>
            {cargando ? (
              <div className="h-20 rounded animate-pulse" style={{ backgroundColor: dark ? '#1e293b' : '#f1f5f9' }} />
            ) : (
              <div className="flex flex-col gap-3">
                <LineChart puntos={puntosVenc} color="#f58227" dark={dark} height={90} />
                <div className="flex justify-between">
                  <MiniStat label="Este mes"   value={puntosVenc[0]?.v ?? 0} color="#f58227" dark={dark} />
                  <MiniStat label="Próx. mes"  value={puntosVenc[1]?.v ?? 0} color="#af2154" dark={dark} />
                </div>
              </div>
            )}
          </ChartCard>

        </div>
      </div>

      {/* ── Actividad reciente ── */}
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: subColor }}>
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
              loading={cargando} />
          </div>
        </div>
      </div>

    </div>
  )
}
