import { useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  UserPlus, Pencil, X, User, Mail, Lock, Hash, Phone, Briefcase, Building, Eye, EyeOff,
  ShieldCheck, AlertTriangle, HardHat, FileBarChart2, Users
} from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../services/api.js'
import ModalPortal from '../../components/ModalPortal.jsx'

const MODULOS_DISPONIBLES = [
  { value: 'INCIDENTES',    label: 'Incidentes / Accidentes', icon: AlertTriangle },
  { value: 'EPPS',          label: 'EPPs',                    icon: HardHat       },
  { value: 'REPORTES',      label: 'Reportes',                icon: FileBarChart2 },
  { value: 'COLABORADORES', label: 'Colaboradores',           icon: Users         },
]

/**
 * Modal para crear o editar un supervisor.
 * Si recibe `supervisor` → modo editar (password opcional).
 * Si no → modo crear (password obligatorio).
 */
export default function ModalSupervisor({ dark, supervisor, onClose, onGuardado }) {
  const isEdit = Boolean(supervisor)
  const [showPwd, setShowPwd] = useState(false)
  const [modulos, setModulos] = useState(() =>
    isEdit && supervisor.modulosVisibles
      ? new Set(supervisor.modulosVisibles)
      : new Set(MODULOS_DISPONIBLES.map(m => m.value))
  )
  const toggleModulo = (value) => {
    setModulos(prev => {
      const next = new Set(prev)
      next.has(value) ? next.delete(value) : next.add(value)
      return next
    })
  }
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: supervisor
      ? {
          nombre:   supervisor.nombre   || '',
          email:    supervisor.email    || '',
          password: '',
          dni:      supervisor.dni      || '',
          telefono: supervisor.telefono || '',
          cargo:    supervisor.cargo    || '',
          area:     supervisor.area     || '',
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
  const focusOut = e => { e.currentTarget.style.borderColor = inputBd; e.currentTarget.style.boxShadow = 'none' }

  const onSubmit = (data) => {
    const payload = { ...data, modulosVisibles: Array.from(modulos) }
    if (isEdit && (!payload.password || payload.password.trim() === '')) {
      delete payload.password
    }
    const request = isEdit
      ? api.put(`/supervisores/${supervisor.id}`, payload)
      : api.post('/supervisores', payload)

    return toast.promise(
      request.then(res => {
        onGuardado(res.data)
        onClose()
        return res
      }),
      {
        loading: isEdit ? 'Guardando cambios...' : 'Creando supervisor...',
        success: isEdit ? 'Supervisor actualizado' : 'Supervisor creado',
        error:   (err) => err.response?.data?.mensaje || (isEdit ? 'Error al actualizar' : 'Error al crear'),
      }
    )
  }

  /* Helper para input con icono */
  const Field = ({ icon: Icon, label, name, type = 'text', required, validation, placeholder, span, error }) => (
    <div className={span === 2 ? 'sm:col-span-2' : ''}>
      <label className="block text-xs font-medium mb-1.5" style={{ color: labelColor }}>
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <Icon size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: subColor }} />
        <input type={type} placeholder={placeholder} style={inputStyle}
          className="w-full rounded-xl px-3.5 py-2.5 pl-10 text-sm border focus:outline-none transition-all"
          onFocus={focusIn} onBlur={focusOut}
          {...register(name, validation)} />
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error.message}</p>}
    </div>
  )

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
              style={{ backgroundColor: '#af215418' }}>
              {isEdit
                ? <Pencil size={17} style={{ color: '#af2154' }} />
                : <UserPlus size={17} style={{ color: '#af2154' }} />}
            </div>
            <div>
              <p className="font-semibold text-sm" style={{ color: titleColor }}>
                {isEdit ? 'Editar supervisor' : 'Nuevo supervisor'}
              </p>
              <p className="text-xs mt-0.5" style={{ color: subColor }}>
                {isEdit ? 'Actualiza los datos del supervisor' : 'Datos de acceso y perfil'}
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

          {/* Bloque: acceso */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest mb-3" style={{ color: subColor }}>
              Datos de acceso
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field icon={User} label="Nombre completo" name="nombre" required
                placeholder="Ej: Juan Pérez"
                validation={{ required: 'El nombre es obligatorio' }}
                error={errors.nombre} span={2} />

              <Field icon={Mail} label="Correo electrónico" name="email" required type="email"
                placeholder="correo@empresa.com"
                validation={{
                  required: 'El correo es obligatorio',
                  pattern:  { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Correo inválido' }
                }}
                error={errors.email} span={2} />

              {/* Password (con toggle) */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium mb-1.5" style={{ color: labelColor }}>
                  Contraseña {!isEdit && <span className="text-red-500">*</span>}
                  {isEdit && <span className="font-normal" style={{ color: subColor }}> · déjala vacía para no cambiarla</span>}
                </label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: subColor }} />
                  <input type={showPwd ? 'text' : 'password'}
                    placeholder={isEdit ? 'Nueva contraseña (opcional)' : 'Mínimo 6 caracteres'}
                    style={inputStyle}
                    className="w-full rounded-xl px-3.5 py-2.5 pl-10 pr-10 text-sm border focus:outline-none transition-all"
                    onFocus={focusIn} onBlur={focusOut}
                    {...register('password', {
                      required: isEdit ? false : 'La contraseña es obligatoria',
                      validate: (val) => {
                        if (isEdit && (!val || val.trim() === '')) return true
                        if (!val || val.length < 6) return 'Mínimo 6 caracteres'
                        return true
                      },
                    })} />
                  <button type="button" onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
                    style={{ color: subColor }}>
                    {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
              </div>
            </div>
          </div>

          {/* Bloque: perfil */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest mb-3 mt-2" style={{ color: subColor }}>
              Datos del perfil <span className="font-normal" style={{ textTransform: 'none', letterSpacing: 'normal' }}>(opcionales)</span>
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field icon={Hash}      label="DNI"      name="dni"      placeholder="76543210"
                validation={{ maxLength: { value: 20, message: 'Máx. 20 caracteres' } }}
                error={errors.dni} />
              <Field icon={Phone}     label="Teléfono" name="telefono" placeholder="999888777"
                validation={{ maxLength: { value: 20, message: 'Máx. 20 caracteres' } }}
                error={errors.telefono} />
              <Field icon={Briefcase} label="Cargo"    name="cargo"    placeholder="Ej: Jefe de Seguridad"
                validation={{ maxLength: { value: 100, message: 'Máx. 100 caracteres' } }}
                error={errors.cargo} />
              <Field icon={Building}  label="Área"     name="area"     placeholder="Ej: Operaciones"
                validation={{ maxLength: { value: 100, message: 'Máx. 100 caracteres' } }}
                error={errors.area} />
            </div>
          </div>

          {/* Bloque: permisos */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest mb-3 mt-2" style={{ color: subColor }}>
              Permisos <span className="font-normal" style={{ textTransform: 'none', letterSpacing: 'normal' }}>· módulos que puede ver</span>
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {MODULOS_DISPONIBLES.map(({ value, label, icon: Icon }) => {
                const activo = modulos.has(value)
                return (
                  <button key={value} type="button" onClick={() => toggleModulo(value)}
                    className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border text-sm font-medium transition-all text-left"
                    style={{
                      backgroundColor: activo ? '#af215412' : inputBg,
                      borderColor: activo ? '#af2154' : inputBd,
                      color: activo ? '#af2154' : labelColor,
                    }}>
                    <div className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 border"
                      style={{
                        backgroundColor: activo ? '#af2154' : 'transparent',
                        borderColor: activo ? '#af2154' : inputBd,
                      }}>
                      {activo && <ShieldCheck size={12} style={{ color: '#fff' }} />}
                    </div>
                    <Icon size={14} className="flex-shrink-0" />
                    <span className="truncate">{label}</span>
                  </button>
                )
              })}
            </div>
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
                : (isEdit ? 'Guardar cambios' : 'Crear supervisor')}
            </button>
          </div>
        </form>
      </div>
    </div>
    </ModalPortal>
  )
}
