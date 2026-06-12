import { useEffect, useState } from 'react'
import {
  AlertTriangle, X, Trash2, Users, HardHat,
  AlertOctagon, ShieldCheck, ClipboardList
} from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../services/api.js'
import ModalPortal from '../../components/ModalPortal.jsx'

/**
 * Modal de confirmación para eliminar una empresa.
 * Muestra cuántos registros se borrarán en cascada y exige escribir el RUC para confirmar.
 *
 * Props:
 *  - dark        boolean
 *  - empresa     { id, nombre, ruc, ... }
 *  - onClose     () => void
 *  - onEliminada (id) => void
 */
export default function ModalEliminar({ dark, empresa, onClose, onEliminada }) {
  const [contadores, setContadores] = useState(null)
  const [loading, setLoading]       = useState(true)
  const [eliminando, setEliminando] = useState(false)
  const [confirmText, setConfirmText] = useState('')

  const cardBg     = dark ? '#1e293b' : '#ffffff'
  const cardBorder = dark ? '#334155' : '#f1f5f9'
  const titleColor = dark ? '#f1f5f9' : '#111827'
  const subColor   = dark ? '#94a3b8' : '#6b7280'
  const inputBg    = dark ? '#0f172a' : '#f9fafb'
  const inputBd    = dark ? '#334155' : '#e5e7eb'
  const inputColor = dark ? '#f1f5f9' : '#1f2937'

  useEffect(() => {
    api.get(`/empresas/${empresa.id}/contadores`)
      .then(res => setContadores(res.data))
      .catch(err => toast.error(err.response?.data?.mensaje || 'No se pudo obtener contadores'))
      .finally(() => setLoading(false))
  }, [empresa.id])

  const items = contadores ? [
    { icon: Users,         label: 'Usuarios',          count: contadores.usuarios       },
    { icon: ShieldCheck,   label: 'Supervisores',      count: contadores.supervisores   },
    { icon: HardHat,       label: 'Colaboradores',     count: contadores.colaboradores  },
    { icon: AlertOctagon,  label: 'Incidentes',        count: contadores.incidentes     },
    { icon: ClipboardList, label: 'Asignaciones EPP',  count: contadores.asignacionesEpp },
  ] : []

  const totalRelacionados = contadores
    ? items.reduce((s, i) => s + i.count, 0)
    : 0

  const puedeEliminar = !loading && confirmText.trim() === empresa.ruc

  const handleEliminar = () => {
    if (!puedeEliminar || eliminando) return
    setEliminando(true)
    toast.promise(
      api.delete(`/empresas/${empresa.id}`).then(() => {
        onEliminada(empresa.id)
        onClose()
      }).finally(() => setEliminando(false)),
      {
        loading: 'Eliminando empresa...',
        success: 'Empresa eliminada',
        error: (err) => err.response?.data?.mensaje || 'Error al eliminar',
      }
    )
  }

  return (
    <ModalPortal>
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={e => e.target === e.currentTarget && !eliminando && onClose()}>

      <div className="w-full max-w-md rounded-2xl border shadow-2xl my-4"
        style={{ backgroundColor: cardBg, borderColor: cardBorder }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b"
          style={{ borderColor: cardBorder }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: '#ef444418' }}>
              <AlertTriangle size={18} style={{ color: '#ef4444' }} />
            </div>
            <div>
              <p className="font-semibold text-sm" style={{ color: titleColor }}>Eliminar empresa</p>
              <p className="text-xs mt-0.5" style={{ color: subColor }}>Esta acción es irreversible</p>
            </div>
          </div>
          <button onClick={onClose} disabled={eliminando}
            className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors disabled:opacity-50"
            style={{ color: subColor }}>
            <X size={17} />
          </button>
        </div>

        <div className="p-6 space-y-4">

          {/* Empresa */}
          <div className="rounded-xl p-4 border"
            style={{ backgroundColor: dark ? '#0f172a' : '#fafafa', borderColor: inputBd }}>
            <p className="text-xs font-medium mb-1" style={{ color: subColor }}>Estás por eliminar</p>
            <p className="font-bold text-base" style={{ color: titleColor }}>{empresa.nombre}</p>
            <p className="text-xs font-mono" style={{ color: subColor }}>RUC {empresa.ruc}</p>
          </div>

          {/* Lista de registros */}
          {loading ? (
            <p className="text-sm py-4 text-center" style={{ color: subColor }}>Calculando datos asociados...</p>
          ) : totalRelacionados === 0 ? (
            <div className="rounded-xl p-3 text-sm flex items-center gap-2"
              style={{ backgroundColor: dark ? '#0f172a' : '#f0fdf4', color: '#16a34a' }}>
              <ShieldCheck size={16} />
              No hay datos asociados, se eliminará limpiamente.
            </div>
          ) : (
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#ef4444' }}>
                Se eliminarán también:
              </p>
              <div className="rounded-xl border divide-y"
                style={{ borderColor: inputBd, divideColor: inputBd }}>
                {items.filter(i => i.count > 0).map(({ icon: Icon, label, count }) => (
                  <div key={label} className="flex items-center justify-between px-4 py-2.5"
                    style={{ borderColor: inputBd, backgroundColor: dark ? '#0f172a' : '#fafafa' }}>
                    <div className="flex items-center gap-2.5">
                      <Icon size={14} style={{ color: '#ef4444' }} />
                      <span className="text-sm" style={{ color: titleColor }}>{label}</span>
                    </div>
                    <span className="text-sm font-bold tabular-nums" style={{ color: '#ef4444' }}>
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Confirmación por RUC */}
          <div>
            <p className="text-xs font-medium mb-1.5" style={{ color: subColor }}>
              Para confirmar, escribe el RUC <span className="font-mono font-bold" style={{ color: titleColor }}>{empresa.ruc}</span>
            </p>
            <input type="text"
              value={confirmText}
              onChange={e => setConfirmText(e.target.value)}
              placeholder={empresa.ruc}
              disabled={eliminando}
              className="w-full rounded-xl px-4 py-2.5 text-sm border focus:outline-none font-mono tracking-wider transition-all disabled:opacity-50"
              style={{ backgroundColor: inputBg, borderColor: inputBd, color: inputColor }}
              onFocus={e => { e.currentTarget.style.borderColor = '#ef4444'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(239,68,68,0.12)' }}
              onBlur={e => { e.currentTarget.style.borderColor = inputBd; e.currentTarget.style.boxShadow = 'none' }} />
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} disabled={eliminando}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors disabled:opacity-50"
              style={{ borderColor: inputBd, color: subColor }}
              onMouseEnter={e => !eliminando && (e.currentTarget.style.backgroundColor = dark ? '#334155' : '#f8fafc')}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
              Cancelar
            </button>
            <button type="button" onClick={handleEliminar}
              disabled={!puedeEliminar || eliminando}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#ef4444' }}>
              <Trash2 size={14} />
              {eliminando ? 'Eliminando...' : 'Eliminar definitivamente'}
            </button>
          </div>
        </div>
      </div>
    </div>
    </ModalPortal>
  )
}
