import { useEffect, useState } from 'react'
import { X, User, Hash, Briefcase, Building, Calendar } from 'lucide-react'
import api from '../../services/api.js'
import toast from 'react-hot-toast'

const VACIO = { nombre: '', dni: '', cargo: '', area: '', fechaIngreso: '', supervisorId: '' }

export default function ModalColaborador({ dark, onClose, onGuardado }) {
  const [form,        setForm]        = useState(VACIO)
  const [supervisores, setSupervisores] = useState([])
  const [guardando,   setGuardando]   = useState(false)

  const bg      = dark ? '#1e293b' : '#ffffff'
  const border  = dark ? '#334155' : '#e2e8f0'
  const title   = dark ? '#f1f5f9' : '#111827'
  const sub     = dark ? '#64748b' : '#9ca3af'
  const inputBg = dark ? '#0f172a' : '#f8fafc'
  const inputTx = dark ? '#f1f5f9' : '#111827'

  useEffect(() => {
    api.get('/colaboradores/supervisores')
      .then(res => setSupervisores(res.data))
      .catch(() => toast.error('No se pudieron cargar los supervisores'))
  }, [])

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const handleSubmit = e => {
    e.preventDefault()
    if (!form.nombre || !form.dni || !form.supervisorId) {
      toast.error('Nombre, DNI y supervisor son obligatorios')
      return
    }
    setGuardando(true)
    api.post('/colaboradores', {
      nombre:       form.nombre,
      dni:          form.dni,
      cargo:        form.cargo || null,
      area:         form.area  || null,
      fechaIngreso: form.fechaIngreso || null,
      supervisorId: Number(form.supervisorId),
    })
      .then(res => {
        toast.success('Colaborador creado correctamente')
        onGuardado(res.data)
        onClose()
      })
      .catch(err => toast.error(err.response?.data?.mensaje || 'Error al guardar'))
      .finally(() => setGuardando(false))
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="rounded-2xl shadow-2xl w-full max-w-md" style={{ backgroundColor: bg, border: `1px solid ${border}` }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: border }}>
          <div>
            <p className="font-bold text-base" style={{ color: title }}>Nuevo colaborador</p>
            <p className="text-xs mt-0.5" style={{ color: sub }}>Datos del colaborador</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:opacity-70 transition-opacity" style={{ color: sub }}>
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <Campo label="Nombre completo *" icon={<User size={14} />} dark={dark}>
            <input name="nombre" value={form.nombre} onChange={handleChange}
              placeholder="Ej: Juan Mamani"
              style={{ backgroundColor: inputBg, color: inputTx, borderColor: border }}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border focus:outline-none focus:border-pink-500" />
          </Campo>

          <Campo label="DNI *" icon={<Hash size={14} />} dark={dark}>
            <input name="dni" value={form.dni} onChange={handleChange}
              placeholder="12345678" maxLength={20}
              style={{ backgroundColor: inputBg, color: inputTx, borderColor: border }}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border focus:outline-none focus:border-pink-500" />
          </Campo>

          <div className="grid grid-cols-2 gap-3">
            <Campo label="Cargo" icon={<Briefcase size={14} />} dark={dark}>
              <input name="cargo" value={form.cargo} onChange={handleChange}
                placeholder="Ej: Operario"
                style={{ backgroundColor: inputBg, color: inputTx, borderColor: border }}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border focus:outline-none focus:border-pink-500" />
            </Campo>
            <Campo label="Área" icon={<Building size={14} />} dark={dark}>
              <input name="area" value={form.area} onChange={handleChange}
                placeholder="Ej: Producción"
                style={{ backgroundColor: inputBg, color: inputTx, borderColor: border }}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border focus:outline-none focus:border-pink-500" />
            </Campo>
          </div>

          <Campo label="Fecha de ingreso" icon={<Calendar size={14} />} dark={dark}>
            <input type="date" name="fechaIngreso" value={form.fechaIngreso} onChange={handleChange}
              style={{ backgroundColor: inputBg, color: inputTx, borderColor: border }}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border focus:outline-none focus:border-pink-500" />
          </Campo>

          <div className="space-y-1">
            <label className="text-xs font-medium" style={{ color: sub }}>Supervisor *</label>
            <select name="supervisorId" value={form.supervisorId} onChange={handleChange}
              style={{ backgroundColor: inputBg, color: inputTx, borderColor: border }}
              className="w-full px-3 py-2 text-sm rounded-xl border focus:outline-none focus:border-pink-500">
              <option value="">Seleccionar supervisor...</option>
              {supervisores.map(s => (
                <option key={s.id} value={s.id}>
                  {s.usuario?.nombre} — {s.area || s.cargo || 'Sin área'}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{ backgroundColor: dark ? '#0f172a' : '#f1f5f9', color: sub, border: `1px solid ${border}` }}>
              Cancelar
            </button>
            <button type="submit" disabled={guardando}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50"
              style={{ backgroundColor: '#af2154' }}>
              {guardando ? 'Guardando...' : 'Crear colaborador'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Campo({ label, icon, children }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-gray-400">{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{icon}</span>
        {children}
      </div>
    </div>
  )
}
