import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertTriangle, Plus, Search, Pencil, Trash2,
  FileText, AlertOctagon, AlertCircle, Skull, CheckCircle2,
  Clock, MapPin, Eye, Brain
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useTheme } from '../../context/ThemeContext.jsx'
import api from '../../services/api.js'
import ModalIncidente from './ModalIncidente.jsx'
import ModalPortal from '../../components/ModalPortal.jsx'
import { isAdmin } from '../../services/session.js'

const TIPO_CFG = {
  INCIDENTE:                { label: 'Incidente',     bg: '#dbeafe', bgDark: '#172554', color: '#2563eb', icon: AlertCircle  },
  ACCIDENTE_LEVE:           { label: 'Leve',          bg: '#fef9c3', bgDark: '#422006', color: '#a16207', icon: AlertTriangle },
  ACCIDENTE_INCAPACITANTE:  { label: 'Incapacitante', bg: '#fee2e2', bgDark: '#450a0a', color: '#dc2626', icon: AlertOctagon },
  ACCIDENTE_MORTAL:         { label: 'Mortal',        bg: '#f3e8ff', bgDark: '#2e1065', color: '#7e22ce', icon: Skull        },
}

const ESTADO_CFG = {
  REGISTRADO:        { label: 'Registrado',       bg: '#f0fdf4', bgDark: '#052e16', color: '#16a34a' },
  EN_INVESTIGACION:  { label: 'En investigación', bg: '#fff7ed', bgDark: '#431407', color: '#ea580c' },
  CERRADO:           { label: 'Cerrado',          bg: '#f1f5f9', bgDark: '#0f172a', color: '#64748b' },
}

function TipoBadge({ tipo, dark }) {
  const cfg = TIPO_CFG[tipo] || { label: tipo, bg: '#f1f5f9', bgDark: '#1e293b', color: '#64748b', icon: AlertCircle }
  const Icon = cfg.icon
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full"
      style={{ backgroundColor: dark ? cfg.bgDark : cfg.bg, color: cfg.color }}>
      <Icon size={11} />
      {cfg.label}
    </span>
  )
}

function EstadoBadge({ estado, dark }) {
  const cfg = ESTADO_CFG[estado] || { label: estado, bg: '#f1f5f9', bgDark: '#1e293b', color: '#64748b' }
  return (
    <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
      style={{ backgroundColor: dark ? cfg.bgDark : cfg.bg, color: cfg.color }}>
      {cfg.label}
    </span>
  )
}

/* Modal pequeño de confirmación de eliminar */
function ModalEliminar({ dark, incidente, onClose, onEliminado }) {
  const [eliminando, setEliminando] = useState(false)
  const cardBg     = dark ? '#1e293b' : '#ffffff'
  const cardBorder = dark ? '#334155' : '#f1f5f9'
  const titleColor = dark ? '#f1f5f9' : '#111827'
  const subColor   = dark ? '#94a3b8' : '#6b7280'
  const inputBd    = dark ? '#334155' : '#e5e7eb'

  const handleEliminar = () => {
    setEliminando(true)
    toast.promise(
      api.delete(`/incidentes/${incidente.id}`)
        .then(() => { onEliminado(incidente.id); onClose() })
        .finally(() => setEliminando(false)),
      {
        loading: 'Eliminando...',
        success: 'Incidente eliminado',
        error:   (err) => err.response?.data?.mensaje || 'Error al eliminar',
      }
    )
  }

  return (
    <ModalPortal>
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={e => e.target === e.currentTarget && !eliminando && onClose()}>
      <div className="w-full max-w-md rounded-2xl border shadow-2xl"
        style={{ backgroundColor: cardBg, borderColor: cardBorder }}>
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: '#ef444418' }}>
              <AlertTriangle size={18} style={{ color: '#ef4444' }} />
            </div>
            <div>
              <p className="font-semibold text-sm" style={{ color: titleColor }}>Eliminar incidente</p>
              <p className="text-xs mt-0.5" style={{ color: subColor }}>Esta acción es irreversible</p>
            </div>
          </div>
          <div className="rounded-xl p-3 border" style={{ borderColor: inputBd }}>
            <p className="text-xs" style={{ color: subColor }}>Código</p>
            <p className="font-bold text-sm font-mono" style={{ color: titleColor }}>{incidente.codigo}</p>
            <p className="text-xs mt-2" style={{ color: subColor }}>{incidente.area}</p>
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} disabled={eliminando}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium border disabled:opacity-50"
              style={{ borderColor: inputBd, color: subColor }}>
              Cancelar
            </button>
            <button onClick={handleEliminar} disabled={eliminando}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
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

export default function IncidentesPage() {
  const { dark } = useTheme()
  const esAdmin  = isAdmin()
  const navigate = useNavigate()
  const [incidentes, setIncidentes] = useState([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editandoId, setEditandoId] = useState(null)
  const [viendoId, setViendoId] = useState(null)
  const [eliminando, setEliminando] = useState(null)
  const [analizados, setAnalizados] = useState(new Set())
  const cargado = useRef(false)

  const cardBg    = dark ? '#1e293b' : '#ffffff'
  const cardBorder= dark ? '#334155' : '#f1f5f9'
  const titleColor= dark ? '#f1f5f9' : '#111827'
  const subColor  = dark ? '#64748b' : '#9ca3af'
  const headBg    = dark ? '#0f172a' : '#f8fafc'
  const headColor = dark ? '#64748b' : '#9ca3af'
  const rowBorder = dark ? '#334155' : '#f1f5f9'
  const rowText   = dark ? '#cbd5e1' : '#374151'
  const inputBg   = dark ? '#1e293b' : '#f8fafc'
  const inputBd   = dark ? '#334155' : '#e2e8f0'
  const inputColor= dark ? '#f1f5f9' : '#111827'

  useEffect(() => {
    if (cargado.current) return
    cargado.current = true
    cargar()
    cargarAnalizados()
  }, [])

  const cargar = () => {
    setLoading(true)
    api.get('/incidentes')
      .then(res => setIncidentes(res.data))
      .catch(err => toast.error(err.response?.data?.mensaje || 'No se pudo cargar'))
      .finally(() => setLoading(false))
  }

  const cargarAnalizados = () => {
    api.get('/reportes/historial')
      .then(res => setAnalizados(new Set(res.data.map(h => h.incidenteId))))
      .catch(() => {})
  }

  const abrirCrear  = () => { setEditandoId(null); setShowModal(true) }
  const abrirEditar = (id) => { setEditandoId(id); setShowModal(true) }
  const cerrarModal = () => { setShowModal(false); setEditandoId(null) }
  const abrirAnalizar = (id) => {
    setAnalizados(prev => new Set(prev).add(id))
    navigate(`/reportes?incidenteId=${id}`)
  }

  /* Tras crear/editar el back devuelve detalle; lo convierto a resumen para la tabla */
  const handleGuardado = (det) => {
    const resumen = {
      id: det.id, codigo: det.codigo, tipo: det.tipo, estado: det.estado,
      fechaOcurrencia: det.fechaOcurrencia, horaOcurrencia: det.horaOcurrencia,
      area: det.area, implicadoNombre: det.implicadoNombre, createdAt: det.createdAt,
    }
    const esNuevo = !incidentes.some(i => i.id === resumen.id)
    setIncidentes(prev => {
      const existe = prev.some(i => i.id === resumen.id)
      return existe ? prev.map(i => i.id === resumen.id ? resumen : i) : [resumen, ...prev]
    })
    if (esNuevo) {
      navigate(`/reportes?incidenteId=${det.id}`)
    }
  }

  const handleEliminado = (id) => setIncidentes(prev => prev.filter(i => i.id !== id))

  const filtrados = incidentes.filter(i => {
    if (filtroTipo && i.tipo !== filtroTipo) return false
    if (filtroEstado && i.estado !== filtroEstado) return false
    if (!busqueda) return true
    const q = busqueda.toLowerCase()
    return (
      (i.codigo || '').toLowerCase().includes(q) ||
      (i.area   || '').toLowerCase().includes(q) ||
      (i.implicadoNombre || '').toLowerCase().includes(q)
    )
  })

  /* KPIs por tipo */
  const total = incidentes.length
  const totalIncapacitantes = incidentes.filter(i => i.tipo === 'ACCIDENTE_INCAPACITANTE').length
  const totalCerrados = incidentes.filter(i => i.estado === 'CERRADO').length

  return (
    <div className="space-y-6">

      {/* Encabezado */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-bold" style={{ color: titleColor }}>Incidentes y Accidentes</h1>
          <p className="text-sm mt-0.5" style={{ color: subColor }}>
            {esAdmin
              ? 'Vista global · todos los incidentes registrados en la plataforma'
              : 'Registro SSOMA de eventos: 6 secciones de identificación, análisis y cierre'}
          </p>
        </div>
        {!esAdmin && (
          <button onClick={abrirCrear}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 shadow-sm"
            style={{ backgroundColor: '#af2154' }}>
            <Plus size={16} />
            Nuevo
          </button>
        )}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border shadow-sm px-5 py-4 flex items-center gap-4"
          style={{ backgroundColor: cardBg, borderColor: cardBorder }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: '#af215418' }}>
            <FileText size={20} style={{ color: '#af2154' }} />
          </div>
          <div>
            <p className="text-2xl font-extrabold leading-none" style={{ color: titleColor }}>{total}</p>
            <p className="text-xs mt-1" style={{ color: subColor }}>Total registrados</p>
          </div>
        </div>
        <div className="rounded-2xl border shadow-sm px-5 py-4 flex items-center gap-4"
          style={{ backgroundColor: cardBg, borderColor: cardBorder }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: '#dc262618' }}>
            <AlertOctagon size={20} style={{ color: '#dc2626' }} />
          </div>
          <div>
            <p className="text-2xl font-extrabold leading-none" style={{ color: titleColor }}>{totalIncapacitantes}</p>
            <p className="text-xs mt-1" style={{ color: subColor }}>Incapacitantes</p>
          </div>
        </div>
        <div className="rounded-2xl border shadow-sm px-5 py-4 flex items-center gap-4"
          style={{ backgroundColor: cardBg, borderColor: cardBorder }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: '#16a34a18' }}>
            <CheckCircle2 size={20} style={{ color: '#16a34a' }} />
          </div>
          <div>
            <p className="text-2xl font-extrabold leading-none" style={{ color: titleColor }}>{totalCerrados}</p>
            <p className="text-xs mt-1" style={{ color: subColor }}>Cerrados</p>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="rounded-2xl border shadow-sm overflow-hidden"
        style={{ backgroundColor: cardBg, borderColor: cardBorder }}>

        <div className="px-6 py-4 flex items-center justify-between gap-3 border-b flex-wrap"
          style={{ borderColor: cardBorder }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: dark ? '#0f172a' : '#fceef4' }}>
              <FileText size={17} style={{ color: '#af2154' }} />
            </div>
            <div>
              <p className="font-semibold text-sm" style={{ color: titleColor }}>Registros</p>
              <p className="text-xs mt-0.5" style={{ color: subColor }}>{filtrados.length} de {total}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)}
              className="px-3 py-2 text-sm rounded-xl border focus:outline-none"
              style={{ backgroundColor: inputBg, borderColor: inputBd, color: inputColor }}>
              <option value="">Todos los tipos</option>
              {Object.keys(TIPO_CFG).map(k => <option key={k} value={k}>{TIPO_CFG[k].label}</option>)}
            </select>
            <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}
              className="px-3 py-2 text-sm rounded-xl border focus:outline-none"
              style={{ backgroundColor: inputBg, borderColor: inputBd, color: inputColor }}>
              <option value="">Todos los estados</option>
              {Object.keys(ESTADO_CFG).map(k => <option key={k} value={k}>{ESTADO_CFG[k].label}</option>)}
            </select>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: subColor }} />
              <input type="text" placeholder="Buscar..." value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                className="pl-9 pr-4 py-2 text-sm rounded-xl border focus:outline-none transition-all w-44"
                style={{ backgroundColor: inputBg, borderColor: inputBd, color: inputColor }}
                onFocus={e => { e.currentTarget.style.borderColor = '#af2154'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(175,33,84,0.12)' }}
                onBlur={e => { e.currentTarget.style.borderColor = inputBd; e.currentTarget.style.boxShadow = 'none' }} />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: headBg }}>
                {['Código', 'Tipo', 'Fecha', 'Área', 'Implicado', 'Estado', 'Acciones'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider"
                    style={{ color: headColor }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="px-5 py-10 text-center text-sm" style={{ color: subColor }}>Cargando...</td></tr>
              ) : filtrados.length === 0 ? (
                <tr><td colSpan={7} className="px-5 py-10 text-center text-sm" style={{ color: subColor }}>
                  {busqueda || filtroTipo || filtroEstado ? 'Sin resultados con esos filtros' : 'Aún no hay incidentes registrados'}
                </td></tr>
              ) : filtrados.map(i => (
                <tr key={i.id} className="border-t transition-colors"
                  style={{ borderColor: rowBorder, backgroundColor: 'transparent' }}
                  onMouseEnter={ev => ev.currentTarget.style.backgroundColor = dark ? '#334155' : '#f8fafc'}
                  onMouseLeave={ev => ev.currentTarget.style.backgroundColor = 'transparent'}>

                  <td className="px-5 py-3.5 font-mono text-xs font-bold"
                    style={{ color: '#af2154' }}>{i.codigo}</td>
                  <td className="px-5 py-3.5"><TipoBadge tipo={i.tipo} dark={dark} /></td>
                  <td className="px-5 py-3.5 text-xs" style={{ color: rowText }}>
                    <div>
                      {i.fechaOcurrencia
                        ? new Date(i.fechaOcurrencia).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })
                        : '—'}
                    </div>
                    {i.horaOcurrencia && (
                      <div className="flex items-center gap-1 mt-0.5" style={{ color: subColor }}>
                        <Clock size={10} /> {i.horaOcurrencia}
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-xs" style={{ color: rowText }}>
                    <div className="flex items-center gap-1">
                      <MapPin size={11} style={{ color: subColor }} />
                      {i.area || '—'}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-xs" style={{ color: rowText }}>
                    {i.implicadoNombre || <span style={{ color: subColor }}>Sin implicado</span>}
                  </td>
                  <td className="px-5 py-3.5"><EstadoBadge estado={i.estado} dark={dark} /></td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <button onClick={() => setViendoId(i.id)}
                        title="Ver"
                        className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all"
                        style={{
                          backgroundColor: dark ? '#1e293b' : '#f1f5f9',
                          color: dark ? '#cbd5e1' : '#475569',
                          border: `1px solid ${dark ? '#334155' : '#e2e8f0'}`,
                        }}>
                        <Eye size={13} /> Ver
                      </button>
                      <button onClick={() => abrirAnalizar(i.id)}
                        title={analizados.has(i.id) ? 'Ver análisis' : 'Analizar'}
                        className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all"
                        style={analizados.has(i.id) ? {
                          backgroundColor: dark ? '#2e1065' : '#f5f3ff',
                          color: '#7c3aed',
                          border: `1px solid ${dark ? '#4c1d95' : '#ddd6fe'}`,
                        } : {
                          backgroundColor: dark ? '#0f2e28' : '#ecfdf5',
                          color: '#059669',
                          border: `1px solid ${dark ? '#065f46' : '#a7f3d0'}`,
                        }}>
                        <Brain size={13} /> {analizados.has(i.id) ? 'Ver análisis' : 'Analizar'}
                      </button>
                      <button onClick={() => abrirEditar(i.id)}
                        title="Editar"
                        className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all"
                        style={{
                          backgroundColor: dark ? '#1e293b' : '#fceef4',
                          color: '#af2154',
                          border: `1px solid ${dark ? '#334155' : '#f6ccdc'}`,
                        }}>
                        <Pencil size={13} /> Editar
                      </button>
                      <button onClick={() => setEliminando(i)}
                        title="Eliminar"
                        className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all"
                        style={{
                          backgroundColor: dark ? '#450a0a' : '#fff5f5',
                          color: '#ef4444',
                          border: `1px solid ${dark ? '#7f1d1d' : '#fecaca'}`,
                        }}>
                        <Trash2 size={13} /> Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <ModalIncidente dark={dark}
          incidenteId={editandoId}
          onClose={cerrarModal}
          onGuardado={handleGuardado} />
      )}

      {viendoId && (
        <ModalIncidente dark={dark}
          incidenteId={viendoId}
          soloLectura
          onClose={() => setViendoId(null)}
          onGuardado={() => {}} />
      )}

      {eliminando && (
        <ModalEliminar dark={dark}
          incidente={eliminando}
          onClose={() => setEliminando(null)}
          onEliminado={handleEliminado} />
      )}
    </div>
  )
}
