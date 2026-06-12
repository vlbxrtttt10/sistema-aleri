import { useEffect, useState } from 'react'
import { HardHat, ShieldCheck, AlertTriangle, Package, Plus, X, TrendingUp } from 'lucide-react'
import api from '../../services/api'
import toast from 'react-hot-toast'

const CATEGORIAS = [
  { value: 'CABEZA',       label: 'Cabeza' },
  { value: 'OJOS_CARA',    label: 'Ojos / Cara' },
  { value: 'MANOS',        label: 'Manos' },
  { value: 'PIES',         label: 'Pies' },
  { value: 'CUERPO',       label: 'Cuerpo' },
  { value: 'RESPIRATORIO', label: 'Respiratorio' },
  { value: 'AUDITIVO',     label: 'Auditivo' },
  { value: 'ALTURA',       label: 'Altura' },
]

const CATEGORIA_LABEL = Object.fromEntries(CATEGORIAS.map(c => [c.value, c.label]))

const FORM_VACIO = { nombre: '', categoria: '', colaboradorId: '', fechaEntrega: '', fechaVencimiento: '' }

export default function EppsPage() {
  const [resumen,       setResumen]       = useState(null)
  const [epps,          setEpps]          = useState([])
  const [colaboradores, setColaboradores] = useState([])
  const [cargando,      setCargando]      = useState(true)
  const [modalAbierto,  setModalAbierto]  = useState(false)
  const [form,          setForm]          = useState(FORM_VACIO)
  const [guardando,     setGuardando]     = useState(false)

  function cargar() {
    return Promise.all([
      api.get('/epps/resumen'),
      api.get('/epps'),
      api.get('/epps/colaboradores'),
    ]).then(([resRes, listRes, colRes]) => {
      setResumen(resRes.data)
      setEpps(listRes.data)
      setColaboradores(colRes.data)
    })
  }

  useEffect(() => {
    cargar()
      .catch(() => toast.error('No se pudieron cargar los EPPs'))
      .finally(() => setCargando(false))
  }, [])

  function abrirModal() {
    if (limiteSuperado) {
      toast.error('Límite de EPPs alcanzado. Escala tu plan para agregar más.', { duration: 4000 })
      return
    }
    setForm(FORM_VACIO)
    setModalAbierto(true)
  }
  function cerrarModal() { setModalAbierto(false) }

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.nombre || !form.categoria || !form.colaboradorId || !form.fechaEntrega) {
      toast.error('Completa los campos obligatorios')
      return
    }
    setGuardando(true)
    api.post('/epps', {
      nombre:           form.nombre,
      categoria:        form.categoria,
      colaboradorId:    Number(form.colaboradorId),
      fechaEntrega:     form.fechaEntrega,
      fechaVencimiento: form.fechaVencimiento || null,
    })
      .then(() => {
        toast.success('EPP registrado correctamente')
        cerrarModal()
        cargar()
      })
      .catch(err => {
        const data = err.response?.data
        if (data?.limiteSuperado) {
          cerrarModal()
          toast.error(data.mensaje, { duration: 5000 })
        } else {
          toast.error(data?.mensaje || 'Error al guardar')
        }
      })
      .finally(() => setGuardando(false))
  }

  const limiteEpps   = resumen?.limite ?? -1
  const totalEpps    = resumen?.total  ?? 0
  const limiteSuperado = limiteEpps !== -1 && totalEpps >= limiteEpps
  const porcentaje   = limiteEpps > 0 ? Math.min((totalEpps / limiteEpps) * 100, 100) : 0

  function estadoVencimiento(fecha) {
    if (!fecha) return { label: 'Sin vencimiento', color: 'text-gray-400' }
    const dias = Math.ceil((new Date(fecha) - new Date()) / (1000 * 60 * 60 * 24))
    if (dias < 0)   return { label: 'Vencido',           color: 'text-red-400' }
    if (dias <= 30) return { label: `Vence en ${dias}d`, color: 'text-yellow-400' }
    return { label: 'Vigente', color: 'text-green-400' }
  }

  if (cargando) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400">Cargando EPPs...</p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <HardHat size={28} className="text-primary-500" />
          <div>
            <h1 className="text-2xl font-bold text-white">Gestión de EPPs</h1>
            <p className="text-sm text-gray-400">Equipos de Protección Personal asignados</p>
          </div>
        </div>
        <button
          onClick={abrirModal}
          title={limiteSuperado ? 'Límite de EPPs alcanzado' : ''}
          className={`flex items-center gap-2 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors
            ${limiteSuperado
              ? 'bg-gray-600 cursor-not-allowed opacity-60'
              : 'bg-primary-500 hover:bg-primary-600'}`}
        >
          <Plus size={16} /> Nuevo EPP
        </button>
      </div>

      {/* Aviso límite superado */}
      {limiteSuperado && (
        <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-xl p-4">
          <TrendingUp size={20} className="text-red-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-red-300 font-semibold">Límite de EPPs alcanzado ({limiteEpps}/{limiteEpps})</p>
            <p className="text-red-400 text-sm mt-0.5">Tu plan actual no permite más EPPs. Contacta al administrador para escalar tu plan y continuar registrando equipos.</p>
          </div>
        </div>
      )}

      {/* Tarjetas resumen */}
      {resumen && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard icon={<Package size={22} className="text-blue-400" />}       label="Total EPPs"            value={resumen.total}           bg="bg-blue-500/10" />
          <StatCard icon={<ShieldCheck size={22} className="text-green-400" />}  label="Vigentes"              value={resumen.vigentes}         bg="bg-green-500/10" />
          <StatCard icon={<AlertTriangle size={22} className="text-yellow-400" />} label="Próximos a vencer (30d)" value={resumen.proximosAVencer} bg="bg-yellow-500/10" />
        </div>
      )}

      {/* Barra de uso del plan */}
      {limiteEpps !== -1 && (
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Uso del plan</span>
            <span className={limiteSuperado ? 'text-red-400 font-semibold' : 'text-gray-300'}>
              {totalEpps} / {limiteEpps} EPPs
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${limiteSuperado ? 'bg-red-500' : porcentaje >= 80 ? 'bg-yellow-500' : 'bg-green-500'}`}
              style={{ width: `${porcentaje}%` }}
            />
          </div>
        </div>
      )}

      {/* Tabla */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-700/50">
            <tr>
              {['EPP', 'Categoría', 'Colaborador', 'Área', 'Fecha entrega', 'Vencimiento', 'Estado'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-gray-300 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {epps.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-10 text-gray-500">No hay EPPs registrados</td></tr>
            ) : epps.map(epp => {
              const estado = estadoVencimiento(epp.fechaVencimiento)
              return (
                <tr key={epp.id} className="border-t border-gray-700 hover:bg-gray-700/30 transition-colors">
                  <td className="px-4 py-3 text-white font-medium">{epp.nombre}</td>
                  <td className="px-4 py-3 text-gray-300">{CATEGORIA_LABEL[epp.categoria] ?? epp.categoria}</td>
                  <td className="px-4 py-3 text-gray-300">{epp.colaborador?.nombre ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-300">{epp.colaborador?.area ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-400">{epp.fechaEntrega ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-400">{epp.fechaVencimiento ?? '—'}</td>
                  <td className={`px-4 py-3 font-medium ${estado.color}`}>{estado.label}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Modal nuevo EPP */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-gray-700">
              <h2 className="text-lg font-semibold text-white">Nuevo EPP</h2>
              <button onClick={cerrarModal} className="text-gray-400 hover:text-white"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <Field label="Nombre del EPP *">
                <input name="nombre" value={form.nombre} onChange={handleChange}
                  placeholder="Ej: Casco de seguridad"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary-500" />
              </Field>
              <Field label="Categoría *">
                <select name="categoria" value={form.categoria} onChange={handleChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary-500">
                  <option value="">Seleccionar...</option>
                  {CATEGORIAS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </Field>
              <Field label="Colaborador *">
                <select name="colaboradorId" value={form.colaboradorId} onChange={handleChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary-500">
                  <option value="">Seleccionar...</option>
                  {colaboradores.map(c => <option key={c.id} value={c.id}>{c.nombre} — {c.area}</option>)}
                </select>
              </Field>
              <Field label="Fecha de entrega *">
                <input type="date" name="fechaEntrega" value={form.fechaEntrega} onChange={handleChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary-500" />
              </Field>
              <Field label="Fecha de vencimiento">
                <input type="date" name="fechaVencimiento" value={form.fechaVencimiento} onChange={handleChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary-500" />
              </Field>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={cerrarModal}
                  className="flex-1 py-2 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-700 text-sm transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={guardando}
                  className="flex-1 py-2 rounded-lg bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white text-sm font-medium transition-colors">
                  {guardando ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ icon, label, value, bg }) {
  return (
    <div className={`${bg} border border-gray-700 rounded-xl p-4 flex items-center gap-4`}>
      <div className="p-3 bg-gray-800 rounded-lg">{icon}</div>
      <div>
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-xs text-gray-400">{label}</p>
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div className="space-y-1">
      <label className="text-xs text-gray-400">{label}</label>
      {children}
    </div>
  )
}
