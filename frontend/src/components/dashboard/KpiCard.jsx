import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

export default function KpiCard({ icon: Icon, label, value, unit = '', trend, trendLabel, color, dark }) {
  const cardBg     = dark ? '#1e293b' : '#ffffff'
  const cardBorder = dark ? '#334155' : '#f1f5f9'
  const labelColor = dark ? '#94a3b8' : '#6b7280'
  const valueColor = dark ? '#f1f5f9' : '#111827'

  const trendColor =
    trend === 'up'   ? '#22c55e' :
    trend === 'down' ? '#ef4444' : '#94a3b8'

  const TrendIcon =
    trend === 'up'   ? TrendingUp :
    trend === 'down' ? TrendingDown : Minus

  return (
    <div
      className="rounded-2xl border shadow-sm flex flex-col gap-4 overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
      style={{ backgroundColor: cardBg, borderColor: cardBorder }}
    >
      {/* Barra de color superior */}
      <div className="h-1 w-full" style={{ backgroundColor: color }} />

      <div className="px-5 pb-5 flex flex-col gap-4">
        {/* Icono + trend */}
        <div className="flex items-center justify-between">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${color}18` }}
          >
            <Icon size={21} style={{ color }} />
          </div>
          <div
            className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full"
            style={{ backgroundColor: `${trendColor}15`, color: trendColor }}
          >
            <TrendIcon size={11} />
            <span>{trendLabel}</span>
          </div>
        </div>

        {/* Valor + label */}
        <div>
          <p className="text-3xl font-extrabold leading-none tracking-tight" style={{ color: valueColor }}>
            {value}
            {unit && <span className="text-base font-semibold ml-1" style={{ color: labelColor }}>{unit}</span>}
          </p>
          <p className="text-sm mt-1.5 font-medium" style={{ color: labelColor }}>{label}</p>
        </div>
      </div>
    </div>
  )
}
