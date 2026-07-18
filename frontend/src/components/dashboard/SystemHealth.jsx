import { useEffect, useState } from 'react'
import axios from 'axios'
import { Activity, CheckCircle2, XCircle, Database, Loader2 } from 'lucide-react'

const INTERVALO_MS = 15000

export default function SystemHealth({ dark }) {
  const [estado, setEstado] = useState(null) // 'UP' | 'DOWN' | null (cargando)
  const [dbEstado, setDbEstado] = useState(null)
  const [ultimaRevision, setUltimaRevision] = useState(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let activo = true

    const revisar = () => {
      axios.get('/actuator/health')
        .then(res => {
          if (!activo) return
          setEstado(res.data.status || 'UP')
          const db = res.data.components?.db?.status
          setDbEstado(db || null)
          setUltimaRevision(new Date())
          setError(false)
        })
        .catch(() => {
          if (!activo) return
          setEstado('DOWN')
          setDbEstado(null)
          setUltimaRevision(new Date())
          setError(true)
        })
    }

    revisar()
    const id = setInterval(revisar, INTERVALO_MS)
    return () => { activo = false; clearInterval(id) }
  }, [])

  const cardBg     = dark ? '#1e293b' : '#ffffff'
  const cardBorder = dark ? '#334155' : '#f1f5f9'
  const titleColor = dark ? '#f1f5f9' : '#111827'
  const subColor   = dark ? '#64748b' : '#9ca3af'

  const up = estado === 'UP'
  const cargando = estado === null

  const estadoColor = cargando ? '#94a3b8' : up ? '#16a34a' : '#ef4444'
  const estadoBg     = cargando ? (dark ? '#1e293b' : '#f1f5f9') : up ? (dark ? '#052e16' : '#f0fdf4') : (dark ? '#450a0a' : '#fff5f5')
  const estadoLabel  = cargando ? 'Verificando...' : up ? 'Operativo' : 'Con problemas'

  return (
    <div className="rounded-2xl border shadow-sm p-5"
      style={{ backgroundColor: cardBg, borderColor: cardBorder }}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${estadoColor}18` }}>
          <Activity size={17} style={{ color: estadoColor }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm" style={{ color: titleColor }}>Estado del sistema</p>
          <p className="text-xs mt-0.5" style={{ color: subColor }}>Backend + base de datos · en vivo</p>
        </div>
        <span className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg"
          style={{ backgroundColor: estadoBg, color: estadoColor }}>
          {cargando
            ? <Loader2 size={12} className="animate-spin" />
            : up ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
          {estadoLabel}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl p-3 border" style={{ borderColor: cardBorder }}>
          <div className="flex items-center gap-2">
            <Activity size={13} style={{ color: subColor }} />
            <span className="text-xs" style={{ color: subColor }}>Backend</span>
          </div>
          <p className="text-sm font-bold mt-1" style={{ color: cargando ? subColor : up ? '#16a34a' : '#ef4444' }}>
            {cargando ? '—' : up ? 'UP' : 'DOWN'}
          </p>
        </div>
        <div className="rounded-xl p-3 border" style={{ borderColor: cardBorder }}>
          <div className="flex items-center gap-2">
            <Database size={13} style={{ color: subColor }} />
            <span className="text-xs" style={{ color: subColor }}>Base de datos</span>
          </div>
          <p className="text-sm font-bold mt-1"
            style={{ color: !dbEstado ? subColor : dbEstado === 'UP' ? '#16a34a' : '#ef4444' }}>
            {dbEstado || (error ? 'DOWN' : '—')}
          </p>
        </div>
      </div>

      {ultimaRevision && (
        <p className="text-[11px] mt-3" style={{ color: subColor }}>
          Última verificación: {ultimaRevision.toLocaleTimeString('es-PE')}
        </p>
      )}
    </div>
  )
}
