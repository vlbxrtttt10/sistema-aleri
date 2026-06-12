import { Eye, EyeOff, Mail, Lock, LogIn, Loader2 } from 'lucide-react'

export default function LoginForm({
  register,
  handleSubmit,
  errors,
  onSubmit,
  loading,
  showPassword,
  setShowPassword,
  dark,
}) {
  // Estilos basados en el tema (oscuro = pill oscuro tipo eless, claro = pill suave)
  const inputBg = dark ? '#16161a' : '#f4f4f5'
  const inputBorder = dark ? '#26262c' : '#e5e7eb'
  const inputText = dark ? '#f5f5f7' : '#111827'
  const iconColor = dark ? '#6b6b75' : '#9ca3af'
  const labelColor = dark ? '#d4d4d8' : '#374151'

  const inputStyle = {
    backgroundColor: inputBg,
    borderColor: inputBorder,
    color: inputText,
  }

  // Botón submit: en dark = blanco texto negro (como la imagen). En light = primary.
  const submitStyle = dark
    ? { backgroundColor: '#ffffff', color: '#0a0a0b' }
    : { backgroundColor: '#af2154', color: '#ffffff' }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">

      {/* Correo */}
      <div>
        <label
          className="block text-sm font-medium mb-2"
          style={{ color: labelColor }}
        >
          Correo electrónico
        </label>
        <div className="relative">
          <Mail
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2"
            style={{ color: iconColor }}
          />
          <input
            type="email"
            placeholder="correo@empresa.com"
            style={inputStyle}
            className={`w-full rounded-full px-4 py-3 pl-11 text-sm border
              focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500/60
              transition-all duration-200 placeholder-gray-500
              ${errors.email ? 'ring-2 ring-red-500/40 border-red-500/60' : ''}`}
            {...register('email', {
              required: 'El correo es obligatorio',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Ingresa un correo válido',
              },
            })}
          />
        </div>
        {errors.email && (
          <p className="mt-1.5 text-xs text-red-500 px-2">{errors.email.message}</p>
        )}
      </div>

      {/* Contraseña */}
      <div>
        <label
          className="block text-sm font-medium mb-2"
          style={{ color: labelColor }}
        >
          Contraseña
        </label>
        <div className="relative">
          <Lock
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2"
            style={{ color: iconColor }}
          />
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            style={inputStyle}
            className={`w-full rounded-full px-4 py-3 pl-11 pr-12 text-sm border
              focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500/60
              transition-all duration-200 placeholder-gray-500
              ${errors.password ? 'ring-2 ring-red-500/40 border-red-500/60' : ''}`}
            {...register('password', {
              required: 'La contraseña es obligatoria',
              minLength: { value: 6, message: 'Mínimo 6 caracteres' },
            })}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors hover:opacity-80"
            style={{ color: iconColor }}
          >
            {showPassword
              ? <EyeOff size={16} />
              : <Eye size={16} />
            }
          </button>
        </div>
        {errors.password && (
          <p className="mt-1.5 text-xs text-red-500 px-2">{errors.password.message}</p>
        )}
      </div>

      {/* Recordarme + Recuperar acceso */}
      <div className="flex items-center justify-between pt-1">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            id="remember"
            type="checkbox"
            className="w-4 h-4 rounded border-gray-300 cursor-pointer accent-primary-500"
            {...register('remember')}
          />
          <span
            className="text-sm transition-colors duration-300"
            style={{ color: dark ? '#a1a1aa' : '#4b5563' }}
          >
            Recordar sesión
          </span>
        </label>
        <button
          type="button"
          className="text-sm font-semibold transition-colors hover:opacity-80"
          style={{ color: dark ? '#f5f5f7' : '#af2154' }}
        >
          Recuperar acceso
        </button>
      </div>

      {/* Botón submit */}
      <button
        type="submit"
        disabled={loading}
        style={submitStyle}
        className="w-full font-semibold py-3 px-6 rounded-full transition-all duration-200
          flex items-center justify-center gap-2 shadow-md hover:shadow-xl hover:scale-[1.01]
          active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed mt-2 cursor-pointer"
      >
        {loading ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Ingresando...
          </>
        ) : (
          <>
            <LogIn size={16} />
            Iniciar Sesión
          </>
        )}
      </button>
    </form>
  )
}
