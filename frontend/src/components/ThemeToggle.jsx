import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../context/ThemeContext.jsx'

export default function ThemeToggle({ className = '' }) {
  const { dark, toggle } = useTheme()

  return (
    <button
      onClick={toggle}
      aria-label={dark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      title={dark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      className={`inline-flex items-center justify-center w-10 h-10 rounded-xl border transition-all duration-200 shadow-sm cursor-pointer
        ${dark
          ? 'bg-gray-800 border-gray-700 text-yellow-400 hover:bg-gray-700'
          : 'bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200'
        } ${className}`}
    >
      {dark
        ? <Sun size={18} strokeWidth={2} />
        : <Moon size={18} strokeWidth={2} />
      }
    </button>
  )
}
