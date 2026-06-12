import { useEffect, useState } from 'react'
import logo from '../assets/logo.png'

export default function LogoutTransition({ onDone }) {
  const [fase, setFase] = useState('entrada') // entrada → visible → salida

  useEffect(() => {
    const t1 = setTimeout(() => setFase('visible'), 50)
    const t2 = setTimeout(() => setFase('salida'), 1800)
    const t3 = setTimeout(() => onDone(), 2400)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [])

  return (
    <div
      className="fixed inset-0 z-[999] flex flex-col items-center justify-center gap-5"
      style={{
        background: 'linear-gradient(135deg, #af2154 0%, #83266d 50%, #f58227 100%)',
        opacity: fase === 'entrada' ? 0 : fase === 'visible' ? 1 : 0,
        transition: fase === 'entrada'
          ? 'opacity 0.4s ease'
          : 'opacity 0.6s ease',
      }}
    >
      {/* Logo */}
      <div
        style={{
          transform: fase === 'visible' ? 'scale(1)' : 'scale(0.85)',
          transition: 'transform 0.5s ease',
        }}
        className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-2xl"
      >
        <img src={logo} alt="ALERI" className="w-14 h-14 object-contain" />
      </div>

      {/* Texto */}
      <div className="text-center">
        <p className="text-white text-2xl font-extrabold tracking-tight drop-shadow">ALERI</p>
        <p className="text-white/70 text-sm mt-1">Cerrando sesion...</p>
      </div>

      {/* Barra de progreso */}
      <div className="w-48 h-1.5 bg-white/20 rounded-full overflow-hidden mt-2">
        <div
          className="h-full bg-white rounded-full"
          style={{
            width: fase === 'visible' ? '100%' : '0%',
            transition: fase === 'visible' ? 'width 1.6s ease' : 'none',
          }}
        />
      </div>
    </div>
  )
}
