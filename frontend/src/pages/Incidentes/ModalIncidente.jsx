import { useEffect, useMemo, useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import {
  X, Pencil, FileText, MapPin, User, ClipboardList,
  Search as SearchIcon, ListChecks, Camera, AlertTriangle,
  Plus, Trash2, ImagePlus, Upload
} from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../services/api.js'
import ModalPortal from '../../components/ModalPortal.jsx'
import FirmaCanvas from '../../components/FirmaCanvas.jsx'

/* ─── Constantes de selects ─── */
const TIPOS = [
  { value: 'INCIDENTE',                label: 'Incidente (sin lesión)' },
  { value: 'ACCIDENTE_LEVE',           label: 'Accidente leve' },
  { value: 'ACCIDENTE_INCAPACITANTE',  label: 'Accidente incapacitante' },
  { value: 'ACCIDENTE_MORTAL',         label: 'Accidente mortal' },
]
const ESTADOS = [
  { value: 'REGISTRADO',       label: 'Registrado' },
  { value: 'EN_INVESTIGACION', label: 'En investigación' },
  { value: 'CERRADO',          label: 'Cerrado' },
]
const VINCULACIONES = [
  { value: '',            label: '— Selecciona —' },
  { value: 'PLANILLA',    label: 'Planilla' },
  { value: 'CONTRATISTA', label: 'Contratista' },
  { value: 'VISITANTE',   label: 'Visitante' },
]
const TURNOS = [
  { value: '',         label: '— Selecciona —' },
  { value: 'MANANA',   label: 'Mañana' },
  { value: 'TARDE',    label: 'Tarde' },
  { value: 'NOCHE',    label: 'Noche' },
  { value: 'ROTATIVO', label: 'Rotativo' },
]
const ESTADO_ACCION = [
  { value: 'PENDIENTE',  label: 'Pendiente'  },
  { value: 'EN_PROCESO', label: 'En proceso' },
  { value: 'EJECUTADA',  label: 'Ejecutada'  },
  { value: 'VERIFICADA', label: 'Verificada' },
]

const SECCIONES = [
  { id: 1, key: 'identificacion', label: 'Identificación',  icon: FileText      },
  { id: 2, key: 'implicado',      label: 'Implicado',       icon: User          },
  { id: 3, key: 'descripcion',    label: 'Descripción',     icon: ClipboardList },
  { id: 4, key: 'causas',         label: 'Causas',          icon: SearchIcon    },
  { id: 5, key: 'acciones',       label: 'Acciones',        icon: ListChecks    },
  { id: 6, key: 'evidencia',      label: 'Evidencia',       icon: Camera       },
]

/* Convierte File → base64 (data URI) */
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload  = () => resolve(reader.result)
    reader.onerror = (e) => reject(e)
    reader.readAsDataURL(file)
  })
}

export default function ModalIncidente({ dark, incidenteId, onClose, onGuardado }) {
  const isEdit = Boolean(incidenteId)
  const [seccion, setSeccion] = useState(1)
  const [cargando, setCargando] = useState(isEdit)

  const { register, handleSubmit, control, setValue, watch, reset, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      tipo: '',
      fechaOcurrencia: '',
      horaOcurrencia: '',
      fechaReporte: new Date().toISOString().slice(0, 10),
      area: '',
      planta: '',
      proyecto: '',
      ubicacionDetalle: '',
      implicadoNombre: '',
      implicadoDni: '',
      implicadoPuesto: '',
      implicadoArea: '',
      implicadoAntiguedadMeses: '',
      implicadoVinculacion: '',
      implicadoTurno: '',
      descripcion: '',
      tareaRealizada: '',
      tareaRutinaria: '',
      agenteCausante: '',
      parteCuerpoAfectada: '',
      naturalezaLesion: '',
      actosSubestandares: '',
      condicionesSubestandares: '',
      factoresPersonales: '',
      factoresTrabajo: '',
      acciones: [],
      testigos: [],
      fotos: [],
      costosEstimados: '',
      firmaReportante: null,
      firmaJefeArea: null,
      firmaResponsableSeguridad: null,
      estado: 'REGISTRADO',
    }
  })

  const accionesArr = useFieldArray({ control, name: 'acciones' })
  const testigosArr = useFieldArray({ control, name: 'testigos' })
  const fotosArr    = useFieldArray({ control, name: 'fotos' })

  const firmaReportante = watch('firmaReportante')
  const firmaJefe = watch('firmaJefeArea')
  const firmaResp = watch('firmaResponsableSeguridad')

  /* Cargar incidente al editar */
  useEffect(() => {
    if (!isEdit) return
    setCargando(true)
    api.get(`/incidentes/${incidenteId}`)
      .then(res => {
        const d = res.data
        reset({
          tipo:   d.tipo || '',
          fechaOcurrencia: d.fechaOcurrencia || '',
          horaOcurrencia:  d.horaOcurrencia || '',
          fechaReporte:    d.fechaReporte || '',
          area:     d.area || '',
          planta:   d.planta || '',
          proyecto: d.proyecto || '',
          ubicacionDetalle: d.ubicacionDetalle || '',
          implicadoNombre: d.implicadoNombre || '',
          implicadoDni:    d.implicadoDni || '',
          implicadoPuesto: d.implicadoPuesto || '',
          implicadoArea:   d.implicadoArea || '',
          implicadoAntiguedadMeses: d.implicadoAntiguedadMeses ?? '',
          implicadoVinculacion:     d.implicadoVinculacion || '',
          implicadoTurno:           d.implicadoTurno || '',
          descripcion:    d.descripcion || '',
          tareaRealizada: d.tareaRealizada || '',
          tareaRutinaria: d.tareaRutinaria === true ? 'true' : d.tareaRutinaria === false ? 'false' : '',
          agenteCausante:        d.agenteCausante || '',
          parteCuerpoAfectada:   d.parteCuerpoAfectada || '',
          naturalezaLesion:      d.naturalezaLesion || '',
          actosSubestandares:       d.actosSubestandares || '',
          condicionesSubestandares: d.condicionesSubestandares || '',
          factoresPersonales:       d.factoresPersonales || '',
          factoresTrabajo:          d.factoresTrabajo || '',
          acciones: d.acciones || [],
          testigos: d.testigos || [],
          fotos: d.fotos || [],
          costosEstimados: d.costosEstimados ?? '',
          firmaReportante:           d.firmaReportante || null,
          firmaJefeArea:             d.firmaJefeArea || null,
          firmaResponsableSeguridad: d.firmaResponsableSeguridad || null,
          estado: d.estado || 'REGISTRADO',
        })
      })
      .catch(err => toast.error(err.response?.data?.mensaje || 'Error al cargar el incidente'))
      .finally(() => setCargando(false))
  }, [incidenteId, isEdit, reset])

  /* ─── Submit ─── */
  const onSubmit = (data) => {
    /* Normalizar tipos */
    const payload = {
      ...data,
      fechaReporte: data.fechaReporte || null,
      implicadoAntiguedadMeses: data.implicadoAntiguedadMeses === ''
        ? null : Number(data.implicadoAntiguedadMeses),
      tareaRutinaria: data.tareaRutinaria === '' ? null : data.tareaRutinaria === 'true',
      costosEstimados: data.costosEstimados === '' ? null : Number(data.costosEstimados),
    }

    const request = isEdit
      ? api.put(`/incidentes/${incidenteId}`, payload)
      : api.post('/incidentes', payload)

    return toast.promise(
      request.then(res => {
        onGuardado(res.data)
        onClose()
        return res
      }),
      {
        loading: isEdit ? 'Guardando cambios...' : 'Registrando incidente...',
        success: isEdit ? 'Incidente actualizado' : 'Incidente registrado',
        error:   (err) => err.response?.data?.mensaje || 'Error al guardar',
      }
    )
  }

  /* ─── Subir fotos (multi) ─── */
  const handleAddFotos = async (e) => {
    const files = Array.from(e.target.files || [])
    e.target.value = ''
    for (const file of files) {
      try {
        if (file.size > 1500000) {
          toast.error(`${file.name} supera 1.5 MB`)
          continue
        }
        const base64 = await fileToBase64(file)
        fotosArr.append({ imagen: base64, descripcion: '' })
      } catch (_) { toast.error(`No se pudo leer ${file.name}`) }
    }
  }

  /* ─── Estilos ─── */
  const cardBg     = dark ? '#1e293b' : '#ffffff'
  const cardBorder = dark ? '#334155' : '#f1f5f9'
  const titleColor = dark ? '#f1f5f9' : '#111827'
  const subColor   = dark ? '#94a3b8' : '#6b7280'
  const labelColor = dark ? '#cbd5e1' : '#374151'
  const inputBg    = dark ? '#0f172a' : '#f9fafb'
  const inputBd    = dark ? '#334155' : '#e5e7eb'
  const inputColor = dark ? '#f1f5f9' : '#1f2937'
  const inputStyle = { backgroundColor: inputBg, borderColor: inputBd, color: inputColor }

  const focusIn  = e => { e.currentTarget.style.borderColor = '#af2154'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(175,33,84,0.12)' }
  const focusOut = e => { e.currentTarget.style.borderColor = inputBd; e.currentTarget.style.boxShadow = 'none' }

  const inputCls = "w-full rounded-xl px-3.5 py-2.5 text-sm border focus:outline-none transition-all"
  const textareaCls = "w-full rounded-xl px-3.5 py-2.5 text-sm border focus:outline-none transition-all min-h-[80px] resize-y"

  const labelCls = "block text-xs font-medium mb-1.5"

  return (
    <ModalPortal>
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>

      <div className="w-full max-w-5xl rounded-2xl border shadow-2xl my-4 flex flex-col"
        style={{ backgroundColor: cardBg, borderColor: cardBorder, maxHeight: 'calc(100vh - 2rem)' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0"
          style={{ borderColor: cardBorder }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: '#af215418' }}>
              {isEdit ? <Pencil size={17} style={{ color: '#af2154' }} /> : <AlertTriangle size={17} style={{ color: '#af2154' }} />}
            </div>
            <div>
              <p className="font-semibold text-sm" style={{ color: titleColor }}>
                {isEdit ? 'Editar' : 'Nuevo incidente o Accidente'}
              </p>
              <p className="text-xs mt-0.5" style={{ color: subColor }}>
                Completa las 6 secciones del registro SSOMA
              </p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
            style={{ color: subColor }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = dark ? '#334155' : '#f1f5f9'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
            <X size={17} />
          </button>
        </div>

        {/* Body con tabs laterales */}
        <div className="flex-1 overflow-hidden flex">
          {/* Tabs verticales */}
          <div className="w-56 border-r flex-shrink-0 overflow-y-auto"
            style={{ borderColor: cardBorder, backgroundColor: dark ? '#0f172a' : '#fafafa' }}>
            <div className="p-3 space-y-1">
              {SECCIONES.map(s => {
                const Icon = s.icon
                const activa = seccion === s.id
                return (
                  <button key={s.id} type="button" onClick={() => setSeccion(s.id)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-left transition-all"
                    style={{
                      backgroundColor: activa ? '#af2154' : 'transparent',
                      color: activa ? '#ffffff' : (dark ? '#cbd5e1' : '#475569'),
                    }}
                    onMouseEnter={e => { if (!activa) e.currentTarget.style.backgroundColor = dark ? '#1e293b' : '#f1f5f9' }}
                    onMouseLeave={e => { if (!activa) e.currentTarget.style.backgroundColor = 'transparent' }}>
                    <span className="text-[10px] font-bold opacity-70">{s.id}</span>
                    <Icon size={14} />
                    <span className="flex-1 truncate">{s.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Form */}
          <form id="form-incidente" onSubmit={handleSubmit(onSubmit)}
            className="flex-1 overflow-y-auto p-6">

            {cargando ? (
              <p className="text-center text-sm py-10" style={{ color: subColor }}>Cargando incidente...</p>
            ) : (
            <>

            {/* ─── Sección 1: Identificación ─── */}
            {seccion === 1 && (
              <div className="space-y-4">
                <h3 className="text-base font-bold" style={{ color: titleColor }}>1. Identificación</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls} style={{ color: labelColor }}>Tipo de evento *</label>
                    <select className={inputCls} style={inputStyle}
                      onFocus={focusIn} onBlur={focusOut}
                      {...register('tipo', { required: 'Selecciona el tipo' })}>
                      <option value="">— Selecciona —</option>
                      {TIPOS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                    {errors.tipo && <p className="mt-1 text-xs text-red-500">{errors.tipo.message}</p>}
                  </div>
                  {isEdit && (
                    <div>
                      <label className={labelCls} style={{ color: labelColor }}>Estado</label>
                      <select className={inputCls} style={inputStyle}
                        onFocus={focusIn} onBlur={focusOut} {...register('estado')}>
                        {ESTADOS.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
                      </select>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className={labelCls} style={{ color: labelColor }}>Fecha del evento *</label>
                    <input type="date" className={inputCls} style={inputStyle}
                      onFocus={focusIn} onBlur={focusOut}
                      {...register('fechaOcurrencia', { required: 'Obligatorio' })} />
                    {errors.fechaOcurrencia && <p className="mt-1 text-xs text-red-500">{errors.fechaOcurrencia.message}</p>}
                  </div>
                  <div>
                    <label className={labelCls} style={{ color: labelColor }}>Hora del evento</label>
                    <input type="time" className={inputCls} style={inputStyle}
                      onFocus={focusIn} onBlur={focusOut} {...register('horaOcurrencia')} />
                  </div>
                  <div>
                    <label className={labelCls} style={{ color: labelColor }}>Fecha de reporte</label>
                    <input type="date" className={inputCls} style={inputStyle}
                      onFocus={focusIn} onBlur={focusOut} {...register('fechaReporte')} />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls} style={{ color: labelColor }}>Área *</label>
                    <input type="text" className={inputCls} style={inputStyle}
                      placeholder="Ej: Almacén, Planta 2"
                      onFocus={focusIn} onBlur={focusOut}
                      {...register('area', { required: 'Obligatorio' })} />
                    {errors.area && <p className="mt-1 text-xs text-red-500">{errors.area.message}</p>}
                  </div>
                  <div>
                    <label className={labelCls} style={{ color: labelColor }}>Planta</label>
                    <input type="text" className={inputCls} style={inputStyle}
                      placeholder="Ej: Planta Lima Sur"
                      onFocus={focusIn} onBlur={focusOut} {...register('planta')} />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls} style={{ color: labelColor }}>Proyecto</label>
                    <input type="text" className={inputCls} style={inputStyle}
                      placeholder="Ej: Proyecto X"
                      onFocus={focusIn} onBlur={focusOut} {...register('proyecto')} />
                  </div>
                  <div>
                    <label className={labelCls} style={{ color: labelColor }}>
                      Ubicación detalle <span style={{ color: subColor }} className="font-normal">· coordenadas o referencia</span>
                    </label>
                    <input type="text" className={inputCls} style={inputStyle}
                      placeholder="Ej: -12.04, -77.03 / Frente al taller"
                      onFocus={focusIn} onBlur={focusOut} {...register('ubicacionDetalle')} />
                  </div>
                </div>
              </div>
            )}

            {/* ─── Sección 2: Implicado ─── */}
            {seccion === 2 && (
              <div className="space-y-4">
                <h3 className="text-base font-bold" style={{ color: titleColor }}>2. Datos del implicado</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls} style={{ color: labelColor }}>Nombre completo</label>
                    <input type="text" className={inputCls} style={inputStyle}
                      placeholder="Nombre del afectado"
                      onFocus={focusIn} onBlur={focusOut} {...register('implicadoNombre')} />
                  </div>
                  <div>
                    <label className={labelCls} style={{ color: labelColor }}>DNI</label>
                    <input type="text" className={inputCls} style={inputStyle}
                      placeholder="76543210"
                      onFocus={focusIn} onBlur={focusOut} {...register('implicadoDni')} />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls} style={{ color: labelColor }}>Puesto / cargo</label>
                    <input type="text" className={inputCls} style={inputStyle}
                      placeholder="Ej: Operario de planta"
                      onFocus={focusIn} onBlur={focusOut} {...register('implicadoPuesto')} />
                  </div>
                  <div>
                    <label className={labelCls} style={{ color: labelColor }}>Área / departamento</label>
                    <input type="text" className={inputCls} style={inputStyle}
                      placeholder="Ej: Operaciones"
                      onFocus={focusIn} onBlur={focusOut} {...register('implicadoArea')} />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className={labelCls} style={{ color: labelColor }}>Antigüedad (meses)</label>
                    <input type="number" min="0" className={inputCls} style={inputStyle}
                      placeholder="Ej: 8"
                      onFocus={focusIn} onBlur={focusOut} {...register('implicadoAntiguedadMeses')} />
                  </div>
                  <div>
                    <label className={labelCls} style={{ color: labelColor }}>Vinculación</label>
                    <select className={inputCls} style={inputStyle}
                      onFocus={focusIn} onBlur={focusOut} {...register('implicadoVinculacion')}>
                      {VINCULACIONES.map(v => <option key={v.value} value={v.value}>{v.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls} style={{ color: labelColor }}>Turno</label>
                    <select className={inputCls} style={inputStyle}
                      onFocus={focusIn} onBlur={focusOut} {...register('implicadoTurno')}>
                      {TURNOS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* ─── Sección 3: Descripción ─── */}
            {seccion === 3 && (
              <div className="space-y-4">
                <h3 className="text-base font-bold" style={{ color: titleColor }}>3. Descripción del evento</h3>

                <div>
                  <label className={labelCls} style={{ color: labelColor }}>Descripción del evento *</label>
                  <textarea className={textareaCls} style={inputStyle}
                    placeholder="Relato libre de lo ocurrido"
                    onFocus={focusIn} onBlur={focusOut}
                    {...register('descripcion', { required: 'Obligatorio' })} />
                  {errors.descripcion && <p className="mt-1 text-xs text-red-500">{errors.descripcion.message}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls} style={{ color: labelColor }}>Tarea que realizaba</label>
                    <textarea className={textareaCls} style={inputStyle}
                      placeholder="¿Qué estaba haciendo?"
                      onFocus={focusIn} onBlur={focusOut} {...register('tareaRealizada')} />
                  </div>
                  <div>
                    <label className={labelCls} style={{ color: labelColor }}>¿Tarea rutinaria?</label>
                    <select className={inputCls} style={inputStyle}
                      onFocus={focusIn} onBlur={focusOut} {...register('tareaRutinaria')}>
                      <option value="">— Selecciona —</option>
                      <option value="true">Sí, rutinaria</option>
                      <option value="false">No, no rutinaria</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className={labelCls} style={{ color: labelColor }}>
                    Agente causante <span style={{ color: subColor }} className="font-normal">· herramienta, máquina, sustancia</span>
                  </label>
                  <input type="text" className={inputCls} style={inputStyle}
                    placeholder="Ej: Esmeril sin guarda"
                    onFocus={focusIn} onBlur={focusOut} {...register('agenteCausante')} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls} style={{ color: labelColor }}>Parte del cuerpo afectada</label>
                    <input type="text" className={inputCls} style={inputStyle}
                      placeholder="Ej: Mano derecha"
                      onFocus={focusIn} onBlur={focusOut} {...register('parteCuerpoAfectada')} />
                  </div>
                  <div>
                    <label className={labelCls} style={{ color: labelColor }}>Naturaleza de la lesión</label>
                    <input type="text" className={inputCls} style={inputStyle}
                      placeholder="Corte, quemadura, fractura..."
                      onFocus={focusIn} onBlur={focusOut} {...register('naturalezaLesion')} />
                  </div>
                </div>
              </div>
            )}

            {/* ─── Sección 4: Causas ─── */}
            {seccion === 4 && (
              <div className="space-y-4">
                <h3 className="text-base font-bold" style={{ color: titleColor }}>4. Análisis de causas</h3>
                <p className="text-xs" style={{ color: subColor }}>
                  Investigación basada en metodologías como Ishikawa o "5 porqués".
                </p>

                <div>
                  <label className={labelCls} style={{ color: labelColor }}>Actos subestándares</label>
                  <textarea className={textareaCls} style={inputStyle}
                    placeholder="Acciones humanas: no usar EPP, operar a velocidad excesiva..."
                    onFocus={focusIn} onBlur={focusOut} {...register('actosSubestandares')} />
                </div>
                <div>
                  <label className={labelCls} style={{ color: labelColor }}>Condiciones subestándares</label>
                  <textarea className={textareaCls} style={inputStyle}
                    placeholder="Fallas del entorno: falta de guardas, iluminación deficiente..."
                    onFocus={focusIn} onBlur={focusOut} {...register('condicionesSubestandares')} />
                </div>
                <div>
                  <label className={labelCls} style={{ color: labelColor }}>Factores personales</label>
                  <textarea className={textareaCls} style={inputStyle}
                    placeholder="Falta de capacidad, estrés, falta de conocimiento..."
                    onFocus={focusIn} onBlur={focusOut} {...register('factoresPersonales')} />
                </div>
                <div>
                  <label className={labelCls} style={{ color: labelColor }}>Factores de trabajo</label>
                  <textarea className={textareaCls} style={inputStyle}
                    placeholder="Mantenimiento inadecuado, liderazgo deficiente, desgaste de herramientas..."
                    onFocus={focusIn} onBlur={focusOut} {...register('factoresTrabajo')} />
                </div>
              </div>
            )}

            {/* ─── Sección 5: Acciones ─── */}
            {seccion === 5 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold" style={{ color: titleColor }}>5. Plan de acciones correctivas</h3>
                  <button type="button"
                    onClick={() => accionesArr.append({ descripcion: '', responsable: '', fechaLimite: '', estado: 'PENDIENTE' })}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
                    style={{ backgroundColor: '#af2154' }}>
                    <Plus size={13} /> Agregar acción
                  </button>
                </div>

                {accionesArr.fields.length === 0 && (
                  <p className="text-sm text-center py-6 rounded-xl border-2 border-dashed"
                    style={{ color: subColor, borderColor: inputBd }}>
                    No hay acciones aún. Agrega la primera.
                  </p>
                )}

                {accionesArr.fields.map((field, idx) => (
                  <div key={field.id} className="rounded-xl border p-4 space-y-3"
                    style={{ borderColor: inputBd, backgroundColor: dark ? '#0f172a' : '#fafafa' }}>
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold" style={{ color: '#af2154' }}>Acción #{idx + 1}</p>
                      <button type="button" onClick={() => accionesArr.remove(idx)}
                        className="text-xs font-medium flex items-center gap-1 hover:opacity-80"
                        style={{ color: '#ef4444' }}>
                        <Trash2 size={12} /> Quitar
                      </button>
                    </div>

                    <div>
                      <label className={labelCls} style={{ color: labelColor }}>Descripción de la acción</label>
                      <textarea className={textareaCls} style={inputStyle}
                        placeholder="Tarea para evitar que se repita"
                        onFocus={focusIn} onBlur={focusOut}
                        {...register(`acciones.${idx}.descripcion`)} />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className={labelCls} style={{ color: labelColor }}>Responsable</label>
                        <input type="text" className={inputCls} style={inputStyle}
                          placeholder="Nombre encargado"
                          onFocus={focusIn} onBlur={focusOut}
                          {...register(`acciones.${idx}.responsable`)} />
                      </div>
                      <div>
                        <label className={labelCls} style={{ color: labelColor }}>Fecha límite</label>
                        <input type="date" className={inputCls} style={inputStyle}
                          onFocus={focusIn} onBlur={focusOut}
                          {...register(`acciones.${idx}.fechaLimite`)} />
                      </div>
                      <div>
                        <label className={labelCls} style={{ color: labelColor }}>Estado</label>
                        <select className={inputCls} style={inputStyle}
                          onFocus={focusIn} onBlur={focusOut}
                          {...register(`acciones.${idx}.estado`)}>
                          {ESTADO_ACCION.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ─── Sección 6: Evidencia ─── */}
            {seccion === 6 && (
              <div className="space-y-5">
                <h3 className="text-base font-bold" style={{ color: titleColor }}>6. Evidencia y cierre</h3>

                {/* Testigos */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold" style={{ color: titleColor }}>Testigos</p>
                    <button type="button"
                      onClick={() => testigosArr.append({ nombre: '', dni: '', declaracion: '' })}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                      style={{ backgroundColor: '#83266d22', color: '#83266d' }}>
                      <Plus size={13} /> Agregar testigo
                    </button>
                  </div>
                  {testigosArr.fields.length === 0 && (
                    <p className="text-xs text-center py-3 rounded-lg" style={{ color: subColor }}>
                      Sin testigos registrados.
                    </p>
                  )}
                  {testigosArr.fields.map((field, idx) => (
                    <div key={field.id} className="rounded-xl border p-3 space-y-2"
                      style={{ borderColor: inputBd, backgroundColor: dark ? '#0f172a' : '#fafafa' }}>
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold" style={{ color: '#83266d' }}>Testigo #{idx + 1}</p>
                        <button type="button" onClick={() => testigosArr.remove(idx)}
                          className="text-xs font-medium flex items-center gap-1 hover:opacity-80"
                          style={{ color: '#ef4444' }}>
                          <Trash2 size={12} /> Quitar
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input type="text" className={inputCls} style={inputStyle}
                          placeholder="Nombre"
                          onFocus={focusIn} onBlur={focusOut}
                          {...register(`testigos.${idx}.nombre`)} />
                        <input type="text" className={inputCls} style={inputStyle}
                          placeholder="DNI"
                          onFocus={focusIn} onBlur={focusOut}
                          {...register(`testigos.${idx}.dni`)} />
                      </div>
                      <textarea className={textareaCls} style={inputStyle}
                        placeholder="Declaración del testigo"
                        onFocus={focusIn} onBlur={focusOut}
                        {...register(`testigos.${idx}.declaracion`)} />
                    </div>
                  ))}
                </div>

                {/* Fotos */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold" style={{ color: titleColor }}>Registro fotográfico</p>
                    <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer"
                      style={{ backgroundColor: '#f5822722', color: '#f58227' }}>
                      <ImagePlus size={13} /> Agregar foto
                      <input type="file" accept="image/*" multiple className="sr-only" onChange={handleAddFotos} />
                    </label>
                  </div>
                  {fotosArr.fields.length === 0 && (
                    <p className="text-xs text-center py-3 rounded-lg" style={{ color: subColor }}>
                      Sin fotos. Tamaño máximo 1.5 MB por foto.
                    </p>
                  )}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {fotosArr.fields.map((field, idx) => {
                      const img = watch(`fotos.${idx}.imagen`)
                      return (
                        <div key={field.id} className="rounded-xl border overflow-hidden flex flex-col"
                          style={{ borderColor: inputBd, backgroundColor: dark ? '#0f172a' : '#fafafa' }}>
                          {img && (
                            <img src={img} alt="evidencia" className="w-full h-32 object-cover" />
                          )}
                          <div className="p-2 space-y-2">
                            <input type="text" className={`${inputCls} text-xs`} style={inputStyle}
                              placeholder="Descripción opcional"
                              onFocus={focusIn} onBlur={focusOut}
                              {...register(`fotos.${idx}.descripcion`)} />
                            <button type="button" onClick={() => fotosArr.remove(idx)}
                              className="w-full text-xs font-medium flex items-center justify-center gap-1 py-1 rounded-lg"
                              style={{ color: '#ef4444', backgroundColor: dark ? '#450a0a' : '#fff5f5' }}>
                              <Trash2 size={12} /> Eliminar
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Costos */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls} style={{ color: labelColor }}>
                      Costos estimados (S/) <span style={{ color: subColor }} className="font-normal">· médicos, daños, días perdidos</span>
                    </label>
                    <input type="number" step="0.01" className={inputCls} style={inputStyle}
                      placeholder="0.00"
                      onFocus={focusIn} onBlur={focusOut} {...register('costosEstimados')} />
                  </div>
                </div>

                {/* Firmas */}
                <div className="space-y-3">
                  <p className="text-sm font-semibold" style={{ color: titleColor }}>Firmas digitales</p>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                    <FirmaCanvas dark={dark} value={firmaReportante} label="Reportante"
                      onChange={v => setValue('firmaReportante', v, { shouldDirty: true })} />
                    <FirmaCanvas dark={dark} value={firmaJefe} label="Jefe de área"
                      onChange={v => setValue('firmaJefeArea', v, { shouldDirty: true })} />
                    <FirmaCanvas dark={dark} value={firmaResp} label="Responsable de seguridad"
                      onChange={v => setValue('firmaResponsableSeguridad', v, { shouldDirty: true })} />
                  </div>
                </div>
              </div>
            )}

            </>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t flex-shrink-0"
          style={{ borderColor: cardBorder }}>
          <div className="flex items-center gap-2">
            <button type="button"
              disabled={seccion === 1}
              onClick={() => setSeccion(s => Math.max(1, s - 1))}
              className="px-4 py-2 rounded-xl text-sm font-medium border transition-colors disabled:opacity-40"
              style={{ borderColor: inputBd, color: subColor }}>
              ← Anterior
            </button>
            <button type="button"
              disabled={seccion === 6}
              onClick={() => setSeccion(s => Math.min(6, s + 1))}
              className="px-4 py-2 rounded-xl text-sm font-medium border transition-colors disabled:opacity-40"
              style={{ borderColor: inputBd, color: subColor }}>
              Siguiente →
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button type="button" onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium border"
              style={{ borderColor: inputBd, color: subColor }}>
              Cancelar
            </button>
            <button type="submit" form="form-incidente" disabled={isSubmitting || cargando}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
              style={{ backgroundColor: '#af2154' }}>
              <Upload size={14} />
              {isSubmitting
                ? (isEdit ? 'Guardando...' : 'Registrando...')
                : (isEdit ? 'Guardar cambios' : 'Registrar incidente')}
            </button>
          </div>
        </div>
      </div>
    </div>
    </ModalPortal>
  )
}
