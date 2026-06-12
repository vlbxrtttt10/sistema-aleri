import { useState } from 'react'
import { AlertTriangle, X, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../services/api.js'
import ModalPortal from '../../components/ModalPortal.jsx'

export default function ModalEliminarSupervisor({ dark, supervisor, onClose, onEliminado }) {
  const [eliminando, setEliminando] = useState(false)
  const [confirmText, setConfirmText] = useState('')

  const cardBg     = dark ? '#1e293b' : '#ffffff'
  const cardBorder = dark ? '#334155' : '#f1f5f9'
  const titleColor = dark ? '#f1f5f9' : '#111827'
  const subColor   = dark ? '#94a3b8' : '#6b7280'
  const inputBg    = dark ? '#0f172a' : '#f9fafb'
  const inputBd    = dark ? '#334155' : '#e5e7eb'
  const inputColor = dark ? '#f1f5f9' : '#1f2937'

  const palabra = (supervisor.email || '').toLowerCase()
  const puedeEliminar = !eliminando && confirmText.trim().toLowerCase() === palabra

  const handleEliminar = () => {
    if (!puedeEliminar) return
    setEliminando(true)
    toast.promise(
      api.delete(`/supervisores/${supervisor.id}`).then(() => {
        onEliminado(supervisor.id)
        onClose()
      }).finally(() => setEliminando(false)),
      {
        loading: 'Eliminando supervisor...',
        success: 'Supervisor eliminado',
        error:   (err) => err.response?.data?.mensaje || 'Error al eliminar',
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

        <div className="flex items-center justify-between px-6 py-5 border-b"
          style={{ borderColor: cardBorder }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: '#ef444418' }}>
              <AlertTriangle size={18} style={{ color: '#ef4444' }} />
            </div>
            <div>
              <p className="font-semibold text-sm" style={{ color: titleColor }}>Eliminar supervisor</p>
              <p className="text-xs mt-0.5" style={{ color: subColor }}>Acción irreversible</p>
            </div>
          </div>
          <button onClick={onClose} disabled={eliminando}
            className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors disabled:opacity-50"
            style={{ color: subColor }}>
            <X size={17} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="rounded-xl p-4 border"
            style={{ backgroundColor: dark ? '#0f172a' : '#fafafa', borderColor: inputBd }}>
            <p className="text-xs font-medium mb-1" style={{ color: subColor }}>Estás por eliminar</p>
            <p className="font-bold text-base" style={{ color: titleColor }}>{supervisor.nombre}</p>
            <p className="text-xs" style={{ color: subColor }}>{supervisor.email}</p>
          </div>

          <p className="text-sm" style={{ color: subColor }}>
            Se eliminarán <strong style={{ color: '#ef4444' }}>todos los colaboradores</strong> asignados a este
            supervisor y se borrará su acceso al sistema. Esta acción no se puede deshacer.
          </p>

          <div>
            <p className="text-xs font-medium mb-1.5" style={{ color: subColor }}>
              Para confirmar, escribe el correo del supervisor
            </p>
            <input type="text" value={confirmText}
              onChange={e => setConfirmText(e.target.value)}
              placeholder={palabra}
              disabled={eliminando}
              className="w-full rounded-xl px-4 py-2.5 text-sm border focus:outline-none font-mono tracking-wide transition-all disabled:opacity-50"
              style={{ backgroundColor: inputBg, borderColor: inputBd, color: inputColor }}
              onFocus={e => { e.currentTarget.style.borderColor = '#ef4444'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(239,68,68,0.12)' }}
              onBlur={e => { e.currentTarget.style.borderColor = inputBd; e.currentTarget.style.boxShadow = 'none' }} />
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} disabled={eliminando}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors disabled:opacity-50"
              style={{ borderColor: inputBd, color: subColor }}>
              Cancelar
            </button>
            <button type="button" onClick={handleEliminar}
              disabled={!puedeEliminar}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#ef4444' }}>
              <Trash2 size={14} />
              {eliminando ? 'Eliminando...' : 'Eliminar'}
            </button>
          </div>
        </div>
      </div>
    </div>
    </ModalPortal>
  )
}
