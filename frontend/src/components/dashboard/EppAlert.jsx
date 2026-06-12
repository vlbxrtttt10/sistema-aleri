import { AlertCircle, Clock, HardHat } from 'lucide-react'

const epps = []

function urgency(dias) {
  if (dias <= 5)  return { bg: '#fee2e2', bgDark: '#450a0a', color: '#dc2626', colorDark: '#fca5a5', label: 'Crítico' }
  if (dias <= 10) return { bg: '#fff7ed', bgDark: '#431407', color: '#ea580c', colorDark: '#fdba74', label: 'Próximo' }
  return              { bg: '#fef9c3', bgDark: '#422006', color: '#ca8a04', colorDark: '#fcd34d', label: 'Alerta' }
}

export default function EppAlert({ dark }) {
  const cardBg     = dark ? '#1e293b' : '#ffffff'
  const cardBorder = dark ? '#334155' : '#f1f5f9'
  const titleColor = dark ? '#f1f5f9' : '#111827'
  const subColor   = dark ? '#64748b' : '#9ca3af'
  const nameColor  = dark ? '#e2e8f0' : '#1e293b'
  const areaColor  = dark ? '#64748b' : '#94a3b8'
  const rowBorder  = dark ? '#334155' : '#f1f5f9'

  return (
    <div
      className="rounded-2xl border shadow-sm overflow-hidden transition-all duration-300"
      style={{ backgroundColor: cardBg, borderColor: cardBorder }}
    >
      {/* Header */}
      <div className="px-6 py-4 flex items-center justify-between border-b" style={{ borderColor: cardBorder }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: dark ? '#431407' : '#fff7ed' }}>
            <HardHat size={17} style={{ color: '#ea580c' }} />
          </div>
          <div>
            <p className="font-semibold text-sm" style={{ color: titleColor }}>EPPs por Vencer</p>
            <p className="text-xs mt-0.5" style={{ color: subColor }}>Próximos 15 días</p>
          </div>
        </div>
        <div
          className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg"
          style={{ backgroundColor: dark ? '#431407' : '#fff7ed', color: '#ea580c' }}
        >
          <AlertCircle size={13} />
          <span>{epps.length} alertas</span>
        </div>
      </div>

      {/* Lista */}
      <div>
        {epps.length === 0 ? (
          <p className="px-6 py-8 text-sm text-center" style={{ color: subColor }}>
            Sin alertas por ahora
          </p>
        ) : epps.map((e, i) => {
          const u = urgency(e.dias)
          return (
            <div
              key={i}
              className="px-6 py-3.5 flex items-center justify-between gap-4 border-t"
              style={{ borderColor: rowBorder }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: dark ? u.bgDark : u.bg }}
                >
                  <Clock size={15} style={{ color: dark ? u.colorDark : u.color }} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: nameColor }}>{e.nombre}</p>
                  <p className="text-xs truncate" style={{ color: areaColor }}>
                    {e.colaborador} · {e.area}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <span className="text-xs font-bold" style={{ color: dark ? u.colorDark : u.color }}>
                  {e.dias}d
                </span>
                <span
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-md"
                  style={{ backgroundColor: dark ? u.bgDark : u.bg, color: dark ? u.colorDark : u.color }}
                >
                  {u.label}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
