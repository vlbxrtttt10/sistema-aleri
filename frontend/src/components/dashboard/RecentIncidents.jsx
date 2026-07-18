import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText } from 'lucide-react'
import api from '../../services/api.js'
import { isAdmin } from '../../services/session.js'

const TIPO_CFG = {
  INCIDENTE:               { label: 'Incidente',     bg: '#dbeafe', color: '#1e40af', bgDark: '#172554', colorDark: '#93c5fd' },
  ACCIDENTE_LEVE:          { label: 'Leve',           bg: '#fef9c3', color: '#854d0e', bgDark: '#422006', colorDark: '#fcd34d' },
  ACCIDENTE_INCAPACITANTE: { label: 'Incapacitante',  bg: '#fee2e2', color: '#991b1b', bgDark: '#450a0a', colorDark: '#fca5a5' },
  ACCIDENTE_MORTAL:        { label: 'Mortal',         bg: '#f3e8ff', color: '#6b21a8', bgDark: '#2e1065', colorDark: '#d8b4fe' },
}

const ESTADO_CFG = {
  REGISTRADO:       { label: 'Registrado',       bg: '#f0fdf4', color: '#166534', bgDark: '#052e16', colorDark: '#86efac' },
  EN_INVESTIGACION: { label: 'En investigación', bg: '#fff7ed', color: '#9a3412', bgDark: '#431407', colorDark: '#fdba74' },
  CERRADO:          { label: 'Cerrado',          bg: '#f1f5f9', color: '#475569', bgDark: '#1e293b', colorDark: '#94a3b8' },
}

export default function RecentIncidents({ dark }) {
  const navigate = useNavigate()
  const esAdmin = isAdmin()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/incidentes')
      .then(res => setRows((res.data || []).slice(0, 5)))
      .catch(() => setRows([]))
      .finally(() => setLoading(false))
  }, [])

  const cardBg     = dark ? '#1e293b' : '#ffffff'
  const cardBorder = dark ? '#334155' : '#f1f5f9'
  const titleColor = dark ? '#f1f5f9' : '#111827'
  const subColor   = dark ? '#64748b' : '#9ca3af'
  const headBg     = dark ? '#0f172a' : '#f8fafc'
  const headColor  = dark ? '#64748b' : '#9ca3af'
  const rowBorder  = dark ? '#334155' : '#f1f5f9'
  const rowText    = dark ? '#cbd5e1' : '#374151'
  const idColor    = dark ? '#60a5fa' : '#af2154'

  const columnas = esAdmin
    ? ['Código', 'Tipo', 'Empresa', 'Área', 'Fecha', 'Estado']
    : ['Código', 'Tipo', 'Área', 'Fecha', 'Estado']

  return (
    <div
      className="rounded-2xl border shadow-sm overflow-hidden transition-all duration-300"
      style={{ backgroundColor: cardBg, borderColor: cardBorder }}
    >
      {/* Header */}
      <div className="px-6 py-4 flex items-center justify-between border-b" style={{ borderColor: cardBorder }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: dark ? '#0f172a' : '#eff6ff' }}>
            <FileText size={17} style={{ color: '#af2154' }} />
          </div>
          <div>
            <p className="font-semibold text-sm" style={{ color: titleColor }}>Incidentes Recientes</p>
            <p className="text-xs mt-0.5" style={{ color: subColor }}>Últimos 5 registros</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/incidentes')}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
          style={{
            backgroundColor: dark ? '#0f172a' : '#eff6ff',
            color: '#af2154',
          }}
        >
          Ver todos →
        </button>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ backgroundColor: headBg }}>
              {columnas.map(h => (
                <th
                  key={h}
                  className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider"
                  style={{ color: headColor }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columnas.length} className="px-5 py-10 text-center text-sm" style={{ color: subColor }}>
                  Cargando...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={columnas.length} className="px-5 py-10 text-center text-sm" style={{ color: subColor }}>
                  Sin registros aún
                </td>
              </tr>
            ) : rows.map((r) => {
              const t = TIPO_CFG[r.tipo] || { label: r.tipo, bg: '#f1f5f9', color: '#64748b', bgDark: '#1e293b', colorDark: '#94a3b8' }
              const s = ESTADO_CFG[r.estado] || { label: r.estado, bg: '#f1f5f9', color: '#64748b', bgDark: '#1e293b', colorDark: '#94a3b8' }
              return (
                <tr
                  key={r.id}
                  className="border-t transition-colors"
                  style={{ borderColor: rowBorder, backgroundColor: 'transparent' }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = dark ? '#334155' : '#f8fafc'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <td className="px-5 py-3.5 font-mono text-xs font-bold" style={{ color: idColor }}>{r.codigo}</td>
                  <td className="px-5 py-3.5">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-semibold"
                      style={{ backgroundColor: dark ? t.bgDark : t.bg, color: dark ? t.colorDark : t.color }}>
                      {t.label}
                    </span>
                  </td>
                  {esAdmin && (
                    <td className="px-5 py-3.5 text-xs font-medium" style={{ color: rowText }}>{r.empresaNombre || '—'}</td>
                  )}
                  <td className="px-5 py-3.5 text-xs" style={{ color: rowText }}>{r.area || '—'}</td>
                  <td className="px-5 py-3.5 text-xs tabular-nums" style={{ color: rowText }}>
                    {r.fechaOcurrencia
                      ? new Date(r.fechaOcurrencia).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })
                      : '—'}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-semibold"
                      style={{ backgroundColor: dark ? s.bgDark : s.bg, color: dark ? s.colorDark : s.color }}>
                      {s.label}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
