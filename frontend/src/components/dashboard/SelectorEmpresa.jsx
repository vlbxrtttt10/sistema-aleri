import { useEffect, useRef, useState } from 'react'
import { Building2, ChevronDown, Check, Globe } from 'lucide-react'

/**
 * Dropdown para que el ADMIN cambie la vista del dashboard entre:
 *  - "Vista global" (todas las empresas) → empresaId = null
 *  - Una empresa concreta              → empresaId = id
 *
 * Diseñado para ir sobre el banner gradiente (usa colores claros sobre fondo oscuro).
 *
 * Props:
 *  - empresas      [{id, nombre, planNombre}]
 *  - empresaId     id seleccionado (null = global)
 *  - onChange      (id|null) => void
 */
export default function SelectorEmpresa({ empresas = [], empresaId, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  /* Cerrar al hacer click fuera */
  useEffect(() => {
    const onClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  const seleccionada = empresas.find(e => e.id === empresaId)
  const labelActual = seleccionada ? seleccionada.nombre : 'Vista global'

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white transition-all"
        style={{
          backgroundColor: 'rgba(255,255,255,0.15)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.25)',
        }}
        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.22)'}
        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)'}
      >
        {seleccionada ? (
          <Building2 size={14} className="text-white/80" />
        ) : (
          <Globe size={14} className="text-white/80" />
        )}
        <span className="max-w-[200px] truncate">{labelActual}</span>
        <ChevronDown size={14}
          className="text-white/70 transition-transform"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-72 rounded-xl shadow-2xl overflow-hidden border"
          style={{
            backgroundColor: '#1e293b',
            borderColor: '#334155',
            zIndex: 50,
          }}>

          {/* Header */}
          <div className="px-4 py-2.5 border-b" style={{ borderColor: '#334155' }}>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-white/50">
              Cambiar vista
            </p>
          </div>

          {/* Opción Vista global */}
          <button
            type="button"
            onClick={() => { onChange(null); setOpen(false) }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors"
            style={{
              backgroundColor: empresaId === null ? 'rgba(175,33,84,0.15)' : 'transparent',
            }}
            onMouseEnter={e => {
              if (empresaId !== null) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'
            }}
            onMouseLeave={e => {
              if (empresaId !== null) e.currentTarget.style.backgroundColor = 'transparent'
            }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #af2154, #f58227)' }}>
              <Globe size={14} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white">Vista global</p>
              <p className="text-[11px] text-white/50">Datos consolidados de todas</p>
            </div>
            {empresaId === null && <Check size={15} style={{ color: '#af2154' }} />}
          </button>

          {/* Lista de empresas */}
          {empresas.length > 0 && (
            <div className="max-h-72 overflow-y-auto border-t" style={{ borderColor: '#334155' }}>
              <div className="px-4 py-2 sticky top-0"
                style={{ backgroundColor: '#1e293b' }}>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-white/50">
                  Por empresa ({empresas.length})
                </p>
              </div>

              {empresas.map(emp => {
                const activa = empresaId === emp.id
                return (
                  <button
                    key={emp.id}
                    type="button"
                    onClick={() => { onChange(emp.id); setOpen(false) }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors"
                    style={{
                      backgroundColor: activa ? 'rgba(175,33,84,0.15)' : 'transparent',
                    }}
                    onMouseEnter={e => {
                      if (!activa) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'
                    }}
                    onMouseLeave={e => {
                      if (!activa) e.currentTarget.style.backgroundColor = 'transparent'
                    }}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, #af2154, #83266d)' }}>
                      {emp.nombre.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{emp.nombre}</p>
                      <p className="text-[11px] text-white/50 truncate">
                        Plan {emp.planNombre || '—'}
                      </p>
                    </div>
                    {activa && <Check size={15} style={{ color: '#af2154' }} />}
                  </button>
                )
              })}
            </div>
          )}

          {empresas.length === 0 && (
            <div className="px-4 py-6 text-center text-xs text-white/50">
              No hay empresas registradas
            </div>
          )}
        </div>
      )}
    </div>
  )
}
