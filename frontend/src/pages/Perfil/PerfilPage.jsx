import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { User, Mail, Lock, Building2, Crown, Save, Eye, EyeOff, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useTheme } from '../../context/ThemeContext.jsx'
import api from '../../services/api.js'

export default function PerfilPage() {
  const { dark } = useTheme()
  const [perfil, setPerfil] = useState(null)
  const [showActual, setShowActual] = useState(false)
  const [showNuevo, setShowNuevo] = useState(false)
  const cargado = useRef(false)

  const cardBg      = dark ? '#1e293b' : '#ffffff'
  const cardBorder  = dark ? '#334155' : '#f1f5f9'
  const titleColor  = dark ? '#f1f5f9' : '#111827'
  const subColor    = dark ? '#64748b' : '#6b7280'
  const labelColor  = dark ? '#cbd5e1' : '#374151'
  const inputBg     = dark ? '#0f172a' : '#f9fafb'
  const inputBorder = dark ? '#334155' : '#e5e7eb'
  const inputColor  = dark ? '#f1f5f9' : '#1f2937'
  const divider     = dark ? '#334155' : '#f1f5f9'

  const inputStyle = { backgroundColor: inputBg, borderColor: inputBorder, color: inputColor }

  const { register: regInfo, handleSubmit: handleInfo, reset: resetInfo,
          formState: { errors: errInfo } } = useForm()

  const { register: regPass, handleSubmit: handlePass, reset: resetPass,
          formState: { errors: errPass }, watch } = useForm()

  const passwordNuevo = watch('passwordNuevo')

  useEffect(() => {
    if (cargado.current) return
    cargado.current = true

    const token = localStorage.getItem('aleri-token')
    if (!token) {
      toast.error('Debes iniciar sesion primero')
      return
    }

    toast.promise(
      api.get('/perfil').then(res => {
        setPerfil(res.data)
        resetInfo({ nombre: res.data.nombre, email: res.data.email })
        return res
      }),
      {
        loading: 'Cargando perfil...',
        success: 'Perfil cargado',
        error: 'No se pudo cargar el perfil',
      }
    )
  }, [])

  const onGuardarInfo = (data) => {
    toast.promise(
      api.put('/perfil', { nombre: data.nombre, email: data.email }).then(res => {
        setPerfil(res.data)
        // Actualizar datos guardados localmente
        const user = JSON.parse(localStorage.getItem('aleri-user') || '{}')
        localStorage.setItem('aleri-user', JSON.stringify({ ...user, nombre: res.data.nombre, email: res.data.email }))
        window.dispatchEvent(new Event('aleri-user-updated'))
        return res
      }),
      {
        loading: 'Guardando informacion...',
        success: 'Informacion actualizada correctamente',
        error: (err) => err.response?.data || 'Error al actualizar',
      }
    )
  }

  const onCambiarPassword = (data) => {
    toast.promise(
      api.put('/perfil', {
        passwordActual: data.passwordActual,
        passwordNuevo: data.passwordNuevo,
      }).then(res => {
        resetPass()
        return res
      }),
      {
        loading: 'Cambiando contrasena...',
        success: 'Contrasena actualizada correctamente',
        error: (err) => err.response?.data || 'Contrasena actual incorrecta',
      }
    )
  }

  const rolLabel = { ADMIN: 'Administrador', EMPRESA: 'Empresa', SUPERVISOR: 'Supervisor', COLABORADOR: 'Colaborador' }
  const rolColor = {
    ADMIN:       { bg: '#af215420', color: '#af2154' },
    EMPRESA:     { bg: '#83266d20', color: '#83266d' },
    SUPERVISOR:  { bg: '#f59e0b20', color: '#d97706' },
    COLABORADOR: { bg: '#8b5cf620', color: '#7c3aed' },
  }

  return (
    <div className="space-y-6 max-w-8xl mx-auto">

      {/* Encabezado */}
      <div>
        <h1 className="text-xl font-bold" style={{ color: titleColor }}>Mi Perfil</h1>
        <p className="text-sm mt-0.5" style={{ color: subColor }}>
          Gestiona tu informacion personal y seguridad
        </p>
      </div>

      {/* Card resumen */}
      {perfil && (
        <div className="rounded-2xl border p-6 flex items-center gap-5 shadow-sm transition-colors duration-300"
          style={{ backgroundColor: cardBg, borderColor: cardBorder }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-extrabold flex-shrink-0"
            style={{ backgroundColor: '#af2154' }}>
            {perfil.nombre?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-lg font-bold truncate" style={{ color: titleColor }}>{perfil.nombre}</p>
            <p className="text-sm truncate" style={{ color: subColor }}>{perfil.email}</p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg"
                style={{ backgroundColor: rolColor[perfil.rol]?.bg, color: rolColor[perfil.rol]?.color }}>
                {rolLabel[perfil.rol]}
              </span>
              {perfil.empresaNombre && (
                <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg"
                  style={{ backgroundColor: dark ? '#0f172a' : '#f1f5f9', color: subColor }}>
                  <Building2 size={11} />{perfil.empresaNombre}
                </span>
              )}
              {perfil.planNombre && perfil.planNombre !== '-' && (
                <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg"
                  style={{ backgroundColor: '#83266d20', color: '#83266d' }}>
                  <Crown size={11} />Plan {perfil.planNombre}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Informacion personal */}
      <div className="rounded-2xl border shadow-sm transition-colors duration-300"
        style={{ backgroundColor: cardBg, borderColor: cardBorder }}>
        <div className="px-6 py-4 border-b flex items-center gap-2" style={{ borderColor: divider }}>
          <User size={16} style={{ color: '#af2154' }} />
          <p className="font-semibold text-sm" style={{ color: titleColor }}>Informacion Personal</p>
        </div>
        <form onSubmit={handleInfo(onGuardarInfo)} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: labelColor }}>Nombre completo</label>
            <input type="text" style={inputStyle}
              className="w-full rounded-xl px-4 py-3 text-sm border focus:outline-none focus:ring-2 focus:ring-primary-400 transition-all"
              {...regInfo('nombre', { required: 'El nombre es obligatorio' })} />
            {errInfo.nombre && <p className="mt-1 text-xs text-red-500">{errInfo.nombre.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: labelColor }}>Correo electronico</label>
            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: subColor }} />
              <input type="email" style={inputStyle}
                className="w-full rounded-xl px-4 py-3 pl-10 text-sm border focus:outline-none focus:ring-2 focus:ring-primary-400 transition-all"
                {...regInfo('email', {
                  required: 'El correo es obligatorio',
                  pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Correo invalido' }
                })} />
            </div>
            {errInfo.email && <p className="mt-1 text-xs text-red-500">{errInfo.email.message}</p>}
          </div>
          <div className="flex justify-end pt-1">
            <button type="submit"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
              style={{ backgroundColor: '#af2154' }}>
              <Save size={15} />Guardar cambios
            </button>
          </div>
        </form>
      </div>

      {/* Cambiar contraseña */}
      <div className="rounded-2xl border shadow-sm transition-colors duration-300"
        style={{ backgroundColor: cardBg, borderColor: cardBorder }}>
        <div className="px-6 py-4 border-b flex items-center gap-2" style={{ borderColor: divider }}>
          <Lock size={16} style={{ color: '#af2154' }} />
          <p className="font-semibold text-sm" style={{ color: titleColor }}>Cambiar Contrasena</p>
        </div>
        <form onSubmit={handlePass(onCambiarPassword)} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: labelColor }}>Contrasena actual</label>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: subColor }} />
              <input type={showActual ? 'text' : 'password'} placeholder="••••••••" style={inputStyle}
                className="w-full rounded-xl px-4 py-3 pl-10 pr-11 text-sm border focus:outline-none focus:ring-2 focus:ring-primary-400 transition-all"
                {...regPass('passwordActual', { required: 'Ingresa tu contrasena actual' })} />
              <button type="button" onClick={() => setShowActual(!showActual)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: subColor }}>
                {showActual ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {errPass.passwordActual && <p className="mt-1 text-xs text-red-500">{errPass.passwordActual.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: labelColor }}>Nueva contrasena</label>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: subColor }} />
              <input type={showNuevo ? 'text' : 'password'} placeholder="••••••••" style={inputStyle}
                className="w-full rounded-xl px-4 py-3 pl-10 pr-11 text-sm border focus:outline-none focus:ring-2 focus:ring-primary-400 transition-all"
                {...regPass('passwordNuevo', {
                  required: 'Ingresa la nueva contrasena',
                  minLength: { value: 6, message: 'Minimo 6 caracteres' }
                })} />
              <button type="button" onClick={() => setShowNuevo(!showNuevo)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: subColor }}>
                {showNuevo ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {errPass.passwordNuevo && <p className="mt-1 text-xs text-red-500">{errPass.passwordNuevo.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: labelColor }}>Confirmar nueva contrasena</label>
            <div className="relative">
              <CheckCircle2 size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: subColor }} />
              <input type="password" placeholder="••••••••" style={inputStyle}
                className="w-full rounded-xl px-4 py-3 pl-10 text-sm border focus:outline-none focus:ring-2 focus:ring-primary-400 transition-all"
                {...regPass('confirmar', {
                  required: 'Confirma la nueva contrasena',
                  validate: v => v === passwordNuevo || 'Las contrasenas no coinciden'
                })} />
            </div>
            {errPass.confirmar && <p className="mt-1 text-xs text-red-500">{errPass.confirmar.message}</p>}
          </div>
          <div className="flex justify-end pt-1">
            <button type="submit"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
              style={{ backgroundColor: '#83266d' }}>
              <Lock size={15} />Cambiar contrasena
            </button>
          </div>
        </form>
      </div>

    </div>
  )
}
