import { useEffect, useRef, useState } from 'react'
import {
  HardHat, ShieldCheck, AlertTriangle, Package, Plus, X, Edit2, Trash2,
  ChevronDown, FileText, BarChart2, List, Image as ImageIcon, CheckCircle,
  Archive, AlertCircle, TrendingUp, RefreshCw, Eye
} from 'lucide-react'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { useTheme } from '../../context/ThemeContext.jsx'
import ModalPortal from '../../components/ModalPortal.jsx'

// ─── Constantes ────────────────────────────────────────────────────────────────

const CATEGORIAS = [
  { value: 'CABEZA',       label: 'Cabeza',       color: '#af2154' },
  { value: 'OJOS_CARA',    label: 'Ojos / Cara',  color: '#3b82f6' },
  { value: 'MANOS',        label: 'Manos',        color: '#f59e0b' },
  { value: 'PIES',         label: 'Pies',         color: '#10b981' },
  { value: 'CUERPO',       label: 'Cuerpo',       color: '#6366f1' },
  { value: 'RESPIRATORIO', label: 'Respiratorio', color: '#ec4899' },
  { value: 'AUDITIVO',     label: 'Auditivo',     color: '#f97316' },
  { value: 'ALTURA',       label: 'Altura',       color: '#14b8a6' },
]
const CAT_MAP = Object.fromEntries(CATEGORIAS.map(c => [c.value, c]))

const FORM_EPP_VACIO = { nombre: '', descripcion: '', categoria: '', stockTotal: '', imagenUrl: '' }
const FORM_ASIG_VACIO = { eppId: '', colaboradorId: '', fechaEntrega: '', fechaVencimiento: '', cantidad: '1' }

// ─── Helpers ──────────────────────────────────────────────────────────────────

function estadoVencimiento(fecha) {
  if (!fecha) return { label: 'Sin vencimiento', color: '#6b7280', bg: '#6b728015' }
  const dias = Math.ceil((new Date(fecha + 'T00:00:00') - new Date()) / 86400000)
  if (dias < 0)   return { label: 'Vencido',           color: '#ef4444', bg: '#ef444415' }
  if (dias <= 30) return { label: `Vence en ${dias}d`, color: '#f59e0b', bg: '#f59e0b15' }
  return { label: 'Vigente', color: '#16a34a', bg: '#16a34a15' }
}

function stockEstado(disponible, total) {
  if (disponible === 0) return { label: 'Sin stock', color: '#ef4444' }
  const pct = total > 0 ? disponible / total : 1
  if (pct <= 0.2)  return { label: 'Stock bajo', color: '#f59e0b' }
  return { label: 'Disponible', color: '#16a34a' }
}

// ─── Componente Donut SVG ─────────────────────────────────────────────────────

function DonutChart({ data, dark }) {
  const size = 140
  const radius = 52
  const cx = size / 2
  const cy = size / 2
  const circumference = 2 * Math.PI * radius
  const total = data.reduce((s, d) => s + d.value, 0)

  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-36">
        <p className="text-sm" style={{ color: dark ? '#64748b' : '#9ca3af' }}>Sin datos</p>
      </div>
    )
  }

  let cumulative = 0
  const segments = data.map(d => {
    const pct = d.value / total
    const offset = circumference * (1 - cumulative)
    const dash = circumference * pct
    cumulative += pct
    return { ...d, offset, dash }
  }).filter(d => d.value > 0)

  return (
    <div className="flex items-center gap-4 flex-wrap justify-center">
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {segments.map((seg, i) => (
          <circle
            key={i}
            cx={cx} cy={cy} r={radius}
            fill="none"
            stroke={seg.color}
            strokeWidth={18}
            strokeDasharray={`${seg.dash} ${circumference - seg.dash}`}
            strokeDashoffset={seg.offset}
            strokeLinecap="butt"
          />
        ))}
        {/* Texto central */}
        <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central"
          style={{ transform: 'rotate(90deg)', transformOrigin: `${cx}px ${cy}px`, fill: dark ? '#f1f5f9' : '#111827', fontSize: 22, fontWeight: 700 }}>
          {total}
        </text>
        <text x={cx} y={cy + 16} textAnchor="middle" dominantBaseline="central"
          style={{ transform: 'rotate(90deg)', transformOrigin: `${cx}px ${cy + 16}px`, fill: dark ? '#64748b' : '#9ca3af', fontSize: 10 }}>
          asign.
        </text>
      </svg>
      <div className="space-y-1.5">
        {segments.map((seg, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
            <span style={{ color: dark ? '#94a3b8' : '#6b7280' }}>{seg.label}</span>
            <span className="font-bold ml-auto pl-2" style={{ color: dark ? '#f1f5f9' : '#111827' }}>{seg.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Bar horizontal chart ─────────────────────────────────────────────────────

function BarChart({ data, dark }) {
  const max = Math.max(...data.map(d => d.value), 1)
  return (
    <div className="space-y-2">
      {data.map((d, i) => (
        <div key={i} className="space-y-0.5">
          <div className="flex justify-between text-xs">
            <span style={{ color: dark ? '#94a3b8' : '#6b7280' }}>{d.label}</span>
            <span className="font-bold" style={{ color: dark ? '#f1f5f9' : '#111827' }}>{d.value}</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: dark ? '#334155' : '#e2e8f0' }}>
            <div className="h-full rounded-full transition-all duration-700"
              style={{ width: `${(d.value / max) * 100}%`, backgroundColor: d.color }} />
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Modal Catálogo (crear/editar EPP) ────────────────────────────────────────

function ModalCatalogo({ dark, eppEditar, empresaId, onClose, onGuardado }) {
  const editando = !!eppEditar
  const [form, setForm] = useState(
    editando ? {
      nombre:      eppEditar.nombre      || '',
      descripcion: eppEditar.descripcion || '',
      categoria:   eppEditar.categoria   || '',
      stockTotal:  String(eppEditar.stockTotal ?? ''),
      imagenUrl:   eppEditar.imagenUrl   || '',
    } : FORM_EPP_VACIO
  )
  const [guardando, setGuardando] = useState(false)
  const [previewImg, setPreviewImg] = useState(eppEditar?.imagenUrl || '')

  const cardBg  = dark ? '#1e293b' : '#ffffff'
  const border  = dark ? '#334155' : '#e2e8f0'
  const title   = dark ? '#f1f5f9' : '#111827'
  const sub     = dark ? '#64748b' : '#9ca3af'
  const inputBg = dark ? '#0f172a' : '#f8fafc'
  const inputTx = dark ? '#f1f5f9' : '#111827'

  const handleChange = e => {
    const { name, value } = e.target
    setForm(p => ({ ...p, [name]: value }))
    if (name === 'imagenUrl') setPreviewImg(value)
  }

  const handleSubmit = e => {
    e.preventDefault()
    if (!form.nombre || !form.categoria || !form.stockTotal) {
      toast.error('Nombre, categoría y stock son obligatorios')
      return
    }
    if (isNaN(Number(form.stockTotal)) || Number(form.stockTotal) < 0) {
      toast.error('Stock debe ser un número válido')
      return
    }
    setGuardando(true)
    const payload = {
      nombre:      form.nombre.trim(),
      descripcion: form.descripcion.trim() || null,
      categoria:   form.categoria,
      stockTotal:  Number(form.stockTotal),
      imagenUrl:   form.imagenUrl.trim() || null,
    }
    const params = empresaId ? `?empresaId=${empresaId}` : ''
    const req = editando
      ? api.put(`/epps/catalogo/${eppEditar.id}${params}`, payload)
      : api.post(`/epps/catalogo${params}`, payload)

    req.then(res => {
      toast.success(editando ? 'EPP actualizado' : 'EPP agregado al catálogo')
      onGuardado(res.data)
      onClose()
    })
    .catch(err => toast.error(err.response?.data?.mensaje || 'Error al guardar'))
    .finally(() => setGuardando(false))
  }

  const inputCls = "w-full px-4 py-2.5 text-sm rounded-xl border focus:outline-none transition-all"
  const fi = e => { e.currentTarget.style.borderColor = '#af2154'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(175,33,84,0.12)' }
  const fo = e => { e.currentTarget.style.borderColor = border; e.currentTarget.style.boxShadow = 'none' }

  return (
    <ModalPortal>
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.65)' }}
      onClick={e => e.target === e.currentTarget && !guardando && onClose()}>
      <div className="w-full max-w-lg rounded-2xl border shadow-2xl overflow-y-auto"
        style={{ backgroundColor: dark ? '#1e293b' : '#ffffff', borderColor: border, maxHeight: '90vh' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: border }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#af215418' }}>
              <HardHat size={18} style={{ color: '#af2154' }} />
            </div>
            <div>
              <p className="font-semibold text-sm" style={{ color: title }}>{editando ? 'Editar EPP' : 'Agregar al catálogo'}</p>
              <p className="text-xs mt-0.5" style={{ color: sub }}>Define el tipo y stock inicial</p>
            </div>
          </div>
          <button onClick={onClose} disabled={guardando} className="w-8 h-8 flex items-center justify-center rounded-lg" style={{ color: sub }}>
            <X size={17} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Nombre */}
          <div className="space-y-1">
            <label className="text-xs font-medium" style={{ color: sub }}>Nombre del EPP *</label>
            <input name="nombre" value={form.nombre} onChange={handleChange} placeholder="Ej: Casco de seguridad ABS"
              style={{ backgroundColor: inputBg, borderColor: border, color: inputTx }}
              className={inputCls} onFocus={fi} onBlur={fo} />
          </div>

          {/* Descripción */}
          <div className="space-y-1">
            <label className="text-xs font-medium" style={{ color: sub }}>Descripción</label>
            <textarea name="descripcion" value={form.descripcion} onChange={handleChange} rows={2}
              placeholder="Detalles adicionales..."
              style={{ backgroundColor: inputBg, borderColor: border, color: inputTx, resize: 'none' }}
              className={inputCls} onFocus={fi} onBlur={fo} />
          </div>

          {/* Categoría + Stock */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium" style={{ color: sub }}>Categoría *</label>
              <select name="categoria" value={form.categoria} onChange={handleChange}
                style={{ backgroundColor: inputBg, borderColor: border, color: inputTx }}
                className={inputCls} onFocus={fi} onBlur={fo}>
                <option value="">Seleccionar...</option>
                {CATEGORIAS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium" style={{ color: sub }}>Stock total *</label>
              <input type="number" name="stockTotal" value={form.stockTotal} onChange={handleChange}
                placeholder="Ej: 10" min="0"
                style={{ backgroundColor: inputBg, borderColor: border, color: inputTx }}
                className={inputCls} onFocus={fi} onBlur={fo} />
            </div>
          </div>

          {/* Imagen URL */}
          <div className="space-y-1">
            <label className="text-xs font-medium" style={{ color: sub }}>URL de imagen (opcional)</label>
            <input name="imagenUrl" value={form.imagenUrl} onChange={handleChange}
              placeholder="https://..."
              style={{ backgroundColor: inputBg, borderColor: border, color: inputTx }}
              className={inputCls} onFocus={fi} onBlur={fo} />
            {previewImg && (
              <div className="mt-2 rounded-xl overflow-hidden border flex items-center justify-center"
                style={{ borderColor: border, backgroundColor: dark ? '#0f172a' : '#f8fafc', height: 80 }}>
                <img src={previewImg} alt="preview" className="max-h-full max-w-full object-contain"
                  onError={e => { e.target.style.display = 'none' }} />
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} disabled={guardando}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all disabled:opacity-50"
              style={{ borderColor: border, color: sub }}>Cancelar</button>
            <button type="submit" disabled={guardando}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: '#af2154' }}>
              {guardando ? 'Guardando...' : editando ? 'Guardar cambios' : 'Agregar EPP'}
            </button>
          </div>
        </form>
      </div>
    </div>
    </ModalPortal>
  )
}

// ─── Modal Asignación ─────────────────────────────────────────────────────────

function ModalAsignacion({ dark, catalogo, colaboradores, empresaId, onClose, onGuardado }) {
  const [form, setForm] = useState(FORM_ASIG_VACIO)
  const [guardando, setGuardando] = useState(false)

  const cardBg  = dark ? '#1e293b' : '#ffffff'
  const border  = dark ? '#334155' : '#e2e8f0'
  const title   = dark ? '#f1f5f9' : '#111827'
  const sub     = dark ? '#64748b' : '#9ca3af'
  const inputBg = dark ? '#0f172a' : '#f8fafc'
  const inputTx = dark ? '#f1f5f9' : '#111827'

  const eppSeleccionado = catalogo.find(e => String(e.id) === String(form.eppId))

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const handleSubmit = e => {
    e.preventDefault()
    if (!form.eppId || !form.colaboradorId || !form.fechaEntrega) {
      toast.error('EPP, colaborador y fecha de entrega son obligatorios')
      return
    }
    if (eppSeleccionado && eppSeleccionado.stockDisponible < Number(form.cantidad)) {
      toast.error(`Stock insuficiente. Disponible: ${eppSeleccionado.stockDisponible}`)
      return
    }
    setGuardando(true)
    const params = empresaId ? `?empresaId=${empresaId}` : ''
    api.post(`/epps/asignaciones${params}`, {
      eppId:            Number(form.eppId),
      colaboradorId:    Number(form.colaboradorId),
      fechaEntrega:     form.fechaEntrega,
      fechaVencimiento: form.fechaVencimiento || null,
      cantidad:         Number(form.cantidad) || 1,
    })
    .then(res => {
      toast.success('EPP asignado correctamente')
      onGuardado(res.data)
      onClose()
    })
    .catch(err => toast.error(err.response?.data?.mensaje || 'Error al asignar'))
    .finally(() => setGuardando(false))
  }

  const inputCls = "w-full px-4 py-2.5 text-sm rounded-xl border focus:outline-none transition-all"
  const fi = e => { e.currentTarget.style.borderColor = '#af2154'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(175,33,84,0.12)' }
  const fo = e => { e.currentTarget.style.borderColor = border; e.currentTarget.style.boxShadow = 'none' }

  return (
    <ModalPortal>
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.65)' }}
      onClick={e => e.target === e.currentTarget && !guardando && onClose()}>
      <div className="w-full max-w-md rounded-2xl border shadow-2xl"
        style={{ backgroundColor: dark ? '#1e293b' : '#ffffff', borderColor: border }}>

        <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: border }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#3b82f618' }}>
              <CheckCircle size={18} style={{ color: '#3b82f6' }} />
            </div>
            <div>
              <p className="font-semibold text-sm" style={{ color: title }}>Asignar EPP</p>
              <p className="text-xs mt-0.5" style={{ color: sub }}>Descuenta del stock disponible</p>
            </div>
          </div>
          <button onClick={onClose} disabled={guardando} className="w-8 h-8 flex items-center justify-center rounded-lg" style={{ color: sub }}>
            <X size={17} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* EPP del catálogo */}
          <div className="space-y-1">
            <label className="text-xs font-medium" style={{ color: sub }}>EPP del catálogo *</label>
            <select name="eppId" value={form.eppId} onChange={handleChange}
              style={{ backgroundColor: inputBg, borderColor: border, color: inputTx }}
              className={inputCls} onFocus={fi} onBlur={fo}>
              <option value="">Seleccionar EPP...</option>
              {catalogo.map(e => (
                <option key={e.id} value={e.id} disabled={e.stockDisponible === 0}>
                  {CAT_MAP[e.categoria]?.emoji || ''} {e.nombre} — Stock: {e.stockDisponible}/{e.stockTotal}
                  {e.stockDisponible === 0 ? ' ⚠️ Sin stock' : ''}
                </option>
              ))}
            </select>
            {eppSeleccionado && (
              <p className="text-xs mt-1" style={{ color: eppSeleccionado.stockDisponible === 0 ? '#ef4444' : '#16a34a' }}>
                Disponible: {eppSeleccionado.stockDisponible} unidades
              </p>
            )}
          </div>

          {/* Cantidad */}
          <div className="space-y-1">
            <label className="text-xs font-medium" style={{ color: sub }}>Cantidad</label>
            <input type="number" name="cantidad" value={form.cantidad} onChange={handleChange}
              min="1" max={eppSeleccionado?.stockDisponible || 99}
              style={{ backgroundColor: inputBg, borderColor: border, color: inputTx }}
              className={inputCls} onFocus={fi} onBlur={fo} />
          </div>

          {/* Colaborador */}
          <div className="space-y-1">
            <label className="text-xs font-medium" style={{ color: sub }}>Colaborador *</label>
            <select name="colaboradorId" value={form.colaboradorId} onChange={handleChange}
              style={{ backgroundColor: inputBg, borderColor: border, color: inputTx }}
              className={inputCls} onFocus={fi} onBlur={fo}>
              <option value="">Seleccionar colaborador...</option>
              {colaboradores.map(c => (
                <option key={c.id} value={c.id}>{c.nombre} — {c.area || c.cargo || 'Sin área'}</option>
              ))}
            </select>
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium" style={{ color: sub }}>Fecha de entrega *</label>
              <input type="date" name="fechaEntrega" value={form.fechaEntrega} onChange={handleChange}
                style={{ backgroundColor: inputBg, borderColor: border, color: inputTx }}
                className={inputCls} onFocus={fi} onBlur={fo} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium" style={{ color: sub }}>Vencimiento</label>
              <input type="date" name="fechaVencimiento" value={form.fechaVencimiento} onChange={handleChange}
                style={{ backgroundColor: inputBg, borderColor: border, color: inputTx }}
                className={inputCls} onFocus={fi} onBlur={fo} />
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} disabled={guardando}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all disabled:opacity-50"
              style={{ borderColor: border, color: sub }}>Cancelar</button>
            <button type="submit" disabled={guardando}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: '#3b82f6' }}>
              {guardando ? 'Asignando...' : 'Asignar EPP'}
            </button>
          </div>
        </form>
      </div>
    </div>
    </ModalPortal>
  )
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function EppsPage() {
  const { dark } = useTheme()
  const printRef = useRef(null)

  // Rol del usuario logueado
  const userSession = (() => { try { return JSON.parse(localStorage.getItem('aleri-user') || '{}') } catch { return {} } })()
  const esAdmin = userSession.rol === 'ADMIN' || userSession.rol === 'SUBADMIN'

  // Estado
  const [tab, setTab] = useState('catalogo')
  const [empresaSelId,  setEmpresaSelId]  = useState('')        // solo admin
  const [empresasList,  setEmpresasList]  = useState([])        // solo admin
  const [resumen,       setResumen]       = useState(null)
  const [catalogo,      setCatalogo]      = useState([])
  const [asignaciones,  setAsignaciones]  = useState([])
  const [colaboradores, setColaboradores] = useState([])
  const [cargando,      setCargando]      = useState(true)
  const [modalCat,      setModalCat]      = useState(false)
  const [eppEditar,     setEppEditar]     = useState(null)
  const [modalAsig,     setModalAsig]     = useState(false)
  const [eliminandoId,  setEliminandoId]  = useState(null)
  const [filtroCat,     setFiltroCat]     = useState('')
  const [filtroAsig,    setFiltroAsig]    = useState('')

  // Colores
  const cardBg     = dark ? '#1e293b' : '#ffffff'
  const cardBorder = dark ? '#334155' : '#f1f5f9'
  const titleColor = dark ? '#f1f5f9' : '#111827'
  const subColor   = dark ? '#64748b' : '#9ca3af'
  const headBg     = dark ? '#0f172a' : '#f8fafc'
  const headColor  = dark ? '#64748b' : '#9ca3af'
  const rowBorder  = dark ? '#334155' : '#f1f5f9'
  const rowText    = dark ? '#cbd5e1' : '#374151'
  const inputBg    = dark ? '#0f172a' : '#f9fafb'
  const inputBd    = dark ? '#334155' : '#e5e7eb'
  const inputColor = dark ? '#f1f5f9' : '#1f2937'

  // ── Carga ──────────────────────────────────────────────────────────────────

  async function cargar(empId) {
    const params = empId ? `?empresaId=${empId}` : ''
    const [resRes, catRes, asigRes, colRes] = await Promise.all([
      api.get(`/epps/resumen${params}`),
      api.get(`/epps/catalogo${params}`),
      api.get(`/epps/asignaciones${params}`),
      api.get(`/epps/colaboradores${params}`),
    ])
    setResumen(resRes.data)
    setCatalogo(catRes.data)
    setAsignaciones(asigRes.data)
    setColaboradores(colRes.data)
  }

  // Cargar lista de empresas si es admin
  useEffect(() => {
    if (esAdmin) {
      api.get('/empresas').then(res => setEmpresasList(res.data)).catch(() => {})
    }
  }, [])

  useEffect(() => {
    if (esAdmin && !empresaSelId) {
      setCargando(false)
      return
    }
    setCargando(true)
    cargar(empresaSelId || null)
      .catch(() => toast.error('No se pudieron cargar los EPPs'))
      .finally(() => setCargando(false))
  }, [empresaSelId])

  // ── Acciones catálogo ──────────────────────────────────────────────────────

  function handleGuardadoCatalogo(eppActualizado) {
    setCatalogo(prev => {
      const idx = prev.findIndex(e => e.id === eppActualizado.id)
      return idx >= 0
        ? prev.map(e => e.id === eppActualizado.id ? eppActualizado : e)
        : [eppActualizado, ...prev]
    })
    cargar().catch(() => {})
  }

  function eliminarEpp(id) {
    setEliminandoId(id)
    const params = empresaSelId ? `?empresaId=${empresaSelId}` : ''
    toast.promise(
      api.delete(`/epps/catalogo/${id}${params}`)
        .then(() => {
          setCatalogo(prev => prev.filter(e => e.id !== id))
          cargar(empresaSelId || null).catch(() => {})
        })
        .finally(() => setEliminandoId(null)),
      {
        loading: 'Eliminando del catálogo...',
        success: 'EPP eliminado del catálogo',
        error: (err) => err.response?.data?.mensaje || 'Error al eliminar',
      }
    )
  }

  // ── Acciones asignaciones ──────────────────────────────────────────────────

  function handleGuardadoAsig() {
    cargar(empresaSelId || null).catch(() => {})
  }

  function devolverEpp(asigId) {
    const params = empresaSelId ? `?empresaId=${empresaSelId}` : ''
    toast.promise(
      api.delete(`/epps/asignaciones/${asigId}${params}`)
        .then(() => {
          setAsignaciones(prev => prev.filter(a => a.id !== asigId))
          cargar(empresaSelId || null).catch(() => {})
        }),
      {
        loading: 'Procesando devolución...',
        success: 'EPP devuelto y stock restaurado',
        error: (err) => err.response?.data?.mensaje || 'Error al devolver',
      }
    )
  }

  // ── PDF export ─────────────────────────────────────────────────────────────

  function exportarPDF() {
    const content = printRef.current
    if (!content) return

    const printWindow = window.open('', '_blank', 'width=900,height=700')
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Reporte EPPs - ALERI SSOMA</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; font-size: 13px; color: #111; }
          h1 { color: #af2154; font-size: 20px; margin-bottom: 4px; }
          h2 { color: #83266d; font-size: 15px; margin-top: 20px; margin-bottom: 8px; border-bottom: 1px solid #ddd; padding-bottom: 4px; }
          p { color: #6b7280; font-size: 12px; margin: 0 0 16px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th { background: #f8fafc; font-weight: 600; text-align: left; padding: 8px 12px; font-size: 11px; color: #6b7280; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; }
          td { padding: 8px 12px; border-bottom: 1px solid #f1f5f9; }
          .kpi-grid { display: flex; gap: 16px; margin-bottom: 20px; flex-wrap: wrap; }
          .kpi { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 16px; min-width: 130px; }
          .kpi-val { font-size: 22px; font-weight: 800; color: #111; }
          .kpi-lbl { font-size: 11px; color: #6b7280; margin-top: 2px; }
          .badge { display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 11px; font-weight: 600; }
          @media print { body { margin: 10px; } }
        </style>
      </head>
      <body>
        ${content.innerHTML}
        <p style="color:#9ca3af;font-size:10px;margin-top:30px;">Generado el ${new Date().toLocaleDateString('es-PE')} — ALERI SSOMA</p>
      </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => { printWindow.print(); printWindow.close() }, 500)
  }

  // ── Datos derivados ────────────────────────────────────────────────────────

  const limiteEpps = resumen?.limite ?? -1
  const limiteSuperado = limiteEpps !== -1 && (resumen?.totalCatalogo ?? 0) >= limiteEpps
  const porCategoria = resumen?.porCategoria ?? {}

  const donutData = CATEGORIAS.map(c => ({
    label: c.label,
    color: c.color,
    value: porCategoria[c.value] ?? 0,
  }))

  const cataloFiltrado = catalogo.filter(e =>
    !filtroCat || e.nombre.toLowerCase().includes(filtroCat.toLowerCase())
      || e.categoria?.toLowerCase().includes(filtroCat.toLowerCase())
  )

  const asigFiltradas = asignaciones.filter(a =>
    !filtroAsig || a.colaborador?.nombre?.toLowerCase().includes(filtroAsig.toLowerCase())
      || a.nombre?.toLowerCase().includes(filtroAsig.toLowerCase())
  )

  const stockBajoItems = catalogo.filter(e => e.stockDisponible === 0)

  if (esAdmin && !empresaSelId) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold" style={{ color: dark ? '#f1f5f9' : '#111827' }}>Gestión de EPPs</h1>
          <p className="text-sm mt-0.5" style={{ color: dark ? '#64748b' : '#9ca3af' }}>Catálogo de equipos y control de stock</p>
        </div>
        <div className="rounded-2xl border p-8 flex flex-col items-center justify-center gap-4 text-center"
          style={{ backgroundColor: cardBg, borderColor: cardBorder }}>
          <HardHat size={40} style={{ color: subColor }} />
          <div>
            <p className="font-semibold text-sm" style={{ color: titleColor }}>Selecciona una empresa</p>
            <p className="text-xs mt-1" style={{ color: subColor }}>Elige una empresa del selector de arriba para ver sus EPPs</p>
          </div>
          <select
            value={empresaSelId}
            onChange={e => setEmpresaSelId(e.target.value)}
            style={{ backgroundColor: inputBg, borderColor: inputBd, color: inputColor }}
            className="px-4 py-2.5 text-sm rounded-xl border focus:outline-none min-w-[220px]">
            <option value="">Seleccionar empresa...</option>
            {empresasList.map(emp => (
              <option key={emp.id} value={emp.id}>{emp.nombre}</option>
            ))}
          </select>
        </div>
      </div>
    )
  }

  if (cargando) {
    return (
      <div className="flex items-center justify-center h-64">
        <p style={{ color: subColor }}>Cargando EPPs...</p>
      </div>
    )
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-bold" style={{ color: titleColor }}>Gestión de EPPs</h1>
          <p className="text-sm mt-0.5" style={{ color: subColor }}>Catálogo de equipos y control de stock</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Selector de empresa — solo admin */}
          {esAdmin && (
            <select
              value={empresaSelId}
              onChange={e => { setEmpresaSelId(e.target.value); setTab('catalogo') }}
              style={{ backgroundColor: inputBg, borderColor: inputBd, color: inputColor }}
              className="px-3 py-2.5 text-sm rounded-xl border focus:outline-none">
              <option value="">Seleccionar empresa...</option>
              {empresasList.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.nombre}</option>
              ))}
            </select>
          )}
          <button onClick={exportarPDF}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all hover:opacity-80"
            style={{ borderColor: cardBorder, color: subColor, backgroundColor: cardBg }}>
            <FileText size={15} /> Exportar PDF
          </button>
          <button onClick={() => { setModalAsig(true) }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{ backgroundColor: '#3b82f6' }}>
            <CheckCircle size={15} /> Asignar EPP
          </button>
          <button
            onClick={() => {
              if (limiteSuperado) { toast.error('Límite de EPPs del catálogo alcanzado'); return }
              setEppEditar(null); setModalCat(true)
            }}
            title={limiteSuperado ? 'Límite alcanzado' : ''}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-60"
            style={{ backgroundColor: limiteSuperado ? '#9ca3af' : '#af2154', cursor: limiteSuperado ? 'not-allowed' : 'pointer' }}>
            <Plus size={15} /> Nuevo EPP
          </button>
        </div>
      </div>

      {/* ── Alerta stock bajo ── */}
      {stockBajoItems.length > 0 && (
        <div className="flex items-start gap-3 rounded-xl p-4 border"
          style={{ backgroundColor: dark ? '#450a0a' : '#fff5f5', borderColor: dark ? '#7f1d1d' : '#fecaca' }}>
          <AlertCircle size={18} style={{ color: '#ef4444', flexShrink: 0, marginTop: 1 }} />
          <div>
            <p className="font-semibold text-sm" style={{ color: '#ef4444' }}>
              {stockBajoItems.length} EPP{stockBajoItems.length > 1 ? 's' : ''} sin stock disponible
            </p>
            <p className="text-xs mt-0.5" style={{ color: dark ? '#fca5a5' : '#b91c1c' }}>
              {stockBajoItems.map(e => e.nombre).join(', ')}
            </p>
          </div>
        </div>
      )}

      {/* ── KPIs ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: <Package size={18} style={{ color: '#af2154' }} />, label: 'Unidades ingresadas', value: resumen?.totalUnidades ?? 0, sub: `${resumen?.totalCatalogo ?? 0} tipos`, bg: dark ? '#2d1520' : '#fceef4', color: '#af2154' },
          { icon: <CheckCircle size={18} style={{ color: '#3b82f6' }} />, label: 'Unidades asignadas', value: resumen?.unidadesAsignadas ?? 0, sub: `${resumen?.unidadesDisponibles ?? 0} disponibles`, bg: dark ? '#1e3a5f' : '#eff6ff', color: '#3b82f6' },
          { icon: <AlertTriangle size={18} style={{ color: '#f59e0b' }} />, label: 'Próx. a vencer (30d)', value: resumen?.proximosAVencer ?? 0, sub: null, bg: dark ? '#451a03' : '#fffbeb', color: '#f59e0b' },
          { icon: <AlertCircle size={18} style={{ color: '#ef4444' }} />, label: 'Vencidos', value: resumen?.vencidos ?? 0, sub: null, bg: dark ? '#450a0a' : '#fff5f5', color: '#ef4444' },
        ].map(({ icon, label, value, sub, bg, color }) => (
          <div key={label} className="rounded-2xl border shadow-sm px-5 py-4 flex items-center gap-4"
            style={{ backgroundColor: cardBg, borderColor: cardBorder }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: bg }}>
              {icon}
            </div>
            <div>
              <p className="text-2xl font-extrabold leading-none" style={{ color: titleColor }}>{value}</p>
              <p className="text-xs mt-1 font-medium" style={{ color: subColor }}>{label}</p>
              {sub && <p className="text-[11px] mt-0.5" style={{ color: dark ? '#475569' : '#9ca3af' }}>{sub}</p>}
            </div>
          </div>
        ))}
      </div>

      {/* ── Barra plan ── */}
      {limiteEpps !== -1 && (
        <div className="rounded-2xl border shadow-sm px-5 py-4 space-y-2"
          style={{ backgroundColor: cardBg, borderColor: cardBorder }}>
          <div className="flex justify-between text-sm">
            <span style={{ color: subColor }}>
              Tipos en catálogo — límite del plan
            </span>
            <span style={{ color: limiteSuperado ? '#ef4444' : rowText, fontWeight: limiteSuperado ? 600 : 400 }}>
              {resumen?.totalCatalogo ?? 0} / {limiteEpps} tipos
            </span>
          </div>
          <div className="w-full rounded-full h-2" style={{ backgroundColor: dark ? '#334155' : '#e5e7eb' }}>
            <div className="h-2 rounded-full transition-all duration-700"
              style={{
                width: `${limiteEpps > 0 ? Math.min(((resumen?.totalCatalogo ?? 0) / limiteEpps) * 100, 100) : 0}%`,
                backgroundColor: limiteSuperado ? '#ef4444' : (((resumen?.totalCatalogo ?? 0) / limiteEpps) >= 0.8 ? '#f59e0b' : '#16a34a'),
              }} />
          </div>
          <p className="text-xs" style={{ color: subColor }}>
            {resumen?.totalUnidades ?? 0} unidades ingresadas · {resumen?.unidadesDisponibles ?? 0} disponibles · {resumen?.unidadesAsignadas ?? 0} asignadas
          </p>
        </div>
      )}

      {/* ── Tabs ── */}
      <div className="flex items-center gap-1 rounded-2xl border p-1.5"
        style={{ backgroundColor: cardBg, borderColor: cardBorder, width: 'fit-content' }}>
        {[
          { key: 'catalogo',     icon: <List size={14} />,     label: 'Catálogo' },
          { key: 'asignaciones', icon: <CheckCircle size={14} />, label: 'Asignaciones' },
          { key: 'graficos',     icon: <BarChart2 size={14} />, label: 'Gráficos' },
        ].map(t => (
          <button key={t.key}
            onClick={() => setTab(t.key)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all"
            style={{
              backgroundColor: tab === t.key ? '#af2154' : 'transparent',
              color: tab === t.key ? '#ffffff' : subColor,
            }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ══════════════════ TAB: CATÁLOGO ══════════════════ */}
      {tab === 'catalogo' && (
        <div className="rounded-2xl border shadow-sm overflow-hidden"
          style={{ backgroundColor: cardBg, borderColor: cardBorder }}>

          <div className="px-6 py-4 border-b flex items-center justify-between gap-3"
            style={{ borderColor: cardBorder }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: dark ? '#0f172a' : '#fceef4' }}>
                <Archive size={17} style={{ color: '#af2154' }} />
              </div>
              <div>
                <p className="font-semibold text-sm" style={{ color: titleColor }}>Catálogo de EPPs</p>
                <p className="text-xs mt-0.5" style={{ color: subColor }}>{cataloFiltrado.length} tipos registrados</p>
              </div>
            </div>
            <input
              value={filtroCat}
              onChange={e => setFiltroCat(e.target.value)}
              placeholder="Buscar EPP..."
              style={{ backgroundColor: inputBg, borderColor: inputBd, color: inputColor }}
              className="px-3 py-2 text-sm rounded-xl border focus:outline-none w-48"
            />
          </div>

          {/* Tabla de filas */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: headBg }}>
                  {['EPP', 'Categoría', 'Stock total', 'Disponible', 'Asignados', 'Estado', ''].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider"
                      style={{ color: headColor }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {cataloFiltrado.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-sm" style={{ color: subColor }}>
                      No hay EPPs en el catálogo
                    </td>
                  </tr>
                ) : cataloFiltrado.map(epp => {
                  const cat = CAT_MAP[epp.categoria]
                  const est = stockEstado(epp.stockDisponible, epp.stockTotal)
                  const stockPct = epp.stockTotal > 0 ? (epp.stockDisponible / epp.stockTotal) * 100 : 0
                  const asignados = epp.stockAsignado ?? (epp.stockTotal - epp.stockDisponible)
                  return (
                    <tr key={epp.id} className="border-t transition-colors"
                      style={{ borderColor: rowBorder }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = dark ? '#1e293b' : '#f8fafc'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>

                      {/* Nombre + imagen miniatura */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 flex items-center justify-center"
                            style={{ backgroundColor: dark ? '#0f172a' : '#f1f5f9' }}>
                            {epp.imagenUrl
                              ? <img src={epp.imagenUrl} alt={epp.nombre} className="w-full h-full object-cover"
                                  onError={e => { e.target.style.display='none' }} />
                              : <HardHat size={18} style={{ color: cat?.color || '#6b7280', opacity: 0.5 }} />
                            }
                          </div>
                          <div>
                            <p className="font-medium text-sm" style={{ color: rowText }}>{epp.nombre}</p>
                            {epp.descripcion && (
                              <p className="text-xs mt-0.5 max-w-[200px] truncate" style={{ color: subColor }}>{epp.descripcion}</p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Categoría */}
                      <td className="px-5 py-3.5">
                        <span className="px-2 py-0.5 rounded-lg text-[11px] font-semibold"
                          style={{ color: cat?.color || subColor, backgroundColor: `${cat?.color || '#6b7280'}18` }}>
                          {cat?.label || epp.categoria}
                        </span>
                      </td>

                      {/* Stock total */}
                      <td className="px-5 py-3.5 font-medium" style={{ color: rowText }}>{epp.stockTotal}</td>

                      {/* Disponible con mini barra */}
                      <td className="px-5 py-3.5">
                        <div className="space-y-1 min-w-[80px]">
                          <span className="font-semibold text-sm" style={{ color: est.color }}>{epp.stockDisponible}</span>
                          <div className="h-1.5 rounded-full overflow-hidden w-16" style={{ backgroundColor: dark ? '#334155' : '#e2e8f0' }}>
                            <div className="h-full rounded-full" style={{ width: `${stockPct}%`, backgroundColor: est.color }} />
                          </div>
                        </div>
                      </td>

                      {/* Asignados */}
                      <td className="px-5 py-3.5" style={{ color: subColor }}>{asignados}</td>

                      {/* Estado badge */}
                      <td className="px-5 py-3.5">
                        <span className="px-2 py-0.5 rounded-lg text-[11px] font-semibold"
                          style={{ color: est.color, backgroundColor: `${est.color}15` }}>
                          {est.label}
                        </span>
                      </td>

                      {/* Acciones */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <button onClick={() => { setEppEditar(epp); setModalCat(true) }}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all hover:opacity-80"
                            style={{ borderColor: rowBorder, color: subColor }}>
                            <Edit2 size={12} /> Editar
                          </button>
                          <button onClick={() => eliminarEpp(epp.id)}
                            disabled={eliminandoId === epp.id || asignados > 0}
                            title={asignados > 0 ? 'Devuelve todos los equipos antes de eliminar' : ''}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all hover:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed"
                            style={{ borderColor: '#ef444440', color: '#ef4444' }}>
                            <Trash2 size={12} /> {eliminandoId === epp.id ? '...' : 'Eliminar'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ══════════════════ TAB: ASIGNACIONES ══════════════════ */}
      {tab === 'asignaciones' && (
        <div className="rounded-2xl border shadow-sm overflow-hidden"
          style={{ backgroundColor: cardBg, borderColor: cardBorder }}>

          <div className="px-6 py-4 border-b flex items-center justify-between gap-3"
            style={{ borderColor: cardBorder }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: dark ? '#1e3a5f' : '#eff6ff' }}>
                <CheckCircle size={17} style={{ color: '#3b82f6' }} />
              </div>
              <div>
                <p className="font-semibold text-sm" style={{ color: titleColor }}>Asignaciones activas</p>
                <p className="text-xs mt-0.5" style={{ color: subColor }}>{asigFiltradas.length} registros</p>
              </div>
            </div>
            <input
              value={filtroAsig}
              onChange={e => setFiltroAsig(e.target.value)}
              placeholder="Buscar colaborador o EPP..."
              style={{ backgroundColor: inputBg, borderColor: inputBd, color: inputColor }}
              className="px-3 py-2 text-sm rounded-xl border focus:outline-none w-56"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: headBg }}>
                  {['EPP', 'Categoría', 'Colaborador', 'Área', 'Entrega', 'Vencimiento', 'Estado', ''].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider"
                      style={{ color: headColor }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {asigFiltradas.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-10 text-center text-sm" style={{ color: subColor }}>
                      No hay asignaciones activas
                    </td>
                  </tr>
                ) : asigFiltradas.map(asig => {
                  const est = estadoVencimiento(asig.fechaVencimiento)
                  const cat = CAT_MAP[asig.categoria]
                  return (
                    <tr key={asig.id} className="border-t transition-colors"
                      style={{ borderColor: rowBorder }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = dark ? '#1e293b' : '#f8fafc'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                      <td className="px-5 py-3.5 font-medium" style={{ color: rowText }}>
                        {asig.nombre}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="px-2 py-0.5 rounded-lg text-[11px] font-semibold"
                          style={{ color: cat?.color || subColor, backgroundColor: `${cat?.color || '#6b7280'}15` }}>
                          {cat?.label || asig.categoria}
                        </span>
                      </td>
                      <td className="px-5 py-3.5" style={{ color: rowText }}>{asig.colaborador?.nombre ?? '—'}</td>
                      <td className="px-5 py-3.5" style={{ color: subColor }}>{asig.colaborador?.area ?? '—'}</td>
                      <td className="px-5 py-3.5" style={{ color: subColor }}>{asig.fechaEntrega ?? '—'}</td>
                      <td className="px-5 py-3.5" style={{ color: subColor }}>{asig.fechaVencimiento ?? '—'}</td>
                      <td className="px-5 py-3.5">
                        <span className="px-2 py-0.5 rounded-lg text-[11px] font-semibold"
                          style={{ color: est.color, backgroundColor: est.bg }}>
                          {est.label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <button onClick={() => devolverEpp(asig.id)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all hover:opacity-80"
                          style={{ borderColor: '#16a34a40', color: '#16a34a' }}>
                          <RefreshCw size={11} /> Devolver
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ══════════════════ TAB: GRÁFICOS ══════════════════ */}
      {tab === 'graficos' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Donut por categoría */}
          <div className="rounded-2xl border shadow-sm p-6"
            style={{ backgroundColor: cardBg, borderColor: cardBorder }}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: dark ? '#0f172a' : '#fceef4' }}>
                <BarChart2 size={17} style={{ color: '#af2154' }} />
              </div>
              <div>
                <p className="font-semibold text-sm" style={{ color: titleColor }}>Asignaciones por categoría</p>
                <p className="text-xs mt-0.5" style={{ color: subColor }}>Distribución actual</p>
              </div>
            </div>
            <DonutChart data={donutData} dark={dark} />
          </div>

          {/* Barras horizontales */}
          <div className="rounded-2xl border shadow-sm p-6"
            style={{ backgroundColor: cardBg, borderColor: cardBorder }}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: dark ? '#1e3a5f' : '#eff6ff' }}>
                <TrendingUp size={17} style={{ color: '#3b82f6' }} />
              </div>
              <div>
                <p className="font-semibold text-sm" style={{ color: titleColor }}>Stock disponible por tipo</p>
                <p className="text-xs mt-0.5" style={{ color: subColor }}>Estado del inventario</p>
              </div>
            </div>
            {catalogo.length === 0 ? (
              <p className="text-sm text-center py-8" style={{ color: subColor }}>Sin datos de catálogo</p>
            ) : (
              <div className="space-y-2">
                {catalogo.slice(0, 10).map(e => {
                  const est = stockEstado(e.stockDisponible, e.stockTotal)
                  const pct = e.stockTotal > 0 ? (e.stockDisponible / e.stockTotal) * 100 : 0
                  return (
                    <div key={e.id} className="space-y-0.5">
                      <div className="flex justify-between text-xs">
                        <span style={{ color: subColor }} className="truncate max-w-[160px]">{e.nombre}</span>
                        <span className="font-bold shrink-0 ml-2" style={{ color: est.color }}>
                          {e.stockDisponible}/{e.stockTotal}
                        </span>
                      </div>
                      <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: dark ? '#334155' : '#e2e8f0' }}>
                        <div className="h-full rounded-full transition-all"
                          style={{ width: `${pct}%`, backgroundColor: est.color }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Resumen estado asignaciones */}
          <div className="rounded-2xl border shadow-sm p-6"
            style={{ backgroundColor: cardBg, borderColor: cardBorder }}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: dark ? '#14532d' : '#f0fdf4' }}>
                <ShieldCheck size={17} style={{ color: '#16a34a' }} />
              </div>
              <div>
                <p className="font-semibold text-sm" style={{ color: titleColor }}>Estado de asignaciones</p>
                <p className="text-xs mt-0.5" style={{ color: subColor }}>Vigentes vs próximos a vencer</p>
              </div>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Vigentes',           value: resumen?.vigentes ?? 0,        color: '#16a34a' },
                { label: 'Próximos a vencer',  value: resumen?.proximosAVencer ?? 0, color: '#f59e0b' },
                { label: 'Vencidos',           value: resumen?.vencidos ?? 0,        color: '#ef4444' },
                { label: 'Sin vencimiento',    value: Math.max(0, (resumen?.totalAsignaciones ?? 0) - (resumen?.vigentes ?? 0) - (resumen?.proximosAVencer ?? 0) - (resumen?.vencidos ?? 0)), color: '#6b7280' },
              ].map(item => {
                const total = resumen?.totalAsignaciones ?? 1
                const pct = total > 0 ? (item.value / total) * 100 : 0
                return (
                  <div key={item.label} className="space-y-0.5">
                    <div className="flex justify-between text-xs">
                      <span style={{ color: subColor }}>{item.label}</span>
                      <span className="font-bold" style={{ color: item.color }}>{item.value}</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: dark ? '#334155' : '#e2e8f0' }}>
                      <div className="h-full rounded-full transition-all"
                        style={{ width: `${pct}%`, backgroundColor: item.color }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Categorías del catálogo */}
          <div className="rounded-2xl border shadow-sm p-6"
            style={{ backgroundColor: cardBg, borderColor: cardBorder }}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: dark ? '#451a03' : '#fffbeb' }}>
                <Package size={17} style={{ color: '#f59e0b' }} />
              </div>
              <div>
                <p className="font-semibold text-sm" style={{ color: titleColor }}>Catálogo por categoría</p>
                <p className="text-xs mt-0.5" style={{ color: subColor }}>Tipos de EPP registrados</p>
              </div>
            </div>
            <BarChart
              data={CATEGORIAS.map(c => ({
                ...c,
                value: catalogo.filter(e => e.categoria === c.value).length,
              }))}
              dark={dark}
            />
          </div>
        </div>
      )}

      {/* ── Contenido oculto para PDF ── */}
      <div ref={printRef} style={{ display: 'none' }}>
        <h1>Reporte de EPPs — ALERI SSOMA</h1>
        <p>Fecha de generación: {new Date().toLocaleDateString('es-PE')}</p>

        <div className="kpi-grid">
          <div className="kpi"><div className="kpi-val">{resumen?.totalCatalogo ?? 0}</div><div className="kpi-lbl">Tipos en catálogo</div></div>
          <div className="kpi"><div className="kpi-val">{resumen?.totalAsignaciones ?? 0}</div><div className="kpi-lbl">Asignaciones activas</div></div>
          <div className="kpi"><div className="kpi-val">{resumen?.proximosAVencer ?? 0}</div><div className="kpi-lbl">Próximos a vencer</div></div>
          <div className="kpi"><div className="kpi-val">{resumen?.vencidos ?? 0}</div><div className="kpi-lbl">Vencidos</div></div>
        </div>

        <h2>Catálogo de EPPs</h2>
        <table>
          <thead>
            <tr><th>Nombre</th><th>Categoría</th><th>Stock Total</th><th>Disponible</th><th>Asignados</th></tr>
          </thead>
          <tbody>
            {catalogo.map(e => (
              <tr key={e.id}>
                <td>{e.nombre}</td>
                <td>{CAT_MAP[e.categoria]?.label || e.categoria}</td>
                <td>{e.stockTotal}</td>
                <td>{e.stockDisponible}</td>
                <td>{e.stockTotal - e.stockDisponible}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h2>Asignaciones Activas</h2>
        <table>
          <thead>
            <tr><th>EPP</th><th>Categoría</th><th>Colaborador</th><th>Área</th><th>Entrega</th><th>Vencimiento</th><th>Estado</th></tr>
          </thead>
          <tbody>
            {asignaciones.map(a => {
              const est = estadoVencimiento(a.fechaVencimiento)
              return (
                <tr key={a.id}>
                  <td>{a.nombre}</td>
                  <td>{CAT_MAP[a.categoria]?.label || a.categoria}</td>
                  <td>{a.colaborador?.nombre ?? '—'}</td>
                  <td>{a.colaborador?.area ?? '—'}</td>
                  <td>{a.fechaEntrega ?? '—'}</td>
                  <td>{a.fechaVencimiento ?? '—'}</td>
                  <td><span className="badge" style={{ color: est.color, border: `1px solid ${est.color}` }}>{est.label}</span></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* ── Modales ── */}
      {modalCat && (
        <ModalCatalogo
          dark={dark}
          eppEditar={eppEditar}
          empresaId={empresaSelId || null}
          onClose={() => { setModalCat(false); setEppEditar(null) }}
          onGuardado={handleGuardadoCatalogo}
        />
      )}
      {modalAsig && (
        <ModalAsignacion
          dark={dark}
          catalogo={catalogo}
          colaboradores={colaboradores}
          empresaId={empresaSelId || null}
          onClose={() => setModalAsig(false)}
          onGuardado={handleGuardadoAsig}
        />
      )}
    </div>
  )
}
