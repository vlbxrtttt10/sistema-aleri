import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import {
  UserPlus, Shield, ShieldCheck, ToggleLeft, ToggleRight,
  X, Eye, EyeOff, Users, Lock, Mail, User, Search, Pencil, KeyRound, Save
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useTheme } from '../../context/ThemeContext.jsx'
import api from '../../services/api.js'
import ModalPortal from '../../components/ModalPortal.jsx'

const ROL_CFG = {
  ADMIN:    { label: 'Admin',    bg: '#af215418', color: '#af2154', icon: ShieldCheck },
  SUBADMIN: { label: 'Subadmin', bg: '#83266d18', color: '#83266d', icon: Shield      },
}

function RolBadge({ rol }) {
  const cfg = ROL_CFG[rol] || { label: rol, bg: '#e2e8f0', color: '#64748b' }
  const Icon = cfg.icon
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full"
      style={{ backgroundColor: cfg.bg, color: cfg.color }}>
      {Icon && <Icon size={11} />}
      {cfg.label}
    </span>
  )
}

/* ── Modal crear / editar usuario ── */
function ModalUsuario({ dark, usuario, onClose, onGuardado }) {
  const isEdit = Boolean(usuario)
  const [showPwd, setShowPwd] = useState(false)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: usuario
      ? {
          nombre:   usuario.nombre || '',
          email:    usuario.email  || '',
          tipo:     usuario.rol    || '',
          password: '',
        }
      : {},
  })

  const overlay   = 'rgba(0,0,0,0.5)'
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
  const focusOut = e => { e.currentTarget.style.borderColor = inputBd; e.currentTarget.style.boxShadow = 'none' }

  const onSubmit = (data) => {
    /* Al editar, si password está vacío no lo mandamos para que el backend no lo cambie */
    const payload = { ...data }
    if (isEdit && (!payload.password || payload.password.trim() === '')) {
      delete payload.password
    }

    const request = isEdit
      ? api.put(`/usuarios-admin/${usuario.id}`, payload)
      : api.post('/usuarios-admin', payload)

    return toast.promise(
      request.then(res => {
        onGuardado(res.data)
        onClose()
        return res
      }),
      {
        loading: isEdit ? 'Guardando cambios...' : 'Creando usuario...',
        success: isEdit ? 'Usuario actualizado correctamente' : 'Usuario creado correctamente',
        error: (err) => err.response?.data?.mensaje || (isEdit ? 'Error al actualizar' : 'Error al crear usuario'),
      }
    )
  }

  return (
    <ModalPortal>
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
      style={{ backgroundColor: overlay }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-md rounded-2xl border shadow-2xl my-4"
        style={{ backgroundColor: cardBg, borderColor: cardBorder }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b"
          style={{ borderColor: cardBorder }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: '#af215418' }}>
              {isEdit
                ? <Pencil size={17} style={{ color: '#af2154' }} />
                : <UserPlus size={17} style={{ color: '#af2154' }} />}
            </div>
            <div>
              <p className="font-semibold text-sm" style={{ color: titleColor }}>
                {isEdit ? 'Editar usuario' : 'Nuevo usuario'}
              </p>
              <p className="text-xs mt-0.5" style={{ color: subColor }}>
                {isEdit ? 'Modifica los datos del Admin/Subadmin' : 'Admin o Subadmin'}
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

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">

          {/* Tipo */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: labelColor }}>
              Tipo de usuario
            </label>
            <div className="grid grid-cols-2 gap-3">
              {['ADMIN', 'SUBADMIN'].map(t => (
                <label key={t} className="relative cursor-pointer">
                  <input type="radio" value={t} className="peer sr-only"
                    {...register('tipo', { required: 'Selecciona un tipo' })} />
                  <div
                    className="flex flex-col items-center gap-2 p-3 rounded-xl border-2 text-center transition-all peer-checked:border-[#af2154] peer-checked:bg-[#af21540d]"
                    style={{ borderColor: inputBd }}>
                    {t === 'ADMIN'
                      ? <ShieldCheck size={22} style={{ color: '#af2154' }} />
                      : <Shield size={22} style={{ color: '#83266d' }} />}
                    <span className="text-xs font-semibold" style={{ color: titleColor }}>
                      {t === 'ADMIN' ? 'Admin' : 'Subadmin'}
                    </span>
                    <span className="text-[10px]" style={{ color: subColor }}>
                      {t === 'ADMIN' ? 'Acceso total' : 'Acceso limitado'}
                    </span>
                  </div>
                </label>
              ))}
            </div>
            {errors.tipo && <p className="mt-1 text-xs text-red-500">{errors.tipo.message}</p>}
          </div>

          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: labelColor }}>
              Nombre completo
            </label>
            <div className="relative">
              <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: subColor }} />
              <input type="text" placeholder="Ej: Juan Pérez" style={inputStyle}
                className="w-full rounded-xl px-4 py-3 pl-10 text-sm border focus:outline-none transition-all"
                onFocus={focusIn} onBlur={focusOut}
                {...register('nombre', { required: 'El nombre es obligatorio' })} />
            </div>
            {errors.nombre && <p className="mt-1 text-xs text-red-500">{errors.nombre.message}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: labelColor }}>
              Correo electrónico
            </label>
            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: subColor }} />
              <input type="email" placeholder="correo@ejemplo.com" style={inputStyle}
                className="w-full rounded-xl px-4 py-3 pl-10 text-sm border focus:outline-none transition-all"
                onFocus={focusIn} onBlur={focusOut}
                {...register('email', {
                  required: 'El correo es obligatorio',
                  pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Correo inválido' }
                })} />
            </div>
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: labelColor }}>
              Contraseña {isEdit && <span className="font-normal" style={{ color: subColor }}>· déjala vacía para no cambiarla</span>}
            </label>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: subColor }} />
              <input type={showPwd ? 'text' : 'password'}
                placeholder={isEdit ? 'Nueva contraseña (opcional)' : 'Mínimo 6 caracteres'}
                style={inputStyle}
                className="w-full rounded-xl px-4 py-3 pl-10 pr-11 text-sm border focus:outline-none transition-all"
                onFocus={focusIn} onBlur={focusOut}
                {...register('password', {
                  // En crear es obligatoria; en editar es opcional pero si la escriben debe tener mín. 6
                  required: isEdit ? false : 'La contraseña es obligatoria',
                  minLength: { value: 6, message: 'Mínimo 6 caracteres' },
                  validate: (val) => {
                    if (isEdit && (!val || val.trim() === '')) return true // ok, no cambiar
                    if (!val || val.length < 6) return 'Mínimo 6 caracteres'
                    return true
                  },
                })} />
              <button type="button" onClick={() => setShowPwd(!showPwd)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
                style={{ color: subColor }}>
                {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
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
                : (isEdit ? 'Guardar cambios' : 'Crear usuario')}
            </button>
          </div>
        </form>
      </div>
    </div>
    </ModalPortal>
  )
}

/* ── Tarjeta: API key de Anthropic (análisis IA) ── */
function TarjetaApiKey({ dark }) {
  const [apiKeyEnmascarada, setApiKeyEnmascarada] = useState('')
  const [editando, setEditando] = useState(false)
  const [valor, setValor] = useState('')
  const [showValor, setShowValor] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [cargado, setCargado] = useState(false)

  const cardBg    = dark ? '#1e293b' : '#ffffff'
  const cardBorder= dark ? '#334155' : '#f1f5f9'
  const titleColor= dark ? '#f1f5f9' : '#111827'
  const subColor  = dark ? '#64748b' : '#6b7280'
  const inputBg   = dark ? '#0f172a' : '#f9fafb'
  const inputBd   = dark ? '#334155' : '#e5e7eb'
  const inputColor= dark ? '#f1f5f9' : '#1f2937'

  useEffect(() => {
    api.get('/configuracion/anthropic-key')
      .then(res => setApiKeyEnmascarada(res.data.apiKeyEnmascarada || ''))
      .catch(() => {})
      .finally(() => setCargado(true))
  }, [])

  const guardar = () => {
    if (!valor.trim()) return
    setGuardando(true)
    api.put('/configuracion/anthropic-key', { apiKey: valor.trim() })
      .then(res => {
        setApiKeyEnmascarada(res.data.apiKeyEnmascarada || '')
        setEditando(false)
        setValor('')
        toast.success('API key actualizada')
      })
      .catch(err => toast.error(err.response?.data?.mensaje || 'Error al guardar la API key'))
      .finally(() => setGuardando(false))
  }

  if (!cargado) return null

  return (
    <div className="rounded-2xl border shadow-sm p-5"
      style={{ backgroundColor: cardBg, borderColor: cardBorder }}>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: '#f5822718' }}>
          <KeyRound size={17} style={{ color: '#f58227' }} />
        </div>
        <div>
          <p className="font-semibold text-sm" style={{ color: titleColor }}>API key de Anthropic</p>
          <p className="text-xs mt-0.5" style={{ color: subColor }}>Usada para generar el análisis IA de incidentes</p>
        </div>
      </div>

      {!editando ? (
        <div className="flex items-center gap-3 flex-wrap">
          <code className="px-3 py-2 rounded-lg text-xs font-mono"
            style={{ backgroundColor: inputBg, color: inputColor, border: `1px solid ${inputBd}` }}>
            {apiKeyEnmascarada || 'No configurada'}
          </code>
          <button onClick={() => setEditando(true)}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all"
            style={{ backgroundColor: dark ? '#1e293b' : '#fceef4', color: '#af2154', border: `1px solid ${dark ? '#334155' : '#f6ccdc'}` }}>
            <Pencil size={13} /> {apiKeyEnmascarada ? 'Cambiar' : 'Configurar'}
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[240px]">
            <input type={showValor ? 'text' : 'password'}
              placeholder="sk-ant-api03-..."
              value={valor}
              onChange={e => setValor(e.target.value)}
              className="w-full rounded-xl px-4 py-2.5 pr-11 text-sm border focus:outline-none transition-all font-mono"
              style={{ backgroundColor: inputBg, borderColor: inputBd, color: inputColor }}
              onFocus={e => { e.currentTarget.style.borderColor = '#af2154'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(175,33,84,0.12)' }}
              onBlur={e => { e.currentTarget.style.borderColor = inputBd; e.currentTarget.style.boxShadow = 'none' }} />
            <button type="button" onClick={() => setShowValor(!showValor)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
              style={{ color: subColor }}>
              {showValor ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          <button onClick={guardar} disabled={guardando || !valor.trim()}
            className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2.5 rounded-xl text-white transition-all hover:opacity-90 disabled:opacity-60"
            style={{ backgroundColor: '#af2154' }}>
            <Save size={13} /> {guardando ? 'Guardando...' : 'Guardar'}
          </button>
          <button onClick={() => { setEditando(false); setValor('') }} disabled={guardando}
            className="text-xs font-medium px-3 py-2.5 rounded-xl border transition-colors"
            style={{ borderColor: inputBd, color: subColor }}>
            Cancelar
          </button>
        </div>
      )}
    </div>
  )
}

/* ── Página principal ── */
export default function ColaboradoresPage() {
  const { dark } = useTheme()
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [usuarioEdit, setUsuarioEdit] = useState(null)
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
    cargar()
  }, [])

  const cargar = () => {
    setLoading(true)
    api.get('/usuarios-admin')
      .then(res => setUsuarios(res.data))
      .catch(() => toast.error('No se pudo cargar la lista'))
      .finally(() => setLoading(false))
  }

  const handleToggle = (id) => {
    toast.promise(
      api.put(`/usuarios-admin/${id}/toggle`).then(res => {
        setUsuarios(prev => prev.map(u => u.id === id ? res.data : u))
        return res
      }),
      {
        loading: 'Actualizando...',
        success: 'Estado actualizado',
        error: 'Error al actualizar',
      }
    )
  }

  const abrirCrear = () => {
    setUsuarioEdit(null)
    setShowModal(true)
  }

  const abrirEditar = (usuario) => {
    setUsuarioEdit(usuario)
    setShowModal(true)
  }

  const cerrarModal = () => {
    setShowModal(false)
    setUsuarioEdit(null)
  }

  const handleGuardado = (usuario) => {
    setUsuarios(prev => {
      const existe = prev.some(u => u.id === usuario.id)
      return existe
        ? prev.map(u => u.id === usuario.id ? usuario : u)
        : [usuario, ...prev]
    })
  }

  const filtrados = usuarios.filter(u =>
    u.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    u.email.toLowerCase().includes(busqueda.toLowerCase()) ||
    u.rol.toLowerCase().includes(busqueda.toLowerCase())
  )

  const totalAdmin    = usuarios.filter(u => u.rol === 'ADMIN').length
  const totalSubadmin = usuarios.filter(u => u.rol === 'SUBADMIN').length

  return (
    <div className="space-y-6">

      {/* ── Encabezado ── */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-bold" style={{ color: titleColor }}>Gestión de Administradores</h1>
          <p className="text-sm mt-0.5" style={{ color: subColor }}>
            Administra los accesos de Admin y Subadmin al sistema
          </p>
        </div>
        <button
          onClick={abrirCrear}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 shadow-sm"
          style={{ backgroundColor: '#af2154' }}>
          <UserPlus size={16} />
          Nuevo usuario
        </button>
      </div>

      {/* ── API key de Anthropic ── */}
      <TarjetaApiKey dark={dark} />

      {/* ── KPIs rápidos ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total usuarios',    value: usuarios.length, color: '#af2154', icon: Users },
          { label: 'Administradores',   value: totalAdmin,      color: '#af2154', icon: ShieldCheck },
          { label: 'Subadministradores', value: totalSubadmin,  color: '#83266d', icon: Shield },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="rounded-2xl border shadow-sm px-5 py-4 flex items-center gap-4 transition-all"
            style={{ backgroundColor: cardBg, borderColor: cardBorder }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${color}18` }}>
              <Icon size={20} style={{ color }} />
            </div>
            <div>
              <p className="text-2xl font-extrabold leading-none" style={{ color: titleColor }}>{value}</p>
              <p className="text-xs mt-1" style={{ color: subColor }}>{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Tabla ── */}
      <div className="rounded-2xl border shadow-sm overflow-hidden"
        style={{ backgroundColor: cardBg, borderColor: cardBorder }}>

        {/* Header tabla */}
        <div className="px-6 py-4 flex items-center justify-between gap-4 border-b flex-wrap"
          style={{ borderColor: cardBorder }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: dark ? '#0f172a' : '#eff6ff' }}>
              <Users size={17} style={{ color: '#af2154' }} />
            </div>
            <div>
              <p className="font-semibold text-sm" style={{ color: titleColor }}>Usuarios del sistema</p>
              <p className="text-xs mt-0.5" style={{ color: subColor }}>{filtrados.length} registros</p>
            </div>
          </div>
          {/* Buscador */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: subColor }} />
            <input
              type="text"
              placeholder="Buscar..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm rounded-xl border focus:outline-none transition-all w-44"
              style={{ backgroundColor: inputBg, borderColor: inputBd, color: inputColor }}
              onFocus={e => { e.currentTarget.style.borderColor = '#af2154'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(175,33,84,0.12)' }}
              onBlur={e => { e.currentTarget.style.borderColor = inputBd; e.currentTarget.style.boxShadow = 'none' }}
            />
          </div>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: headBg }}>
                {['Usuario', 'Correo', 'Tipo', 'Estado', 'Creado', 'Acciones'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider"
                    style={{ color: headColor }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-sm" style={{ color: subColor }}>
                    Cargando...
                  </td>
                </tr>
              ) : filtrados.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-sm" style={{ color: subColor }}>
                    {busqueda ? 'Sin resultados para la búsqueda' : 'No hay usuarios registrados aún'}
                  </td>
                </tr>
              ) : filtrados.map(u => (
                <tr key={u.id} className="border-t transition-colors"
                  style={{ borderColor: rowBorder, backgroundColor: 'transparent' }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = dark ? '#334155' : '#f8fafc'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>

                  {/* Nombre + avatar */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                        style={{ background: u.rol === 'ADMIN'
                          ? 'linear-gradient(135deg, #af2154, #83266d)'
                          : 'linear-gradient(135deg, #83266d, #6b1d5a)' }}>
                        {u.nombre.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-sm" style={{ color: rowText }}>{u.nombre}</span>
                    </div>
                  </td>

                  {/* Email */}
                  <td className="px-5 py-3.5 text-xs" style={{ color: subColor }}>{u.email}</td>

                  {/* Rol */}
                  <td className="px-5 py-3.5"><RolBadge rol={u.rol} /></td>

                  {/* Estado */}
                  <td className="px-5 py-3.5">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                      style={{
                        backgroundColor: u.activo
                          ? (dark ? '#052e16' : '#f0fdf4')
                          : (dark ? '#450a0a' : '#fff5f5'),
                        color: u.activo ? '#16a34a' : '#ef4444',
                      }}>
                      {u.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>

                  {/* Fecha creación */}
                  <td className="px-5 py-3.5 text-xs tabular-nums" style={{ color: subColor }}>
                    {u.createdAt
                      ? new Date(u.createdAt).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })
                      : '—'}
                  </td>

                  {/* Acciones: Editar + Toggle */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => abrirEditar(u)}
                        title="Editar usuario"
                        className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all"
                        style={{
                          backgroundColor: dark ? '#1e293b' : '#fceef4',
                          color: '#af2154',
                          border: `1px solid ${dark ? '#334155' : '#f6ccdc'}`,
                        }}>
                        <Pencil size={13} /> Editar
                      </button>
                      <button
                        onClick={() => handleToggle(u.id)}
                        title={u.activo ? 'Desactivar' : 'Activar'}
                        className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all"
                        style={{
                          backgroundColor: u.activo
                            ? (dark ? '#450a0a' : '#fff5f5')
                            : (dark ? '#052e16' : '#f0fdf4'),
                          color: u.activo ? '#ef4444' : '#16a34a',
                        }}>
                        {u.activo
                          ? <><ToggleRight size={14} /> Desactivar</>
                          : <><ToggleLeft  size={14} /> Activar</>}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <ModalUsuario
          dark={dark}
          usuario={usuarioEdit}
          onClose={cerrarModal}
          onGuardado={handleGuardado}
        />
      )}
    </div>
  )
}
