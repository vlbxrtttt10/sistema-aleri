import { useState } from 'react'
import { AlertTriangle, X, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../services/api.js'

export default function ModalEliminarColaborador({ dark, colaborador, onClose, onEliminado }) {
  const [eliminando, setEliminando] = useState(false)

  const cardBg     = dark ? '#1e293b' : '#ffffff'
  const cardBorder = dark ? '#334155' : '#f1f5f9'
  const titleColor = dark ? '#f1f5f9' : '#111827'
  const subColor   = dark ? '#94a3b8' : '#6b7280'
  const inputBd    = dark ? '#334155' : '#e5e7eb'

  const handleEliminar = () => {
    setEliminando(true)
    toast.promise(
      api.delete(`/colaboradores/${colaborador.id}`).then(() => {
        onEliminado(colaborador.id)
        onClose()
      }).finally(() => setEliminando(false)),
      {
        loading: 'Eliminando colaborador...',
        success: 'Colaborador eliminado',
        error:   (err) => err.response?.data?.mensaje || 'Error al eliminar',
      }
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={e => e.target === e.currentTarget && !eliminando && onClose()}>

      <div className="w-full max-w-sm rounded-2xl border shadow-2xl"
        style={{ backgroundColor: cardBg, borderColor: cardBorder }}>

        <div className="flex items-center justify-between px-6 py-5 border-b"
          style={{ borderColor: cardBorder }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: '#ef444418' }}>
              <AlertTriangle size={18} style={{ color: '#ef4444' }} />
            </div>
            <div>
              <p className="font-semibold text-sm" style={{ color: titleColor }}>Eliminar colaborador</p>
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
            <p className="font-bold text-base" style={{ color: titleColor }}>{colaborador.nombre}</p>
            <p className="text-xs" style={{ color: subColor }}>DNI: {colaborador.dni || '—'}</p>
          </div>

          <p className="text-sm" style={{ color: subColor }}>
            Se eliminará este colaborador y todos sus registros asociados. Esta acción no se puede deshacer.
          </p>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} disabled={eliminando}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors disabled:opacity-50"
              style={{ borderColor: inputBd, color: subColor }}>
              Cancelar
            </button>
            <button type="button" onClick={handleEliminar} disabled={eliminando}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: '#ef4444' }}>
              <Trash2 size={14} />
              {eliminando ? 'Eliminando...' : 'Eliminar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
