import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Building2, ArrowLeft, Crown, Shield, Star,
  Construction, AlertCircle
} from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../services/api.js'
import { useTheme } from '../../context/ThemeContext.jsx'
import { isAdmin } from '../../services/session.js'

const PLAN_ICON = { BASICO: Shield, VIP: Crown, ALERI: Star }
const PLAN_COLOR = { BASICO: '#6b7280', VIP: '#af2154', ALERI: '#83266d' }

export default function EmpresaDashboardPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { dark } = useTheme()
  const [empresa, setEmpresa] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    if (!isAdmin()) {
      toast.error('No tienes permiso para ver esta sección')
      navigate('/dashboard')
      return
    }
    api.get(`/empresas/${id}`)
      .then(res => setEmpresa(res.data))
      .catch(err => {
        const msg = err.response?.data?.mensaje || 'No se pudo cargar la empresa'
        setError(msg)
        toast.error(msg)
      })
      .finally(() => setLoading(false))
  }, [id, navigate])

  const cardBg     = dark ? '#1e293b' : '#ffffff'
  const cardBorder = dark ? '#334155' : '#f1f5f9'
  const titleColor = dark ? '#f1f5f9' : '#111827'
  const subColor   = dark ? '#94a3b8' : '#6b7280'

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm" style={{ color: subColor }}>Cargando dashboard de la empresa...</p>
      </div>
    )
  }

  if (error || !empresa) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <AlertCircle size={36} style={{ color: '#ef4444' }} />
        <p className="text-sm" style={{ color: subColor }}>{error || 'Empresa no encontrada'}</p>
        <button onClick={() => navigate('/empresas')}
          className="text-sm font-semibold px-4 py-2 rounded-xl text-white"
          style={{ backgroundColor: '#af2154' }}>
          Volver a Empresas
        </button>
      </div>
    )
  }

  const PlanIcon = PLAN_ICON[empresa.planNombre] || Shield
  const planColor = PLAN_COLOR[empresa.planNombre] || '#6b7280'

  return (
    <div className="space-y-6">

      {/* Botón volver */}
      <button onClick={() => navigate('/empresas')}
        className="flex items-center gap-2 text-sm font-medium transition-colors"
        style={{ color: subColor }}
        onMouseEnter={e => e.currentTarget.style.color = '#af2154'}
        onMouseLeave={e => e.currentTarget.style.color = subColor}>
        <ArrowLeft size={16} />
        Volver a Empresas
      </button>

      {/* Banner de la empresa */}
      <div
        className="relative rounded-2xl overflow-hidden px-7 py-6"
        style={{ background: 'linear-gradient(135deg, #af2154 0%, #83266d 50%, #f58227 100%)' }}>

        <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #ffffff 0%, transparent 70%)', transform: 'translate(30%, -40%)' }} />

        <div className="relative flex items-center gap-5 flex-wrap">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-extrabold flex-shrink-0"
            style={{ backgroundColor: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)' }}>
            {empresa.nombre.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Building2 size={14} className="text-white/70" />
              <span className="text-white/70 text-xs font-medium uppercase tracking-widest">
                Vista de administrador
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white truncate">{empresa.nombre}</h1>
            <p className="text-white/65 text-sm mt-0.5">RUC {empresa.ruc}</p>
          </div>
          <div className="px-4 py-2 rounded-xl text-center"
            style={{ backgroundColor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}>
            <p className="text-white/60 text-[10px] uppercase tracking-wider">Plan</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <PlanIcon size={14} className="text-white" />
              <span className="text-white text-sm font-semibold">{empresa.planNombre}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Datos básicos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl border shadow-sm p-5"
          style={{ backgroundColor: cardBg, borderColor: cardBorder }}>
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: subColor }}>
            Información de contacto
          </p>
          <div className="space-y-2 text-sm">
            <p style={{ color: titleColor }}>
              <span className="font-medium" style={{ color: subColor }}>Email: </span>
              {empresa.contactoEmail || '—'}
            </p>
            <p style={{ color: titleColor }}>
              <span className="font-medium" style={{ color: subColor }}>Teléfono: </span>
              {empresa.contactoTelefono || '—'}
            </p>
            <p style={{ color: titleColor }}>
              <span className="font-medium" style={{ color: subColor }}>Dirección: </span>
              {empresa.direccion || '—'}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border shadow-sm p-5"
          style={{ backgroundColor: cardBg, borderColor: cardBorder }}>
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: subColor }}>
            Estado y plan
          </p>
          <div className="space-y-2 text-sm">
            <p style={{ color: titleColor }}>
              <span className="font-medium" style={{ color: subColor }}>Plan contratado: </span>
              <span style={{ color: planColor, fontWeight: 600 }}>{empresa.planNombre}</span>
            </p>
            <p style={{ color: titleColor }}>
              <span className="font-medium" style={{ color: subColor }}>Estado: </span>
              {empresa.activo ? 'Activa' : 'Inactiva'}
            </p>
            <p style={{ color: titleColor }}>
              <span className="font-medium" style={{ color: subColor }}>Registrada: </span>
              {empresa.createdAt
                ? new Date(empresa.createdAt).toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' })
                : '—'}
            </p>
          </div>
        </div>
      </div>

      {/* Placeholder de KPIs (vendrá luego) */}
      <div className="rounded-2xl border-2 border-dashed p-10 flex flex-col items-center justify-center gap-3 text-center"
        style={{ borderColor: cardBorder, backgroundColor: cardBg }}>
        <Construction size={36} style={{ color: '#f58227' }} />
        <p className="font-semibold text-base" style={{ color: titleColor }}>
          Indicadores de la empresa
        </p>
        <p className="text-sm max-w-md" style={{ color: subColor }}>
          Aquí verás los KPIs de incidentes, EPPs y colaboradores de <strong>{empresa.nombre}</strong>.
          Esta sección se conectará a los datos reales en la próxima entrega.
        </p>
      </div>

    </div>
  )
}
