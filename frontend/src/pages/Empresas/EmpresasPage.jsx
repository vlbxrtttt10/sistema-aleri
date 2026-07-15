import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import {
  Building2, Plus, X, Search,
  Crown, Shield, Star, MapPin, Mail, Phone, Hash, Pencil, LayoutDashboard,
  KeyRound, Trash2
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useTheme } from '../../context/ThemeContext.jsx'
import api from '../../services/api.js'
import { isAdmin } from '../../services/session.js'
import ModalAccesos from './ModalAccesos.jsx'
import ModalEliminar from './ModalEliminar.jsx'
import ModalPortal from '../../components/ModalPortal.jsx'

/* Config visual de cada plan */
const PLAN_CFG = {
  BASICO: { label: 'Básico',  color: '#6b7280', bg: '#f1f5f9', bgDark: '#1e293b', icon: Shield, desc: '3 supervisores · 3 col./sup.' },
  VIP:    { label: 'VIP',     color: '#af2154', bg: '#fceef4', bgDark: '#2f0614', icon: Crown,  desc: '5 supervisores · 5 col./sup.' },
  ALERI:  { label: 'ALERI',   color: '#83266d', bg: '#f7edf4', bgDark: '#23061d', icon: Star,   desc: 'Supervisores y colaboradores ilimitados' },
}

function PlanBadge({ nombre }) {
  const cfg = PLAN_CFG[nombre] || { label: nombre, color: '#6b7280', bg: '#f1f5f9', bgDark: '#1e293b' }
  const Icon = cfg.icon || Shield
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full"
      style={{ backgroundColor: cfg.bg, color: cfg.color }}>
      <Icon size={11} />
      {cfg.label}
    </span>
  )
}

/* ── Modal crear / editar empresa ── */
function ModalEmpresa({ dark, planes, empresa, onClose, onGuardada }) {
  const isEdit = Boolean(empresa)

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({
    defaultValues: empresa
      ? {
          nombre:           empresa.nombre || '',
          ruc:              empresa.ruc || '',
          direccion:        empresa.direccion || '',
          contactoEmail:    empresa.contactoEmail || '',
          contactoTelefono: empresa.contactoTelefono || '',
          planId:           empresa.planId ? String(empresa.planId) : '',
        }
      : {},
  })

  const cardBg    = dark ? '#1e293b' : '#ffffff'
  const cardBorder= dark ? '#334155' : '#f1f5f9'
  const titleColor= dark ? '#f1f5f9' : '#111827'
  const subColor  = dark ? '#64748b' : '#6b7280'
  const labelColor= dark ? '#cbd5e1' : '#374151'
  const inputBg   = dark ? '#0f172a' : '#f9fafb'
  const inputBd   = dark ? '#334155' : '#e5e7eb'
  const inputColor= dark ? '#f1f5f9' : '#1f2937'
  const inputStyle= { backgroundColor: inputBg, borderColor: inputBd, color: inputColor }

  const focusIn  = e => { e.currentTarget.style.borderColor = '#af2154'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(175,33,84,0.12)' }
  const focusOut = (e, bd) => { e.currentTarget.style.borderColor = bd; e.currentTarget.style.boxShadow = 'none' }

  const onSubmit = (data) => {
    const payload = { ...data, planId: Number(data.planId) }
    const request = isEdit
      ? api.put(`/empresas/${empresa.id}`, payload)
      : api.post('/empresas', payload)

    return toast.promise(
      request.then(res => {
        onGuardada(res.data)
        onClose()
        return res
      }),
      {
        loading: isEdit ? 'Guardando cambios...' : 'Creando empresa...',
        success: isEdit ? 'Empresa actualizada correctamente' : 'Empresa creada correctamente',
        error:   (err) => err.response?.data?.mensaje || (isEdit ? 'Error al actualizar empresa' : 'Error al crear empresa'),
      }
    )
  }

  return (
    <ModalPortal>
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>

      <div className="w-full max-w-lg rounded-2xl border shadow-2xl my-4"
        style={{ backgroundColor: cardBg, borderColor: cardBorder }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b"
          style={{ borderColor: cardBorder }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: '#af215418' }}>
              {isEdit
                ? <Pencil size={17} style={{ color: '#af2154' }} />
                : <Building2 size={17} style={{ color: '#af2154' }} />}
            </div>
            <div>
              <p className="font-semibold text-sm" style={{ color: titleColor }}>
                {isEdit ? 'Editar empresa' : 'Nueva empresa'}
              </p>
              <p className="text-xs mt-0.5" style={{ color: subColor }}>
                {isEdit ? 'Modifica los datos y guarda los cambios' : 'Completa los datos y selecciona el plan'}
              </p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
            style={{ color: subColor }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = dark ? '#334155' : '#f1f5f9'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
            <X size={17} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">

          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: labelColor }}>
              Nombre de la empresa <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Building2 size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: subColor }} />
              <input type="text" placeholder="Ej: Minera Perú SAC" style={inputStyle}
                className="w-full rounded-xl px-4 py-3 pl-10 text-sm border focus:outline-none transition-all"
                onFocus={focusIn} onBlur={e => focusOut(e, inputBd)}
                {...register('nombre', { required: 'El nombre es obligatorio' })} />
            </div>
            {errors.nombre && <p className="mt-1 text-xs text-red-500">{errors.nombre.message}</p>}
          </div>

          {/* RUC */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: labelColor }}>
              RUC <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Hash size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: subColor }} />
              <input type="text" placeholder="20123456789" style={inputStyle}
                className="w-full rounded-xl px-4 py-3 pl-10 text-sm border focus:outline-none transition-all"
                onFocus={focusIn} onBlur={e => focusOut(e, inputBd)}
                {...register('ruc', {
                  required: 'El RUC es obligatorio',
                  minLength: { value: 11, message: 'El RUC debe tener 11 dígitos' },
                  maxLength: { value: 11, message: 'El RUC debe tener 11 dígitos' },
                  pattern:   { value: /^\d+$/, message: 'Solo números' }
                })} />
            </div>
            {errors.ruc && <p className="mt-1 text-xs text-red-500">{errors.ruc.message}</p>}
          </div>

          {/* Dirección */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: labelColor }}>Dirección</label>
            <div className="relative">
              <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: subColor }} />
              <input type="text" placeholder="Av. Industrial 123, Lima" style={inputStyle}
                className="w-full rounded-xl px-4 py-3 pl-10 text-sm border focus:outline-none transition-all"
                onFocus={focusIn} onBlur={e => focusOut(e, inputBd)}
                {...register('direccion')} />
            </div>
          </div>

          {/* Email y teléfono en fila */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: labelColor }}>Email contacto</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: subColor }} />
                <input type="email" placeholder="contacto@empresa.com" style={inputStyle}
                  className="w-full rounded-xl px-4 py-3 pl-10 text-sm border focus:outline-none transition-all"
                  onFocus={focusIn} onBlur={e => focusOut(e, inputBd)}
                  {...register('contactoEmail', {
                    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Email inválido' }
                  })} />
              </div>
              {errors.contactoEmail && <p className="mt-1 text-xs text-red-500">{errors.contactoEmail.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: labelColor }}>Teléfono</label>
              <div className="relative">
                <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: subColor }} />
                <input type="text" placeholder="999888777" style={inputStyle}
                  className="w-full rounded-xl px-4 py-3 pl-10 text-sm border focus:outline-none transition-all"
                  onFocus={focusIn} onBlur={e => focusOut(e, inputBd)}
                  {...register('contactoTelefono')} />
              </div>
            </div>
          </div>

          {/* Plan */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: labelColor }}>
              Plan <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              {planes.map(p => {
                const cfg = PLAN_CFG[p.nombre] || { label: p.nombre, color: '#6b7280', icon: Shield, desc: '' }
                const Icon = cfg.icon
                const seleccionado = String(watch('planId')) === String(p.id)
                return (
                  <label key={p.id} className="relative cursor-pointer">
                    <input type="radio" value={p.id} className="sr-only"
                      {...register('planId', { required: 'Selecciona un plan' })} />
                    <div
                      className="flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 text-center transition-all"
                      style={{
                        borderColor: seleccionado ? cfg.color : inputBd,
                        backgroundColor: seleccionado ? `${cfg.color}14` : 'transparent',
                        boxShadow: seleccionado ? `0 4px 12px ${cfg.color}33` : 'none',
                      }}>
                      <Icon size={22} style={{ color: cfg.color }} />
                      <span className="text-xs font-bold" style={{ color: titleColor }}>{cfg.label}</span>
                      <span className="text-[10px] leading-tight" style={{ color: subColor }}>{cfg.desc}</span>
                    </div>
                  </label>
                )
              })}
            </div>
            {errors.planId && <p className="mt-1 text-xs text-red-500">{errors.planId.message}</p>}
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors"
              style={{ borderColor: inputBd, color: subColor }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = dark ? '#334155' : '#f8fafc'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
              Cancelar
            </button>
            <button type="submit" disabled={isSubmitting}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-60"
              style={{ backgroundColor: '#af2154' }}>
              {isSubmitting
                ? (isEdit ? 'Guardando...' : 'Creando...')
                : (isEdit ? 'Guardar cambios' : 'Crear empresa')}
            </button>
          </div>
        </form>
      </div>
    </div>
    </ModalPortal>
  )
}

/* ── Página principal ── */
export default function EmpresasPage() {
  const { dark } = useTheme()
  const navigate = useNavigate()
  const esAdmin = isAdmin()
  const [empresas, setEmpresas] = useState([])
  const [planes,   setPlanes]   = useState([])
  const [loading,  setLoading]  = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [empresaEdit, setEmpresaEdit] = useState(null)
  const [empresaAccesos, setEmpresaAccesos] = useState(null)
  const [empresaEliminar, setEmpresaEliminar] = useState(null)
  const [busqueda, setBusqueda] = useState('')
  const cargado = useRef(false)

  const cardBg    = dark ? '#1e293b' : '#ffffff'
  const cardBorder= dark ? '#334155' : '#f1f5f9'
  const titleColor= dark ? '#f1f5f9' : '#111827'
  const subColor  = dark ? '#64748b' : '#9ca3af'
  const headBg    = dark ? '#0f172a' : '#f8fafc'
  const headColor = dark ? '#64748b' : '#9ca3af'
  const rowBorder = dark ? '#334155' : '#f1f5f9'
  const rowText   = dark ? '#cbd5e1' : '#374151'
  const inputBg   = dark ? '#1e293b' : '#f8fafc'
  const inputBd   = dark ? '#334155' : '#e2e8f0'
  const inputColor= dark ? '#f1f5f9' : '#111827'

  useEffect(() => {
    if (cargado.current) return
    cargado.current = true
    Promise.all([
      api.get('/empresas'),
      api.get('/empresas/planes'),
    ]).then(([eRes, pRes]) => {
      setEmpresas(eRes.data)
      setPlanes(pRes.data)
    }).catch(() => toast.error('No se pudo cargar la información'))
      .finally(() => setLoading(false))
  }, [])

  const handleEliminada = (id) => {
    setEmpresas(prev => prev.filter(e => e.id !== id))
  }

  const abrirCrear = () => {
    setEmpresaEdit(null)
    setShowModal(true)
  }

  const abrirEditar = (empresa) => {
    setEmpresaEdit(empresa)
    setShowModal(true)
  }

  const cerrarModal = () => {
    setShowModal(false)
    setEmpresaEdit(null)
  }

  const handleGuardada = (empresa) => {
    setEmpresas(prev => {
      const existe = prev.some(e => e.id === empresa.id)
      return existe
        ? prev.map(e => e.id === empresa.id ? empresa : e)
        : [empresa, ...prev]
    })
  }

  const filtradas = empresas.filter(e =>
    e.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    e.ruc.includes(busqueda) ||
    e.planNombre?.toLowerCase().includes(busqueda.toLowerCase())
  )

  const porPlan = (nombre) => empresas.filter(e => e.planNombre === nombre).length

  return (
    <div className="space-y-6">

      {/* ── Encabezado ── */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-bold" style={{ color: titleColor }}>Gestión de Empresas</h1>
          <p className="text-sm mt-0.5" style={{ color: subColor }}>
            Administra las empresas registradas y sus planes
          </p>
        </div>
        <button
          onClick={abrirCrear}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 shadow-sm"
          style={{ backgroundColor: '#af2154' }}>
          <Plus size={16} />
          Nueva empresa
        </button>
      </div>

      {/* ── KPIs de planes ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { nombre: 'BASICO', count: porPlan('BASICO') },
          { nombre: 'VIP',    count: porPlan('VIP')    },
          { nombre: 'ALERI',  count: porPlan('ALERI')  },
        ].map(({ nombre, count }) => {
          const cfg = PLAN_CFG[nombre]
          const Icon = cfg.icon
          return (
            <div key={nombre} className="rounded-2xl border shadow-sm px-5 py-4 flex items-center gap-4"
              style={{ backgroundColor: cardBg, borderColor: cardBorder }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${cfg.color}18` }}>
                <Icon size={20} style={{ color: cfg.color }} />
              </div>
              <div>
                <p className="text-2xl font-extrabold leading-none" style={{ color: titleColor }}>{count}</p>
                <p className="text-xs mt-1 font-medium" style={{ color: subColor }}>Plan {cfg.label}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Tabla ── */}
      <div className="rounded-2xl border shadow-sm overflow-hidden"
        style={{ backgroundColor: cardBg, borderColor: cardBorder }}>

        <div className="px-6 py-4 flex items-center justify-between gap-4 border-b flex-wrap"
          style={{ borderColor: cardBorder }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: dark ? '#0f172a' : '#fceef4' }}>
              <Building2 size={17} style={{ color: '#af2154' }} />
            </div>
            <div>
              <p className="font-semibold text-sm" style={{ color: titleColor }}>Empresas registradas</p>
              <p className="text-xs mt-0.5" style={{ color: subColor }}>{filtradas.length} registros</p>
            </div>
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: subColor }} />
            <input type="text" placeholder="Buscar..." value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm rounded-xl border focus:outline-none transition-all w-44"
              style={{ backgroundColor: inputBg, borderColor: inputBd, color: inputColor }}
              onFocus={e => { e.currentTarget.style.borderColor = '#af2154'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(175,33,84,0.12)' }}
              onBlur={e => { e.currentTarget.style.borderColor = inputBd; e.currentTarget.style.boxShadow = 'none' }} />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: headBg }}>
                {['Empresa', 'RUC', 'Contacto', 'Plan', 'Estado', 'Creado', 'Acciones'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider"
                    style={{ color: headColor }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="px-5 py-10 text-center text-sm" style={{ color: subColor }}>Cargando...</td></tr>
              ) : filtradas.length === 0 ? (
                <tr><td colSpan={7} className="px-5 py-10 text-center text-sm" style={{ color: subColor }}>
                  {busqueda ? 'Sin resultados para la búsqueda' : 'No hay empresas registradas aún'}
                </td></tr>
              ) : filtradas.map(e => (
                <tr key={e.id} className="border-t transition-colors"
                  style={{ borderColor: rowBorder, backgroundColor: 'transparent' }}
                  onMouseEnter={ev => ev.currentTarget.style.backgroundColor = dark ? '#334155' : '#f8fafc'}
                  onMouseLeave={ev => ev.currentTarget.style.backgroundColor = 'transparent'}>

                  {/* Nombre */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg, #af2154, #f58227)' }}>
                        {e.nombre.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-sm" style={{ color: rowText }}>{e.nombre}</p>
                        {e.direccion && <p className="text-[11px]" style={{ color: subColor }}>{e.direccion}</p>}
                      </div>
                    </div>
                  </td>

                  {/* RUC */}
                  <td className="px-5 py-3.5 font-mono text-xs" style={{ color: subColor }}>{e.ruc}</td>

                  {/* Contacto */}
                  <td className="px-5 py-3.5">
                    <div className="text-xs space-y-0.5">
                      {e.contactoEmail && <p style={{ color: rowText }}>{e.contactoEmail}</p>}
                      {e.contactoTelefono && <p style={{ color: subColor }}>{e.contactoTelefono}</p>}
                      {!e.contactoEmail && !e.contactoTelefono && <p style={{ color: subColor }}>—</p>}
                    </div>
                  </td>

                  {/* Plan */}
                  <td className="px-5 py-3.5"><PlanBadge nombre={e.planNombre} /></td>

                  {/* Estado */}
                  <td className="px-5 py-3.5">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                      style={{
                        backgroundColor: e.activo ? (dark ? '#23061d' : '#f7edf4') : (dark ? '#450a0a' : '#fff5f5'),
                        color: e.activo ? '#16a34a' : '#ef4444',
                      }}>
                      {e.activo ? 'Activa' : 'Inactiva'}
                    </span>
                  </td>

                  {/* Fecha */}
                  <td className="px-5 py-3.5 text-xs tabular-nums" style={{ color: subColor }}>
                    {e.createdAt
                      ? new Date(e.createdAt).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })
                      : '—'}
                  </td>

                  {/* Acciones: Ver dashboard (admin) + Accesos (admin) + Editar + Toggle */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      {esAdmin && (
                        <button onClick={() => navigate(`/empresas/${e.id}/dashboard`)}
                          title="Ver dashboard de esta empresa"
                          className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all"
                          style={{
                            backgroundColor: dark ? '#1e293b' : '#f7edf4',
                            color: '#83266d',
                            border: `1px solid ${dark ? '#334155' : '#e9cde2'}`,
                          }}>
                          <LayoutDashboard size={13} /> Dashboard
                        </button>
                      )}
                      {esAdmin && (
                        <button onClick={() => setEmpresaAccesos(e)}
                          title="Administrar usuarios de acceso"
                          className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all"
                          style={{
                            backgroundColor: dark ? '#1e293b' : '#fff7ed',
                            color: '#f58227',
                            border: `1px solid ${dark ? '#334155' : '#fed7aa'}`,
                          }}>
                          <KeyRound size={13} /> Accesos
                        </button>
                      )}
                      <button onClick={() => abrirEditar(e)}
                        title="Editar empresa"
                        className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all"
                        style={{
                          backgroundColor: dark ? '#1e293b' : '#fceef4',
                          color: '#af2154',
                          border: `1px solid ${dark ? '#334155' : '#f6ccdc'}`,
                        }}>
                        <Pencil size={13} /> Editar
                      </button>
                      <button onClick={() => setEmpresaEliminar(e)}
                        title="Eliminar empresa"
                        className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all"
                        style={{
                          backgroundColor: dark ? '#450a0a' : '#fff5f5',
                          color: '#ef4444',
                          border: `1px solid ${dark ? '#7f1d1d' : '#fecaca'}`,
                        }}>
                        <Trash2 size={13} /> Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <ModalEmpresa dark={dark} planes={planes}
          empresa={empresaEdit}
          onClose={cerrarModal}
          onGuardada={handleGuardada} />
      )}

      {empresaAccesos && (
        <ModalAccesos dark={dark}
          empresa={empresaAccesos}
          onClose={() => setEmpresaAccesos(null)} />
      )}

      {empresaEliminar && (
        <ModalEliminar dark={dark}
          empresa={empresaEliminar}
          onClose={() => setEmpresaEliminar(null)}
          onEliminada={handleEliminada} />
      )}
    </div>
  )
}
