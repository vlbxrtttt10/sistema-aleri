import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../../services/api.js'
import LoginForm from './LoginForm.jsx'
import LoginBranding from './LoginBranding.jsx'
import ThemeToggle from '../../components/ThemeToggle.jsx'
import { useTheme } from '../../context/ThemeContext.jsx'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { dark } = useTheme()
  const navigate = useNavigate()

  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = async (data) => {
    setLoading(true)

    const loginPromise = api.post('/auth/login', {
      email: (data.email || '').trim().toLowerCase(),
      password: data.password,
    })

    toast.promise(loginPromise, {
      loading: 'Verificando credenciales...',
      success: (res) => `Bienvenido, ${res.data.nombre}`,
      error: (err) => {
        const status = err.response?.status
        if (status === 401 || status === 403) return 'Credenciales incorrectas'
        if (status === 400) return 'Datos invalidos'
        return 'Error al conectar con el servidor'
      },
    })

    try {
      const res = await loginPromise
      localStorage.setItem('aleri-token', res.data.token)
      localStorage.setItem('aleri-user', JSON.stringify({
        nombre: res.data.nombre,
        email: res.data.email,
        rol: res.data.rol,
        empresaId: res.data.empresaId,
        empresaNombre: res.data.empresaNombre,
        planNombre: res.data.planNombre,
        modulos: res.data.modulos || [],
      }))
      setTimeout(() => navigate('/dashboard'), 800)
    } catch (_) {
      // el toast.promise ya muestra el error
    } finally {
      setLoading(false)
    }
  }

  // Panel izquierdo: oscuro casi negro en dark, blanco crema en light
  const leftBg = dark ? '#0a0a0b' : '#ffffff'
  const titleColor = dark ? '#f5f5f7' : '#111827'
  const subtitleColor = dark ? '#8b8b93' : '#6b7280'
  const footerColor = dark ? '#3f3f46' : '#cbd5e1'

  return (
    <div className="min-h-screen flex">
      {/* Panel izquierdo - Formulario */}
      <div
        className="w-full lg:w-[42%] xl:w-[38%] flex items-center justify-center px-8 py-12 relative transition-colors duration-300"
        style={{ backgroundColor: leftBg }}
      >
        <div className="absolute top-5 right-5 z-10">
          <ThemeToggle />
        </div>

        <div className="w-full max-w-sm animate-fade-in-up">
          {/* Logo wordmark estilo "eless" */}
          <div className="mb-10">
            <div className="inline-flex flex-col">
              <span
                className="text-5xl font-extrabold tracking-tight leading-none"
                style={{ color: dark ? '#ffffff' : '#af2154' }}
              >
                aleri
              </span>
              <div
                className="mt-1 h-[3px] rounded-full"
                style={{
                  width: '70%',
                  background: dark
                    ? 'linear-gradient(90deg, #af2154 0%, #f58227 100%)'
                    : 'linear-gradient(90deg, #af2154 0%, #f58227 100%)',
                }}
              />
            </div>
            <p
              className="text-sm mt-3 font-medium"
              style={{ color: subtitleColor }}
            >
              Inicia sesión en tu cuenta
            </p>
          </div>

          <LoginForm
            register={register}
            handleSubmit={handleSubmit}
            errors={errors}
            onSubmit={onSubmit}
            loading={loading}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            dark={dark}
          />

          <p
            className="mt-10 text-xs transition-colors duration-300"
            style={{ color: footerColor }}
          >
            &copy; {new Date().getFullYear()} ALERI SSOMA — Todos los derechos reservados
          </p>
        </div>
      </div>

      {/* Panel derecho - Branding */}
      <div className="hidden lg:flex lg:w-[58%] xl:w-[62%]">
        <LoginBranding dark={dark} />
      </div>
    </div>
  )
}
