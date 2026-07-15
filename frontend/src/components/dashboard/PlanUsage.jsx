import { Crown, Zap, Shield, Star } from 'lucide-react'

/**
 * Datos de la card "Uso del Plan".
 *
 * Fuentes:
 *  - empresaSeleccionada (admin)  → de /api/empresas → planNombre confiable.
 *  - resumen (todos)              → de /api/dashboard/resumen → contadores.
 *  - localStorage (no admin)      → planNombre del propio usuario logueado.
 *
 * Esto asegura que el plan mostrado en este card SIEMPRE coincida con el
 * plan mostrado arriba en el banner, sin depender del string que el backend
 * devuelva en `resumen.planNombre`.
 */

const PLAN_META = {
  BASICO:  { label: 'Plan Básico', icon: Shield, color: '#6b7280' },
  VIP:     { label: 'Plan VIP',    icon: Crown,  color: '#af2154' },
  ALERI:   { label: 'Plan ALERI',  icon: Star,   color: '#83266d' },
}

const META_GLOBAL = { label: 'Vista global', icon: Zap, color: '#f58227' }

function Bar({ label, used, total, color, dark }) {
  const ilimitado = total === null || total === undefined
  const pct = ilimitado
    ? (used > 0 ? Math.min(used * 5, 100) : 100) // barra llena en gradiente decorativo
    : Math.min(Math.round((used / total) * 100), 100)

  const trackBg   = dark ? '#334155' : '#e2e8f0'
  const textColor = dark ? '#94a3b8' : '#6b7280'
  const valColor  = dark ? '#e2e8f0' : '#1e293b'
  const warn      = !ilimitado && pct >= 80

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs">
        <span style={{ color: textColor }}>{label}</span>
        {ilimitado ? (
          <span className="inline-flex items-center gap-1 font-semibold uppercase tracking-wider text-[11px] px-2 py-0.5 rounded-full"
            style={{
              background: 'linear-gradient(90deg, #af2154 0%, #f58227 100%)',
              color: '#ffffff',
            }}>
            ∞ Ilimitado
          </span>
        ) : (
          <span className="font-semibold" style={{ color: warn ? '#ef4444' : valColor }}>
            {used} / {total}
          </span>
        )}
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: trackBg }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${pct}%`,
            background: ilimitado
              ? `linear-gradient(90deg, ${color} 0%, #f58227 100%)`
              : (warn ? '#ef4444' : color),
          }}
        />
      </div>
    </div>
  )
}

export default function PlanUsage({ dark, resumen, empresaSeleccionada, esAdmin, loading }) {
  const cardBg     = dark ? '#1e293b' : '#ffffff'
  const cardBorder = dark ? '#334155' : '#f1f5f9'
  const titleColor = dark ? '#f1f5f9' : '#111827'
  const subColor   = dark ? '#64748b' : '#9ca3af'

  /* Resolver plan según la fuente más fiable disponible */
  let planNombre = null
  if (esAdmin) {
    // Admin: usa la empresa elegida en el selector. Sin selector = vista global.
    planNombre = empresaSeleccionada?.planNombre || null
  } else {
    // Usuario normal: lee el plan de su propia sesión
    try {
      const u = JSON.parse(localStorage.getItem('aleri-user') || '{}')
      planNombre = u.planNombre || null
    } catch (_) { /* ignore */ }
  }

  const esGlobal = esAdmin && !empresaSeleccionada
  const meta     = esGlobal ? META_GLOBAL : (PLAN_META[planNombre] || { label: '—', icon: Zap, color: '#6b7280' })
  const PlanIcon = meta.icon

  /* Para los límites: ALERI o vista global → ilimitado (null).
     Para BASICO/VIP usamos el max que vino del backend; si por algún motivo no vino,
     usamos los conocidos por código (BASICO=3, VIP=5). */
  const supUsados   = resumen?.supervisoresUsados   ?? 0
  const colabUsados = resumen?.colaboradoresUsados  ?? 0
  const incMes      = resumen?.totalIncidentesMes   ?? 0

  let supMax
  let colabMax
  if (esGlobal || planNombre === 'ALERI') {
    supMax   = null
    colabMax = null
  } else if (planNombre === 'BASICO') {
    supMax   = resumen?.supervisoresMaximo ?? 3
    colabMax = resumen?.colaboradoresMaximo ?? 3
  } else if (planNombre === 'VIP') {
    supMax   = resumen?.supervisoresMaximo ?? 5
    colabMax = resumen?.colaboradoresMaximo ?? 5
  } else {
    supMax   = resumen?.supervisoresMaximo ?? null
    colabMax = resumen?.colaboradoresMaximo ?? null
  }

  return (
    <div
      className="rounded-2xl border shadow-sm p-6 transition-all duration-300"
      style={{ backgroundColor: cardBg, borderColor: cardBorder }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${meta.color}22` }}>
            <Zap size={17} style={{ color: meta.color }} />
          </div>
          <div>
            <p className="font-semibold text-sm" style={{ color: titleColor }}>Uso del Plan</p>
            <p className="text-xs mt-0.5" style={{ color: subColor }}>
              {esGlobal
                ? 'Toda la plataforma'
                : (empresaSeleccionada?.nombre || 'Empresa actual')}
            </p>
          </div>
        </div>
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
          style={{ backgroundColor: `${meta.color}20`, color: meta.color }}
        >
          <PlanIcon size={13} />
          {meta.label}
        </div>
      </div>

      {/* Barras */}
      <div className="space-y-4">
        {loading ? (
          <p className="text-xs text-center py-2" style={{ color: subColor }}>Cargando...</p>
        ) : (
          <>
            <Bar label="Supervisores"   used={supUsados}   total={supMax}   color={meta.color} dark={dark} />
            <Bar label="Colaboradores"  used={colabUsados} total={colabMax} color="#83266d"    dark={dark} />
            <Bar label="Incidentes mes" used={incMes}      total={null}     color="#f59e0b"    dark={dark} />
          </>
        )}
      </div>

      {/* Hint inferior */}
      {!loading && (
        <div
          className="mt-5 p-3 rounded-xl text-xs text-center"
          style={{ backgroundColor: dark ? '#0f172a' : '#f8fafc', color: subColor }}
        >
          {planNombre === 'ALERI' || esGlobal ? (
            <>Plan con recursos <span className="font-bold" style={{ color: '#83266d' }}>ilimitados</span></>
          ) : (
            <>Para más capacidad activa el plan{' '}
            <span className="font-bold" style={{ color: '#83266d' }}>ALERI</span></>
          )}
        </div>
      )}
    </div>
  )
}
