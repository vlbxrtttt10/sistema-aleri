import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  FileBarChart2, Download, FileSpreadsheet, Brain,
  AlertTriangle, CheckCircle2, ShieldCheck, BookOpen,
  Loader2, Clock, ChevronRight, RefreshCw, Search, Zap
} from 'lucide-react'
import api from '../../services/api'
import toast from 'react-hot-toast'

export default function ReportesPage() {
  const [searchParams] = useSearchParams()
  const incidenteId = searchParams.get('incidenteId')

  const [descargando,   setDescargando]   = useState(false)
  const [analizando,    setAnalizando]    = useState(false)
  const [analisis,      setAnalisis]      = useState(null)
  const [cacheado,      setCacheado]      = useState(false)
  const [fechaCache,    setFechaCache]    = useState(null)
  const [historial,     setHistorial]     = useState([])
  const [loadingHist,   setLoadingHist]   = useState(true)
  const [seleccionado,  setSeleccionado]  = useState(null)
  const [incidentes,    setIncidentes]    = useState([])
  const [mostrarPicker, setMostrarPicker] = useState(false)
  const [busqueda,      setBusqueda]      = useState('')

  useEffect(() => {
    cargarHistorial()
    cargarIncidentes()
  }, [])

  useEffect(() => {
    if (incidenteId) analizarIncidente(incidenteId)
  }, [incidenteId])

  function cargarHistorial() {
    setLoadingHist(true)
    api.get('/reportes/historial')
      .then(res => setHistorial(res.data))
      .catch(() => {})
      .finally(() => setLoadingHist(false))
  }

  function cargarIncidentes() {
    api.get('/incidentes').then(res => setIncidentes(res.data)).catch(() => {})
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
    setAnalizando(true)
    setAnalisis(null)
    setCacheado(false)
    setFechaCache(null)
    setSeleccionado(Number(id))
    setMostrarPicker(false)
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

  const incidentesFiltrados = incidentes.filter(inc =>
    inc.codigo?.toLowerCase().includes(busqueda.toLowerCase()) ||
    inc.tipo?.toLowerCase().includes(busqueda.toLowerCase()) ||
    inc.area?.toLowerCase().includes(busqueda.toLowerCase())
  )

  return (
    <div className="p-6 space-y-6">

      {/* Encabezado */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <FileBarChart2 size={28} className="text-primary-500" />
          <div>
            <h1 className="text-2xl font-bold text-white">Reportes</h1>
            <p className="text-sm text-gray-400">Exporta datos y analiza incidentes con IA</p>
          </div>
        </div>
        <button
          onClick={descargarIncidentes}
          disabled={descargando}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm font-semibold py-2.5 px-5 rounded-xl transition-colors shadow-sm"
        >
          <Download size={16} />
          {descargando ? 'Generando...' : 'Descargar Excel'}
        </button>
      </div>

      {/* Tarjeta Excel */}
      <div className="bg-gray-800 rounded-xl p-5 border border-gray-700 flex items-center gap-4">
        <div className="bg-green-500/20 p-3 rounded-lg shrink-0">
          <FileSpreadsheet size={24} className="text-green-400" />
        </div>
        <div>
          <p className="text-white font-semibold">Exportar Incidentes / Accidentes</p>
          <p className="text-xs text-gray-400 mt-0.5">
            Genera un archivo Excel con todos los registros: código, tipo, estado, fecha, área e implicado.
          </p>
        </div>
      </div>

      {/* Encabezado IA */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Brain size={22} className="text-purple-400" />
          <h2 className="text-lg font-bold text-white">Análisis IA de Incidentes</h2>
          <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full font-medium">Claude AI</span>
        </div>
        {/* Botón grande solo cuando no hay análisis activo */}
        {!analisis && !analizando && (
          <button
            onClick={() => { setMostrarPicker(v => !v); setBusqueda('') }}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold py-2 px-4 rounded-xl transition-colors"
          >
            <Zap size={15} />
            Analizar incidente
          </button>
        )}
      </div>

      {/* Picker de incidente */}
      {mostrarPicker && (
        <div className="bg-gray-800 border border-purple-500/30 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-700 flex items-center gap-2">
            <Search size={15} className="text-gray-400" />
            <input
              autoFocus
              type="text"
              placeholder="Buscar por código, tipo o área..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 outline-none"
            />
          </div>
          <div className="max-h-60 overflow-y-auto">
            {incidentesFiltrados.length === 0 ? (
              <p className="text-center py-6 text-sm text-gray-500">Sin resultados</p>
            ) : (
              incidentesFiltrados.map(inc => (
                <button
                  key={inc.id}
                  onClick={() => analizarIncidente(inc.id)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-700/60 transition-colors border-b border-gray-700/40 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-purple-300">{inc.codigo}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                      inc.tipo === 'ACCIDENTE' ? 'bg-red-500/20 text-red-300' : 'bg-yellow-500/20 text-yellow-300'
                    }`}>{inc.tipo}</span>
                    {inc.area && <span className="text-xs text-gray-400">{inc.area}</span>}
                  </div>
                  <span className="text-xs text-gray-500">{inc.fechaOcurrencia}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* Layout: historial + análisis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Panel historial */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-gray-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock size={15} className="text-gray-400" />
              <span className="text-sm font-semibold text-white">Historial de análisis</span>
            </div>
            <button onClick={cargarHistorial} className="text-gray-400 hover:text-white transition-colors">
              <RefreshCw size={14} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[480px]">
            {loadingHist ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 size={20} className="text-purple-400 animate-spin" />
              </div>
            ) : historial.length === 0 ? (
              <div className="py-10 text-center px-4">
                <Brain size={28} className="text-gray-600 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">Sin análisis anteriores</p>
                <p className="text-gray-600 text-xs mt-1">Usa "Analizar incidente" para empezar</p>
              </div>
            ) : (
              historial.map(item => (
                <button
                  key={item.id}
                  onClick={() => analizarIncidente(item.incidenteId)}
                  className={`w-full text-left px-4 py-3 border-b border-gray-700/50 hover:bg-gray-700/50 transition-colors flex items-start gap-3 ${
                    seleccionado === item.incidenteId ? 'bg-purple-500/10 border-l-2 border-l-purple-500' : ''
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-bold text-purple-300">{item.codigo}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                        item.tipo === 'ACCIDENTE' ? 'bg-red-500/20 text-red-300' : 'bg-yellow-500/20 text-yellow-300'
                      }`}>{item.tipo}</span>
                    </div>
                    {item.area && <p className="text-xs text-gray-400 mb-1">{item.area}</p>}
                    <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{item.preview}</p>
                    <p className="text-xs text-gray-600 mt-1">{item.fecha}</p>
                  </div>
                  <ChevronRight size={14} className="text-gray-500 mt-1 shrink-0" />
                </button>
              ))
            )}
          </div>
        </div>

        {/* Panel resultado */}
        <div className="lg:col-span-2">
          {analizando && (
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-10 flex flex-col items-center gap-3 min-h-[200px] justify-center">
              <Loader2 size={32} className="text-purple-400 animate-spin" />
              <p className="text-gray-300 font-medium">Analizando el incidente con IA...</p>
              <p className="text-gray-500 text-sm">Claude está revisando los datos y las imágenes del evento</p>
            </div>
          )}

          {analisis && !analizando && (
            <div className="bg-gray-800 border border-purple-500/30 rounded-xl overflow-hidden">
              <div className="bg-purple-500/10 px-5 py-3 border-b border-purple-500/20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Brain size={16} className="text-purple-400" />
                  <span className="text-purple-300 text-sm font-semibold">Análisis generado por Claude AI</span>
                  {cacheado && (
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock size={11} />
                      {fechaCache}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => { setMostrarPicker(v => !v); setBusqueda('') }}
                  className="flex items-center gap-1.5 text-xs text-purple-300 hover:text-purple-100 transition-colors border border-purple-500/30 hover:border-purple-400/50 px-3 py-1.5 rounded-lg"
                >
                  <Zap size={12} />
                  Cambiar incidente
                </button>
              </div>
              <div className="p-5 overflow-y-auto max-h-[480px]">
                <AnalisisRender texto={analisis} />
              </div>
            </div>
          )}

          {!analizando && !analisis && (
            <div className="bg-gray-800 border border-dashed border-gray-600 rounded-xl p-10 flex flex-col items-center gap-3 text-center min-h-[200px] justify-center">
              <Brain size={36} className="text-gray-600" />
              <p className="text-gray-400 font-medium">Selecciona un incidente para analizar</p>
              <p className="text-gray-500 text-sm max-w-sm">
                Usa el botón "Analizar incidente" o selecciona uno del historial.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function AnalisisRender({ texto }) {
  const secciones = texto.split(/\n(?=##\s)/).filter(Boolean)

  const iconMap = {
    'Análisis':    { icon: <FileBarChart2 size={15} />, color: 'text-blue-400',   bg: 'bg-blue-500/10',    border: 'border-blue-500/20'  },
    'Causas':      { icon: <AlertTriangle size={15} />, color: 'text-red-400',    bg: 'bg-red-500/10',     border: 'border-red-500/20'   },
    'Correctivas': { icon: <CheckCircle2  size={15} />, color: 'text-green-400',  bg: 'bg-green-500/10',   border: 'border-green-500/20' },
    'Preventivas': { icon: <ShieldCheck   size={15} />, color: 'text-yellow-400', bg: 'bg-yellow-500/10',  border: 'border-yellow-500/20'},
    'Lecciones':   { icon: <BookOpen      size={15} />, color: 'text-purple-400', bg: 'bg-purple-500/10',  border: 'border-purple-500/20'},
  }

  function getStyle(titulo) {
    for (const [key, val] of Object.entries(iconMap)) {
      if (titulo.includes(key)) return val
    }
    return { icon: null, color: 'text-gray-300', bg: 'bg-gray-700/40', border: 'border-gray-600/30' }
  }

  if (secciones.length <= 1) {
    return <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{limpiarTexto(texto)}</p>
  }

  return (
    <div className="space-y-4">
      {secciones.map((sec, i) => {
        const lines  = sec.trim().split('\n')
        const titulo = lines[0].replace(/^##\s*/, '').trim()
        const cuerpo = lines.slice(1).join('\n').trim()
        const style  = getStyle(titulo)

        return (
          <div key={i} className={`rounded-lg p-4 border ${style.bg} ${style.border}`}>
            <div className={`flex items-center gap-2 font-semibold text-sm mb-2 ${style.color}`}>
              {style.icon}
              <span>{titulo}</span>
            </div>
            <CuerpoRender texto={cuerpo} />
          </div>
        )
      })}
    </div>
  )
}

function limpiarTexto(t) {
  return t
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/^---+$/gm, '')
    .trim()
}

function CuerpoRender({ texto }) {
  const lineas = texto.split('\n')

  return (
    <div className="space-y-1 text-gray-300 text-sm leading-relaxed">
      {lineas.map((linea, i) => {
        const limpia = limpiarTexto(linea)
        if (!limpia) return null

        if (/^\s*[-•]\s+/.test(limpia)) {
          const contenido = limpia.replace(/^\s*[-•]\s+/, '')
          return (
            <div key={i} className="flex items-start gap-2">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-current opacity-50 shrink-0" />
              <span>{contenido}</span>
            </div>
          )
        }

        if (/^\s*\d+\.\s+/.test(limpia)) {
          const match     = limpia.match(/^\s*(\d+)\.\s+(.*)/)
          const num       = match ? match[1] : ''
          const contenido = match ? match[2] : limpia
          return (
            <div key={i} className="flex items-start gap-2">
              <span className="shrink-0 text-xs font-bold opacity-60 mt-0.5">{num}.</span>
              <span>{contenido}</span>
            </div>
          )
        }

        return <p key={i}>{limpia}</p>
      })}
    </div>
  )
}
