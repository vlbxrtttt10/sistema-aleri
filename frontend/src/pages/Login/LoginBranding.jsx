import { ShieldCheck, Zap, Smartphone } from 'lucide-react'
import Plasma from '../../components/Plasma/Plasma.jsx'

const badges = [
  { icon: ShieldCheck, label: 'Seguro' },
  { icon: Zap,         label: 'Rápido' },
  { icon: Smartphone,  label: 'Responsive' },
]

export default function LoginBranding({ dark = true }) {
  const bgColor = dark ? '#0a0a0b' : '#af2154'

  return (
    <div
      className="w-full flex flex-col items-center justify-center relative overflow-hidden px-12 py-16"
      style={{ background: bgColor }}
    >
      {/* Plasma de fondo (sutil) */}
      <div className="absolute inset-0 opacity-40">
        <Plasma
          color={dark ? '#af2154' : '#f58227'}
          speed={0.35}
          direction="forward"
          scale={1.4}
          opacity={dark ? 0.45 : 0.55}
          mouseInteractive={true}
        />
      </div>

      {/* Capa de estrellas / constelación */}
      <div className="absolute inset-0 stars-layer pointer-events-none" />
      <div className="absolute inset-0 stars-layer-2 pointer-events-none" />

      {/* Glow radial central muy sutil */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, rgba(175,33,84,0.18) 0%, rgba(0,0,0,0) 60%)',
        }}
      />

      {/* Contenido central */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-md">
        {/* Logo wordmark grande */}
        <div className="flex flex-col items-center mb-2">
          <span className="text-7xl xl:text-8xl font-extrabold text-white tracking-tight leading-none drop-shadow-[0_2px_20px_rgba(175,33,84,0.5)]">
            aleri
          </span>
          <div
            className="mt-2 h-[4px] rounded-full"
            style={{
              width: '70%',
              background: 'linear-gradient(90deg, #af2154 0%, #f58227 100%)',
              boxShadow: '0 0 20px rgba(245,130,39,0.5)',
            }}
          />
        </div>

        {/* Título */}
        <h2 className="text-3xl xl:text-4xl font-bold text-white mt-10 tracking-tight">
          Sistema SSOMA
        </h2>

        {/* Subtítulo */}
        <p className="text-white/65 text-base xl:text-lg mt-4 leading-relaxed max-w-sm">
          Gestiona la seguridad y salud ocupacional
          de tus colaboradores de manera inteligente
        </p>

        {/* Badges */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-10">
          {badges.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full
                bg-white/[0.06] backdrop-blur-md border border-white/10
                text-white/85 text-sm font-medium
                hover:bg-white/[0.1] hover:border-white/20 transition-all duration-200"
            >
              <Icon size={15} strokeWidth={2} className="text-white/80" />
              {label}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
