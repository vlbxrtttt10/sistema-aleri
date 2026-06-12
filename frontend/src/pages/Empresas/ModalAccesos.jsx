import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  KeyRound, X, User, Mail, Lock, Plus, RefreshCw,
  ToggleLeft, ToggleRight, ShieldCheck, Eye, EyeOff
} from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../services/api.js'
import ModalPortal from '../../components/ModalPortal.jsx'

/**
 * Modal para administrar los accesos (usuarios rol EMPRESA) de una empresa.
 * Solo se muestra a ADMIN.
 *
 * Props:
 *  - dark        boolean
 *  - empresa     { id, nombre, ruc, ... } empresa seleccionada
 *  - onClose     () => void
 */
export default function ModalAccesos({ dark, empresa, onClose }) {
  const [usuarios, setUsuarios]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [resetingId, setResetingId] = useState(null) // id del usuario al que se está reseteando pwd

  const cardBg     = dark ? '#1e293b' : '#ffffff'
  const cardBorder = dark ? '#334155' : '#f1f5f9'
  const titleColor = dark ? '#f1f5f9' : '#111827'
  const subColor   = dark ? '#64748b' : '#6b7280'
  const labelColor = dark ? '#cbd5e1' : '#374151'
  const inputBg    = dark ? '#0f172a' : '#f9fafb'
  const inputBd    = dark ? '#334155' : '#e5e7eb'
  const inputColor = dark ? '#f1f5f9' : '#1f2937'
  const inputStyle = { backgroundColor: inputBg, borderColor: inputBd, color: inputColor }

  const focusIn = e => {
    e.currentTarget.style.borderColor = '#af2154'
    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(175,33,84,0.12)'
  }
  const focusOut = e => {
    e.currentTarget.style.borderColor = inputBd
    e.currentTarget.style.boxShadow = 'none'
  }

  const cargar = () => {
    setLoading(true)
    api.get(`/empresas/${empresa.id}/usuarios`)
      .then(res => setUsuarios(res.data))
      .catch(err => toast.error(err.response?.data?.mensaje || 'Error al cargar usuarios'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { cargar() /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [empresa.id])

  return (
    <ModalPortal>
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>

      <div className="w-full max-w-xl rounded-2xl border shadow-2xl my-4"
        style={{ backgroundColor: cardBg, borderColor: cardBorder }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b"
          style={{ borderColor: cardBorder }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: '#83266d18' }}>
              <KeyRound size={17} style={{ color: '#83266d' }} />
            </div>
            <div>
              <p className="font-semibold text-sm" style={{ color: titleColor }}>Accesos · {empresa.nombre}</p>
              <p className="text-xs mt-0.5" style={{ color: subColor }}>
                Administra el usuario que se loguea como dueño de la empresa
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

        <div className="p-6 space-y-5">

          {/* Lista de usuarios existentes */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: subColor }}>
              Usuario existente
            </p>
            {loading ? (
              <p className="text-sm py-4 text-center" style={{ color: subColor }}>Cargando...</p>
            ) : usuarios.length === 0 ? (
              <div className="rounded-xl border-2 border-dashed p-6 text-center"
                style={{ borderColor: inputBd }}>
                <ShieldCheck size={28} className="mx-auto mb-2" style={{ color: subColor }} />
                <p className="text-sm" style={{ color: subColor }}>
                  Esta empresa aún no tiene un usuario para iniciar sesión
                </p>
                <p className="text-xs mt-1" style={{ color: subColor }}>
                  Crea uno con el formulario de abajo
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {usuarios.map(u => (
                  <UsuarioRow
                    key={u.id}
                    usuario={u}
                    dark={dark}
                    resetingId={resetingId}
                    setResetingId={setResetingId}
                    onActualizado={updated =>
                      setUsuarios(prev => prev.map(x => x.id === updated.id ? updated : x))}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Formulario crear nuevo (solo si aún no hay) */}
          {!loading && usuarios.length === 0 && (
            <FormCrearUsuario
              empresaId={empresa.id}
              dark={dark}
              labelColor={labelColor}
              inputStyle={inputStyle}
              focusIn={focusIn}
              focusOut={focusOut}
              subColor={subColor}
              onCreado={u => setUsuarios([u])}
            />
          )}

          {/* Botón cerrar */}
          <div className="flex justify-end pt-2">
            <button type="button" onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-medium border transition-colors"
              style={{ borderColor: inputBd, color: subColor }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = dark ? '#334155' : '#f8fafc'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
              Cerrar
            </button>
          </div>

        </div>
      </div>
    </div>
    </ModalPortal>
  )
}

/* ─────────────── Fila de usuario existente ─────────────── */
function UsuarioRow({ usuario, dark, resetingId, setResetingId, onActualizado }) {
  const [nuevaPwd, setNuevaPwd]   = useState('')
  const [showPwd, setShowPwd]     = useState(false)
  const [guardando, setGuardando] = useState(false)
  const enReset = resetingId === usuario.id

  const subColor   = dark ? '#94a3b8' : '#6b7280'
  const titleColor = dark ? '#f1f5f9' : '#111827'
  const inputBg    = dark ? '#0f172a' : '#f9fafb'
  const inputBd    = dark ? '#334155' : '#e5e7eb'
  const inputColor = dark ? '#f1f5f9' : '#1f2937'

  const handleReset = () => {
    if (nuevaPwd.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres')
      return
    }
    setGuardando(true)
    toast.promise(
      api.put(`/empresas/usuarios/${usuario.id}/reset-password`, { password: nuevaPwd })
        .then(res => {
          onActualizado(res.data)
          setResetingId(null)
          setNuevaPwd('')
        })
        .finally(() => setGuardando(false)),
      {
        loading: 'Reseteando contraseña...',
        success: 'Contraseña actualizada',
        error: (err) => err.response?.data?.mensaje || 'Error al resetear',
      }
    )
  }

  const handleToggle = () =>
    toast.promise(
      api.put(`/empresas/usuarios/${usuario.id}/toggle`).then(res => onActualizado(res.data)),
      { loading: 'Actualizando...', success: 'Estado actualizado', error: 'Error al actualizar' }
    )

  return (
    <div className="rounded-xl border p-4"
      style={{ borderColor: inputBd, backgroundColor: dark ? '#0f172a' : '#fafafa' }}>
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #af2154, #83266d)' }}>
          {usuario.nombre.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate" style={{ color: titleColor }}>{usuario.nombre}</p>
          <p className="text-xs truncate" style={{ color: subColor }}>{usuario.email}</p>
          <span className="inline-block mt-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: usuario.activo
                ? (dark ? '#23061d' : '#f7edf4')
                : (dark ? '#450a0a' : '#fff5f5'),
              color: usuario.activo ? '#16a34a' : '#ef4444',
            }}>
            {usuario.activo ? 'ACTIVO' : 'INACTIVO'}
          </span>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button onClick={() => setResetingId(enReset ? null : usuario.id)}
            title="Resetear contraseña"
            className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
            style={{
              backgroundColor: enReset ? '#af2154' : 'transparent',
              color: enReset ? '#ffffff' : '#af2154',
            }}>
            <RefreshCw size={14} />
          </button>
          <button onClick={handleToggle}
            title={usuario.activo ? 'Desactivar' : 'Activar'}
            className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
            style={{ color: usuario.activo ? '#ef4444' : '#16a34a' }}>
            {usuario.activo ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
          </button>
        </div>
      </div>

      {/* Bloque de reset password (inline) */}
      {enReset && (
        <div className="mt-3 pt-3 border-t" style={{ borderColor: inputBd }}>
          <p className="text-xs font-medium mb-2" style={{ color: subColor }}>
            Nueva contraseña (mínimo 6 caracteres)
          </p>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: subColor }} />
              <input
                type={showPwd ? 'text' : 'password'}
                value={nuevaPwd}
                onChange={e => setNuevaPwd(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg px-3 py-2 pl-9 pr-9 text-sm border focus:outline-none"
                style={{ backgroundColor: inputBg, borderColor: inputBd, color: inputColor }}
              />
              <button type="button" onClick={() => setShowPwd(!showPwd)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: subColor }}>
                {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            <button onClick={handleReset} disabled={guardando}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-white transition-all hover:opacity-90 disabled:opacity-60"
              style={{ backgroundColor: '#af2154' }}>
              {guardando ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

/* ─────────────── Formulario crear nuevo ─────────────── */
function FormCrearUsuario({ empresaId, dark, labelColor, inputStyle, focusIn, focusOut, subColor, onCreado }) {
  const [showPwd, setShowPwd] = useState(false)
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm()

  const onSubmit = (data) =>
    toast.promise(
      api.post(`/empresas/${empresaId}/usuarios`, data).then(res => {
        onCreado(res.data)
        reset()
        return res
      }),
      {
        loading: 'Creando usuario...',
        success: 'Usuario creado correctamente',
        error: (err) => err.response?.data?.mensaje || 'Error al crear usuario',
      }
    )

  return (
    <div className="rounded-xl border p-5" style={{
      borderColor: dark ? '#334155' : '#f6ccdc',
      backgroundColor: dark ? '#1a0613' : '#fceef4'
    }}>
      <p className="text-xs font-semibold uppercase tracking-widest mb-3 flex items-center gap-2"
        style={{ color: '#af2154' }}>
        <Plus size={13} />
        Crear nuevo acceso
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">

        {/* Nombre */}
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: labelColor }}>
            Nombre del responsable
          </label>
          <div className="relative">
            <User size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: subColor }} />
            <input type="text" placeholder="Juan Pérez" style={inputStyle}
              className="w-full rounded-lg px-3 py-2 pl-9 text-sm border focus:outline-none"
              onFocus={focusIn} onBlur={focusOut}
              {...register('nombre', { required: 'El nombre es obligatorio' })} />
          </div>
          {errors.nombre && <p className="mt-1 text-xs text-red-500">{errors.nombre.message}</p>}
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: labelColor }}>
            Correo de acceso
          </label>
          <div className="relative">
            <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: subColor }} />
            <input type="email" placeholder="dueno@empresa.com" style={inputStyle}
              className="w-full rounded-lg px-3 py-2 pl-9 text-sm border focus:outline-none"
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
          <label className="block text-xs font-medium mb-1" style={{ color: labelColor }}>
            Contraseña inicial (mínimo 6 caracteres)
          </label>
          <div className="relative">
            <Lock size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: subColor }} />
            <input type={showPwd ? 'text' : 'password'} placeholder="••••••••" style={inputStyle}
              className="w-full rounded-lg px-3 py-2 pl-9 pr-9 text-sm border focus:outline-none"
              onFocus={focusIn} onBlur={focusOut}
              {...register('password', {
                required: 'La contraseña es obligatoria',
                minLength: { value: 6, message: 'Mínimo 6 caracteres' }
              })} />
            <button type="button" onClick={() => setShowPwd(!showPwd)}
              className="absolute right-3 top-1/2 -translate-y-1/2"
              style={{ color: subColor }}>
              {showPwd ? <EyeOff size={13} /> : <Eye size={13} />}
            </button>
          </div>
          {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
        </div>

        <button type="submit" disabled={isSubmitting}
          className="w-full mt-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-60"
          style={{ backgroundColor: '#af2154' }}>
          {isSubmitting ? 'Creando...' : 'Crear acceso'}
        </button>
      </form>
    </div>
  )
}
