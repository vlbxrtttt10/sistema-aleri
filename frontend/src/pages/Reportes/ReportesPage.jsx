import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  FileBarChart2, Download, FileSpreadsheet, Brain,
  AlertTriangle, CheckCircle2, ShieldCheck, BookOpen,
  Loader2, Clock, ChevronRight, RefreshCw, FileDown
} from 'lucide-react'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { useTheme } from '../../context/ThemeContext.jsx'

export default function ReportesPage() {
  const { dark } = useTheme()
  const [searchParams] = useSearchParams()
  const incidenteId = searchParams.get('incidenteId')

  const [descargando,   setDescargando]   = useState(false)
  const [descargandoPdf, setDescargandoPdf] = useState(false)
  const [analizando,    setAnalizando]    = useState(false)
  const [analisis,      setAnalisis]      = useState(null)
  const [cacheado,      setCacheado]      = useState(false)
  const [fechaCache,    setFechaCache]    = useState(null)
  const [historial,     setHistorial]     = useState([])
  const [loadingHist,   setLoadingHist]   = useState(true)
  const [seleccionado,  setSeleccionado]  = useState(null)

  // ── colores dinámicos igual que EmpresasPage ──
  const cardBg     = dark ? '#1e293b' : '#ffffff'
  const cardBorder = dark ? '#334155' : '#f1f5f9'
  const titleColor = dark ? '#f1f5f9' : '#111827'
  const subColor   = dark ? '#64748b' : '#9ca3af'
  const rowText    = dark ? '#cbd5e1' : '#374151'
  const inputBg    = dark ? '#0f172a' : '#f9fafb'
  const inputBd    = dark ? '#334155' : '#e5e7eb'
  const inputColor = dark ? '#f1f5f9' : '#1f2937'

  const cargadoInicial = useRef(false)
  useEffect(() => {
    if (cargadoInicial.current) return
    cargadoInicial.current = true
    cargarHistorial()
  }, [])

  const ultimoAnalizado = useRef(null)
  useEffect(() => {
    if (!incidenteId || loadingHist) return
    if (ultimoAnalizado.current === incidenteId) return
    ultimoAnalizado.current = incidenteId
    analizarIncidente(incidenteId)
  }, [incidenteId, loadingHist])

  function cargarHistorial() {
    setLoadingHist(true)
    api.get('/reportes/historial')
      .then(res => setHistorial(res.data))
      .catch(() => {})
      .finally(() => setLoadingHist(false))
  }

  function descargarIncidentes() {
    setDescargando(true)
    api.get('/incidentes/exportar', { responseType: 'blob' })
      .then(res => {
        const url  = window.URL.createObjectURL(new Blob([res.data]))
        const link = document.createElement('a')
        link.href  = url
        link.setAttribute('download', 'incidentes.xlsx')
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(url)
        toast.success('Reporte descargado correctamente')
      })
      .catch(() => toast.error('No se pudo generar el reporte'))
      .finally(() => setDescargando(false))
  }

  function analizarIncidente(id) {
    // Si ya está en el historial cargado, mostrarlo directo sin llamar al backend
    const enHistorial = historial.find(h => h.incidenteId === Number(id))
    if (enHistorial) {
      mostrarDesdeHistorial(enHistorial)
      return
    }
    setAnalizando(true)
    setAnalisis(null)
    setCacheado(false)
    setFechaCache(null)
    setSeleccionado(Number(id))
    api.post(`/reportes/analizar/${id}`)
      .then(res => {
        setAnalisis(res.data.analisis)
        setCacheado(res.data.cacheado)
        setFechaCache(res.data.fechaAnalisis || null)
        if (!res.data.cacheado) cargarHistorial()
      })
      .catch(err => toast.error(err.response?.data?.mensaje || 'Error al analizar'))
      .finally(() => setAnalizando(false))
  }

  function mostrarDesdeHistorial(item) {
    setSeleccionado(item.incidenteId)
    setAnalisis(item.analisis)
    setCacheado(true)
    setFechaCache(item.fecha)
  }

  function descargarPdf() {
    if (!seleccionado) return
    setDescargandoPdf(true)
    api.get(`/reportes/analizar/${seleccionado}/pdf`, { responseType: 'blob' })
      .then(res => {
        const url  = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
        const link = document.createElement('a')
        link.href  = url
        link.setAttribute('download', `informe-${seleccionado}.pdf`)
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(url)
        toast.success('Informe PDF descargado')
      })
      .catch(() => toast.error('No se pudo generar el PDF'))
      .finally(() => setDescargandoPdf(false))
  }

  return (
    <div className="space-y-6">

      {/* ── Encabezado ── */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-bold" style={{ color: titleColor }}>Reportes</h1>
          <p className="text-sm mt-0.5" style={{ color: subColor }}>
            Exporta datos y analiza incidentes con IA
          </p>
        </div>
        <button
          onClick={descargarIncidentes}
          disabled={descargando}
          className="flex items-center gap-2 text-white text-sm font-semibold py-2.5 px-5 rounded-xl transition-all hover:opacity-90 disabled:opacity-60 shadow-sm"
          style={{ backgroundColor: '#16a34a' }}
        >
          <Download size={16} />
          {descargando ? 'Generando...' : 'Descargar Excel'}
        </button>
      </div>

      {/* ── Tarjeta Excel ── */}
      <div className="rounded-2xl border shadow-sm p-5 flex items-center gap-4"
        style={{ backgroundColor: cardBg, borderColor: cardBorder }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: dark ? '#14532d' : '#f0fdf4' }}>
          <FileSpreadsheet size={22} style={{ color: '#16a34a' }} />
        </div>
        <div>
          <p className="font-semibold text-sm" style={{ color: titleColor }}>Exportar Incidentes / Accidentes</p>
          <p className="text-xs mt-0.5" style={{ color: subColor }}>
            Genera un archivo Excel con todos los registros: código, tipo, estado, fecha, área e implicado.
          </p>
        </div>
      </div>

      {/* ── Encabezado IA ── */}
      <div className="flex items-center gap-2">
        <Brain size={22} style={{ color: '#7c3aed' }} />
        <h2 className="text-lg font-bold" style={{ color: titleColor }}>Análisis IA de Accidentes e Incidentes</h2>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
          style={{ backgroundColor: dark ? '#2e1065' : '#f5f3ff', color: '#7c3aed' }}>
          AI
        </span>
      </div>

      {/* ── Layout: historial + análisis ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Panel historial */}
        <div className="rounded-2xl border shadow-sm overflow-hidden flex flex-col"
          style={{ backgroundColor: cardBg, borderColor: cardBorder }}>
          <div className="px-4 py-3 border-b flex items-center justify-between"
            style={{ borderColor: cardBorder }}>
            <div className="flex items-center gap-2">
              <Clock size={15} style={{ color: subColor }} />
              <span className="text-sm font-semibold" style={{ color: titleColor }}>Historial de análisis</span>
            </div>
            <button onClick={cargarHistorial}
              className="transition-colors"
              style={{ color: subColor }}
              onMouseEnter={e => e.currentTarget.style.color = titleColor}
              onMouseLeave={e => e.currentTarget.style.color = subColor}>
              <RefreshCw size={14} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[480px]">
            {loadingHist ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 size={20} style={{ color: '#7c3aed' }} className="animate-spin" />
              </div>
            ) : historial.length === 0 ? (
              <div className="py-10 text-center px-4">
                <Brain size={28} className="mx-auto mb-2" style={{ color: dark ? '#334155' : '#d1d5db' }} />
                <p className="text-sm" style={{ color: subColor }}>Sin análisis anteriores</p>
                <p className="text-xs mt-1" style={{ color: dark ? '#475569' : '#9ca3af' }}>
                  Usa el botón "Analizar" desde Incidentes y Accidentes
                </p>
              </div>
            ) : historial.map(item => (
              <button key={item.id} onClick={() => mostrarDesdeHistorial(item)}
                className="w-full text-left px-4 py-3 border-b flex items-start gap-3 transition-colors"
                style={{
                  borderColor: cardBorder,
                  backgroundColor: seleccionado === item.incidenteId
                    ? (dark ? '#2e1065' : '#f5f3ff')
                    : 'transparent',
                  borderLeft: seleccionado === item.incidenteId ? '2px solid #7c3aed' : '2px solid transparent',
                }}
                onMouseEnter={e => { if (seleccionado !== item.incidenteId) e.currentTarget.style.backgroundColor = dark ? '#334155' : '#f8fafc' }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = seleccionado === item.incidenteId ? (dark ? '#2e1065' : '#f5f3ff') : 'transparent' }}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-bold" style={{ color: '#7c3aed' }}>{item.codigo}</span>
                    <span className="text-xs px-1.5 py-0.5 rounded-full font-medium"
                      style={{
                        backgroundColor: item.tipo === 'ACCIDENTE' ? (dark ? '#450a0a' : '#fff5f5') : (dark ? '#451a03' : '#fffbeb'),
                        color: item.tipo === 'ACCIDENTE' ? '#ef4444' : '#f59e0b',
                      }}>{item.tipo}</span>
                  </div>
                  {item.empresa && (
                    <p className="text-xs font-medium mb-0.5" style={{ color: dark ? '#a78bfa' : '#7c3aed' }}>{item.empresa}</p>
                  )}
                  {item.area && <p className="text-xs mb-1" style={{ color: subColor }}>{item.area}</p>}
                  <p className="text-xs leading-relaxed line-clamp-2" style={{ color: subColor }}>{item.preview}</p>
                  <p className="text-xs mt-1" style={{ color: dark ? '#475569' : '#9ca3af' }}>{item.fecha}</p>
                </div>
                <ChevronRight size={14} style={{ color: subColor }} className="mt-1 shrink-0" />
              </button>
            ))}
          </div>
        </div>

        {/* Panel resultado */}
        <div className="lg:col-span-2">
          {analizando && (
            <div className="rounded-2xl border shadow-sm p-10 flex flex-col items-center gap-3 min-h-[200px] justify-center"
              style={{ backgroundColor: cardBg, borderColor: cardBorder }}>
              <Loader2 size={32} style={{ color: '#7c3aed' }} className="animate-spin" />
              <p className="font-medium" style={{ color: titleColor }}>Analizando el incidente con IA...</p>
              <p className="text-sm" style={{ color: subColor }}>La IA está revisando los datos del evento</p>
            </div>
          )}

          {analisis && !analizando && (
            <div className="rounded-2xl border shadow-sm overflow-hidden"
              style={{ backgroundColor: cardBg, borderColor: dark ? '#4c1d95' : '#ddd6fe' }}>
              <div className="px-5 py-3 border-b flex items-center justify-between flex-wrap gap-2"
                style={{ backgroundColor: dark ? '#2e1065' : '#f5f3ff', borderColor: dark ? '#4c1d95' : '#ddd6fe' }}>
                <div className="flex items-center gap-2">
                  <Brain size={16} style={{ color: '#7c3aed' }} />
                  <span className="text-sm font-semibold" style={{ color: dark ? '#c4b5fd' : '#5b21b6' }}>
                    Análisis generado por AI
                  </span>
                  {cacheado && (
                    <span className="text-xs flex items-center gap-1" style={{ color: subColor }}>
                      <Clock size={11} /> {fechaCache}
                    </span>
                  )}
                </div>
                <button
                  onClick={descargarPdf}
                  disabled={descargandoPdf}
                  className="flex items-center gap-1.5 text-xs font-semibold text-white py-1.5 px-3 rounded-lg transition-all hover:opacity-90 disabled:opacity-60"
                  style={{ backgroundColor: '#af2154' }}
                >
                  <FileDown size={13} />
                  {descargandoPdf ? 'Generando...' : 'Descargar PDF'}
                </button>
              </div>
              <div className="p-5 overflow-y-auto max-h-[480px]">
                <AnalisisRender texto={analisis} dark={dark} />
              </div>
            </div>
          )}

          {!analizando && !analisis && (
            <div className="rounded-2xl border border-dashed shadow-sm p-10 flex flex-col items-center gap-3 text-center min-h-[200px] justify-center"
              style={{ backgroundColor: cardBg, borderColor: dark ? '#334155' : '#e5e7eb' }}>
              <Brain size={36} style={{ color: dark ? '#334155' : '#d1d5db' }} />
              <p className="font-medium" style={{ color: rowText }}>Selecciona un incidente para analizar</p>
              <p className="text-sm max-w-sm" style={{ color: subColor }}>
                Usa el botón "Analizar" desde Incidentes y Accidentes, o selecciona uno del historial.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function AnalisisRender({ texto, dark }) {
  const secciones = texto.split(/\n(?=##\s)/).filter(Boolean)

  const iconMap = {
    'Análisis':    { icon: <FileBarChart2 size={15} />, color: '#3b82f6', bg: dark ? '#1e3a5f' : '#eff6ff', border: dark ? '#1e40af' : '#bfdbfe' },
    'Causas':      { icon: <AlertTriangle size={15} />, color: '#ef4444', bg: dark ? '#450a0a' : '#fff5f5', border: dark ? '#7f1d1d' : '#fecaca' },
    'Correctivas': { icon: <CheckCircle2  size={15} />, color: '#16a34a', bg: dark ? '#14532d' : '#f0fdf4', border: dark ? '#15803d' : '#bbf7d0' },
    'Preventivas': { icon: <ShieldCheck   size={15} />, color: '#f59e0b', bg: dark ? '#451a03' : '#fffbeb', border: dark ? '#92400e' : '#fde68a' },
    'Lecciones':   { icon: <BookOpen      size={15} />, color: '#7c3aed', bg: dark ? '#2e1065' : '#f5f3ff', border: dark ? '#4c1d95' : '#ddd6fe' },
  }

  const defaultStyle = { icon: null, color: dark ? '#94a3b8' : '#374151', bg: dark ? '#334155' : '#f8fafc', border: dark ? '#475569' : '#e5e7eb' }

  function getStyle(titulo) {
    for (const [key, val] of Object.entries(iconMap)) {
      if (titulo.includes(key)) return val
    }
    return defaultStyle
  }

  if (secciones.length <= 1) {
    return <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: dark ? '#cbd5e1' : '#374151' }}>{limpiarTexto(texto)}</p>
  }

  return (
    <div className="space-y-4">
      {secciones.map((sec, i) => {
        const lines  = sec.trim().split('\n')
        const titulo = lines[0].replace(/^##\s*/, '').trim()
        const cuerpo = lines.slice(1).join('\n').trim()
        const style  = getStyle(titulo)
        return (
          <div key={i} className="rounded-xl p-4 border" style={{ backgroundColor: style.bg, borderColor: style.border }}>
            <div className="flex items-center gap-2 font-semibold text-sm mb-2" style={{ color: style.color }}>
              {style.icon}
              <span>{titulo}</span>
            </div>
            <CuerpoRender texto={cuerpo} dark={dark} />
          </div>
        )
      })}
    </div>
  )
}

function limpiarTexto(t) {
  return t.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1').replace(/^---+$/gm, '').trim()
}

function CuerpoRender({ texto, dark }) {
  const textColor = dark ? '#94a3b8' : '#4b5563'
  return (
    <div className="space-y-1 text-sm leading-relaxed" style={{ color: textColor }}>
      {texto.split('\n').map((linea, i) => {
        const limpia = limpiarTexto(linea)
        if (!limpia) return null
        if (/^\s*[-•]\s+/.test(limpia)) {
          return (
            <div key={i} className="flex items-start gap-2">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-current opacity-50 shrink-0" />
              <span>{limpia.replace(/^\s*[-•]\s+/, '')}</span>
            </div>
          )
        }
        if (/^\s*\d+\.\s+/.test(limpia)) {
          const match = limpia.match(/^\s*(\d+)\.\s+(.*)/)
          return (
            <div key={i} className="flex items-start gap-2">
              <span className="shrink-0 text-xs font-bold opacity-60 mt-0.5">{match?.[1]}.</span>
              <span>{match?.[2] ?? limpia}</span>
            </div>
          )
        }
        return <p key={i}>{limpia}</p>
      })}
    </div>
  )
}
