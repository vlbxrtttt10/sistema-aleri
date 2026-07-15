import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Building2, ArrowLeft, Crown, Shield, Star,
  AlertCircle, Users, UserCheck, ChevronDown, ChevronUp
} from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../services/api.js'
import { useTheme } from '../../context/ThemeContext.jsx'
import { isAdmin } from '../../services/session.js'

const PLAN_ICON  = { BASICO: Shield, VIP: Crown, ALERI: Star }
const PLAN_COLOR = { BASICO: '#6b7280', VIP: '#af2154', ALERI: '#83266d' }

function Badge({ children, color }) {
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold"
      style={{ backgroundColor: color + '22', color }}
    >
      {children}
    </span>
  )
}

function SupervisorRow({ sup, colaboradores, dark, cardBg, cardBorder, titleColor, subColor }) {
  const [open, setOpen] = useState(false)
  const misCols = colaboradores.filter(c => c.supervisorId === sup.id)

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{ borderColor: cardBorder, backgroundColor: cardBg }}
    >
      {/* Cabecera del supervisor */}
      <button
        className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors"
        style={{ backgroundColor: 'transparent' }}
        onMouseEnter={e => e.currentTarget.style.backgroundColor = dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)'}
        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
        onClick={() => setOpen(o => !o)}
      >
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
          style={{ backgroundColor: '#af2154' }}
        >
          {sup.nombre.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate" style={{ color: titleColor }}>{sup.nombre}</p>
          <p className="text-xs truncate" style={{ color: subColor }}>
            {sup.cargo || 'Supervisor'}{sup.area ? ` · ${sup.area}` : ''}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <Badge color={sup.activo ? '#10b981' : '#ef4444'}>
            {sup.activo ? 'Activo' : 'Inactivo'}
          </Badge>
          <span className="text-xs font-medium px-2 py-1 rounded-lg" style={{ backgroundColor: dark ? '#334155' : '#f1f5f9', color: subColor }}>
            {misCols.length} colab.
          </span>
          {open
            ? <ChevronUp size={15} style={{ color: subColor }} />
            : <ChevronDown size={15} style={{ color: subColor }} />
          }
        </div>
      </button>

      {/* Colaboradores del supervisor (expandible) */}
      {open && (
        <div style={{ borderTop: `1px solid ${cardBorder}` }}>
          {misCols.length === 0 ? (
            <p className="px-5 py-3 text-xs" style={{ color: subColor }}>Sin colaboradores asignados.</p>
          ) : (
            <table className="w-full text-xs">
              <thead>
                <tr style={{ backgroundColor: dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}>
                  {['Nombre', 'DNI', 'Cargo', 'Área', 'Ingreso'].map(h => (
                    <th key={h} className="px-4 py-2 text-left font-semibold uppercase tracking-wider"
                      style={{ color: subColor }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {misCols.map((c, i) => (
                  <tr
                    key={c.id}
                    style={{ borderTop: i > 0 ? `1px solid ${cardBorder}` : 'none' }}
                  >
                    <td className="px-4 py-2.5 font-medium" style={{ color: titleColor }}>{c.nombre}</td>
                    <td className="px-4 py-2.5" style={{ color: subColor }}>{c.dni || '—'}</td>
                    <td className="px-4 py-2.5" style={{ color: subColor }}>{c.cargo || '—'}</td>
                    <td className="px-4 py-2.5" style={{ color: subColor }}>{c.area || '—'}</td>
                    <td className="px-4 py-2.5" style={{ color: subColor }}>
                      {c.fechaIngreso
                        ? new Date(c.fechaIngreso).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  )
}

export default function EmpresaDashboardPage() {
  const { id }     = useParams()
  const navigate   = useNavigate()
  const { dark }   = useTheme()
  const [empresa,  setEmpresa]  = useState(null)
  const [equipo,   setEquipo]   = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(null)

  useEffect(() => {
    if (!isAdmin()) {
      toast.error('No tienes permiso para ver esta sección')
      navigate('/dashboard')
      return
    }
    Promise.all([
      api.get(`/empresas/${id}`),
      api.get(`/empresas/${id}/equipo`),
    ])
      .then(([empRes, equipoRes]) => {
        setEmpresa(empRes.data)
        setEquipo(equipoRes.data)
      })
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

  const PlanIcon  = PLAN_ICON[empresa.planNombre]  || Shield
  const planColor = PLAN_COLOR[empresa.planNombre] || '#6b7280'
  const supervisores  = equipo?.supervisores  || []
  const colaboradores = equipo?.colaboradores || []

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
          {/* Contadores rápidos en el banner */}
          <div className="flex gap-3">
            <div className="px-4 py-2 rounded-xl text-center"
              style={{ backgroundColor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}>
              <p className="text-white/60 text-[10px] uppercase tracking-wider">Supervisores</p>
              <p className="text-white text-lg font-bold leading-none mt-1">
                {supervisores.length}
                <span className="text-white/50 text-xs font-normal">
                  {empresa.planMaxSupervisores != null
                    ? `/${empresa.planMaxSupervisores} sup.`
                    : '/∞'}
                </span>
              </p>
            </div>
            <div className="px-4 py-2 rounded-xl text-center"
              style={{ backgroundColor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}>
              <p className="text-white/60 text-[10px] uppercase tracking-wider">Colaboradores</p>
              <p className="text-white text-lg font-bold leading-none mt-1">
                {colaboradores.length}
                <span className="text-white/50 text-xs font-normal">
                  {empresa.planMaxColaboradoresPorSupervisor != null
                    ? `/${empresa.planMaxColaboradoresPorSupervisor} col./sup.`
                    : '/∞'}
                </span>
              </p>
            </div>
            <div className="px-4 py-2 rounded-xl text-center"
              style={{ backgroundColor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}>
              <p className="text-white/60 text-[10px] uppercase tracking-wider">Plan</p>
              <div className="flex items-center gap-1.5 mt-1">
                <PlanIcon size={14} className="text-white" />
                <span className="text-white text-sm font-semibold">{empresa.planNombre}</span>
              </div>
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

      {/* Equipo: supervisores + colaboradores */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Users size={18} style={{ color: '#af2154' }} />
          <h2 className="text-base font-bold" style={{ color: titleColor }}>
            Equipo de la empresa
          </h2>
          <span className="ml-auto text-xs" style={{ color: subColor }}>
            Clic en un supervisor para ver sus colaboradores
          </span>
        </div>

        {supervisores.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed p-10 flex flex-col items-center gap-3 text-center"
            style={{ borderColor: cardBorder, backgroundColor: cardBg }}>
            <UserCheck size={32} style={{ color: subColor }} />
            <p className="text-sm font-medium" style={{ color: subColor }}>
              Esta empresa aún no tiene supervisores registrados.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {supervisores.map(sup => (
              <SupervisorRow
                key={sup.id}
                sup={sup}
                colaboradores={colaboradores}
                dark={dark}
                cardBg={cardBg}
                cardBorder={cardBorder}
                titleColor={titleColor}
                subColor={subColor}
              />
            ))}
          </div>
        )}
      </div>

    </div>
  )
}
