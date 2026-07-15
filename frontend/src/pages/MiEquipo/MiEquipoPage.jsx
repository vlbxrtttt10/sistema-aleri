import { useEffect, useRef, useState } from 'react'
import {
  UserPlus, Users, Search, Pencil, Trash2,
  ShieldCheck, Crown, Star, Hash, Phone, Briefcase, Building, HardHat, AlertTriangle
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useTheme } from '../../context/ThemeContext.jsx'
import api from '../../services/api.js'
import ModalSupervisor from './ModalSupervisor.jsx'
import ModalEliminarSupervisor from './ModalEliminarSupervisor.jsx'
import ModalColaborador from './ModalColaborador.jsx'
import ModalEliminarColaborador from './ModalEliminarColaborador.jsx'

const PLAN_META = {
  BASICO: { label: 'Plan Básico', icon: ShieldCheck, color: '#6b7280', max: 3 },
  VIP:    { label: 'Plan VIP',    icon: Crown,       color: '#af2154', max: 5 },
  ALERI:  { label: 'Plan ALERI',  icon: Star,        color: '#83266d', max: null },
}

export default function MiEquipoPage() {
  const { dark } = useTheme()
  const [tab, setTab] = useState('supervisores')
  const [supervisores, setSupervisores] = useState([])
  const [colaboradores, setColaboradores] = useState([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editando, setEditando] = useState(null)
  const [eliminando, setEliminando] = useState(null)
  const [showModalColab,   setShowModalColab]   = useState(false)
  const [editandoColab,    setEditandoColab]    = useState(null)
  const [eliminandoColab,  setEliminandoColab]  = useState(null)
  const cargado = useRef(false)

  /* Plan del usuario logueado para mostrar el límite */
  let planNombre = null
  try {
    const u = JSON.parse(localStorage.getItem('aleri-user') || '{}')
    planNombre = u.planNombre || null
  } catch (_) { /* ignore */ }
  const planMeta = PLAN_META[planNombre] || { label: '—', icon: ShieldCheck, color: '#6b7280', max: null }
  const PlanIcon = planMeta.icon

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
  }, [])

  const cargar = () => {
    setLoading(true)
    Promise.all([
      api.get('/supervisores'),
      api.get('/colaboradores'),
    ])
      .then(([supRes, colRes]) => {
        setSupervisores(supRes.data)
        setColaboradores(colRes.data)
      })
      .catch(err => toast.error(err.response?.data?.mensaje || 'No se pudo cargar'))
      .finally(() => setLoading(false))
  }

  const abrirCrear = () => {
    if (planMeta.max !== null && supervisores.length >= planMeta.max) {
      toast.error(`Has alcanzado el límite de tu plan (${planMeta.max})`)
      return
    }
    setEditando(null)
    setShowModal(true)
  }

  const abrirEditar = (s) => {
    setEditando(s)
    setShowModal(true)
  }

  const cerrarModal = () => {
    setShowModal(false)
    setEditando(null)
  }

  const handleGuardado = (s) => {
    setSupervisores(prev => {
      const existe = prev.some(x => x.id === s.id)
      return existe
        ? prev.map(x => x.id === s.id ? s : x)
        : [s, ...prev]
    })
  }

  const handleEliminado = (id) => {
    setSupervisores(prev => prev.filter(s => s.id !== id))
  }

  const filtrados = supervisores.filter(s => {
    const q = busqueda.toLowerCase()
    return (
      (s.nombre || '').toLowerCase().includes(q) ||
      (s.email  || '').toLowerCase().includes(q) ||
      (s.dni    || '').toLowerCase().includes(q) ||
      (s.cargo  || '').toLowerCase().includes(q) ||
      (s.area   || '').toLowerCase().includes(q)
    )
  })

  const colaboradoresFiltrados = colaboradores.filter(c => {
    const q = busqueda.toLowerCase()
    return (
      (c.nombre || '').toLowerCase().includes(q) ||
      (c.dni    || '').toLowerCase().includes(q) ||
      (c.cargo  || '').toLowerCase().includes(q) ||
      (c.area   || '').toLowerCase().includes(q)
    )
  })

  const limiteAlcanzado = planMeta.max !== null && supervisores.length >= planMeta.max

  return (
    <div className="space-y-6">

      {/* Encabezado */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-bold" style={{ color: titleColor }}>Mi equipo</h1>
          <p className="text-sm mt-0.5" style={{ color: subColor }}>
            {tab === 'supervisores' ? 'Administra los supervisores de tu empresa' : 'Colaboradores registrados en tu empresa'}
          </p>
        </div>
        {tab === 'supervisores' ? (
          <button
            onClick={abrirCrear}
            disabled={limiteAlcanzado}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#af2154' }}
            title={limiteAlcanzado ? `Has alcanzado el límite de tu plan (${planMeta.max})` : 'Agregar supervisor'}>
            <UserPlus size={16} />
            Nuevo supervisor
          </button>
        ) : (() => {
            const limiteColAlcanzado = planMeta.max !== null
              && colaboradores.length >= planMeta.max
            return (
              <button
                onClick={() => {
                  if (limiteColAlcanzado) {
                    toast.error(`Has alcanzado el límite de tu plan (${planMeta.max} col./sup.)`)
                    return
                  }
                  setEditandoColab(null)
                  setShowModalColab(true)
                }}
                disabled={limiteColAlcanzado}
                title={limiteColAlcanzado ? `Límite alcanzado: ${planMeta.max} col./sup.` : 'Agregar colaborador'}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#af2154' }}>
                <UserPlus size={16} />
                Nuevo colaborador
              </button>
            )
          })()
        }
      </div>

      {/* Pestañas */}
      <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ backgroundColor: dark ? '#0f172a' : '#f1f5f9' }}>
        {[
          { key: 'supervisores',  label: 'Supervisores',  icon: Users,   count: supervisores.length },
          { key: 'colaboradores', label: 'Colaboradores', icon: HardHat, count: colaboradores.length },
        ].map(({ key, label, icon: Icon, count }) => (
          <button key={key} onClick={() => { setTab(key); setBusqueda('') }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              backgroundColor: tab === key ? (dark ? '#1e293b' : '#ffffff') : 'transparent',
              color: tab === key ? '#af2154' : (dark ? '#64748b' : '#9ca3af'),
              boxShadow: tab === key ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            }}>
            <Icon size={15} />
            {label}
            <span className="text-xs px-1.5 py-0.5 rounded-full font-semibold"
              style={{ backgroundColor: tab === key ? '#af215418' : 'transparent', color: '#af2154' }}>
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* ── TAB COLABORADORES ── */}
      {tab === 'colaboradores' && (
        <>
        {/* KPIs colaboradores */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-2xl border shadow-sm px-5 py-4 flex items-center gap-4"
            style={{ backgroundColor: cardBg, borderColor: cardBorder }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: '#af215418' }}>
              <HardHat size={20} style={{ color: '#af2154' }} />
            </div>
            <div>
              <p className="text-2xl font-extrabold leading-none" style={{ color: titleColor }}>
                {colaboradores.length}
              </p>
              <p className="text-xs mt-1" style={{ color: subColor }}>Colaboradores registrados</p>
            </div>
          </div>

          <div className="rounded-2xl border shadow-sm px-5 py-4 flex items-center gap-4"
            style={{ backgroundColor: cardBg, borderColor: cardBorder }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${planMeta.color}22` }}>
              <PlanIcon size={20} style={{ color: planMeta.color }} />
            </div>
            <div>
              <p className="text-base font-bold leading-none" style={{ color: titleColor }}>
                {planMeta.label}
              </p>
              <p className="text-xs mt-1" style={{ color: subColor }}>Plan contratado</p>
            </div>
          </div>

          <div className="rounded-2xl border shadow-sm px-5 py-4 flex items-center gap-4"
            style={{ backgroundColor: cardBg, borderColor: cardBorder }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: '#83266d18' }}>
              <ShieldCheck size={20} style={{ color: '#83266d' }} />
            </div>
            <div>
              {planMeta.max === null ? (
                <span className="inline-flex items-center gap-1 font-semibold uppercase tracking-wider text-[11px] px-2 py-0.5 rounded-full"
                  style={{ background: 'linear-gradient(90deg, #af2154 0%, #f58227 100%)', color: '#ffffff' }}>
                  ∞ Ilimitado
                </span>
              ) : (() => {
                const alcanzado = colaboradores.length >= planMeta.max
                return (
                  <p className="text-2xl font-extrabold leading-none"
                    style={{ color: alcanzado ? '#ef4444' : titleColor }}>
                    {colaboradores.length}/{planMeta.max}
                  </p>
                )
              })()}
              <p className="text-xs mt-1" style={{ color: subColor }}>Límite del plan</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border shadow-sm overflow-hidden"
          style={{ backgroundColor: cardBg, borderColor: cardBorder }}>
          <div className="px-6 py-4 flex items-center justify-between gap-4 border-b flex-wrap"
            style={{ borderColor: cardBorder }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: dark ? '#0f172a' : '#fceef4' }}>
                <HardHat size={17} style={{ color: '#af2154' }} />
              </div>
              <div>
                <p className="font-semibold text-sm" style={{ color: titleColor }}>Colaboradores</p>
                <p className="text-xs mt-0.5" style={{ color: subColor }}>{colaboradoresFiltrados.length} registros</p>
              </div>
            </div>
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
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: headBg }}>
                  {['Colaborador', 'DNI', 'Cargo / Área', 'Supervisor', 'Fecha ingreso', 'Acciones'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider"
                      style={{ color: headColor }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="px-5 py-10 text-center text-sm" style={{ color: subColor }}>Cargando...</td></tr>
                ) : colaboradoresFiltrados.length === 0 ? (
                  <tr><td colSpan={6} className="px-5 py-10 text-center text-sm" style={{ color: subColor }}>
                    {busqueda ? 'Sin resultados' : 'No hay colaboradores registrados'}
                  </td></tr>
                ) : colaboradoresFiltrados.map(c => (
                  <tr key={c.id} className="border-t transition-colors"
                    style={{ borderColor: rowBorder }}
                    onMouseEnter={ev => ev.currentTarget.style.backgroundColor = dark ? '#334155' : '#f8fafc'}
                    onMouseLeave={ev => ev.currentTarget.style.backgroundColor = 'transparent'}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                          style={{ background: 'linear-gradient(135deg, #af2154, #83266d)' }}>
                          {(c.nombre || '?').charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-sm" style={{ color: rowText }}>{c.nombre}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-xs font-mono" style={{ color: subColor }}>
                      {c.dni ? <span className="inline-flex items-center gap-1"><Hash size={11} />{c.dni}</span> : '—'}
                    </td>
                    <td className="px-5 py-3.5 text-xs">
                      <div className="space-y-0.5">
                        {c.cargo && <p className="flex items-center gap-1" style={{ color: rowText }}><Briefcase size={11} />{c.cargo}</p>}
                        {c.area  && <p className="flex items-center gap-1" style={{ color: subColor }}><Building size={11} />{c.area}</p>}
                        {!c.cargo && !c.area && <span style={{ color: subColor }}>—</span>}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-xs" style={{ color: subColor }}>
                      {c.supervisor?.usuario?.nombre || '—'}
                    </td>
                    <td className="px-5 py-3.5 text-xs tabular-nums" style={{ color: subColor }}>
                      {c.fechaIngreso
                        ? new Date(c.fechaIngreso).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })
                        : '—'}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <button onClick={() => { setEditandoColab(c); setShowModalColab(true) }}
                          title="Editar colaborador"
                          className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all"
                          style={{
                            backgroundColor: dark ? '#1e293b' : '#fceef4',
                            color: '#af2154',
                            border: `1px solid ${dark ? '#334155' : '#f6ccdc'}`,
                          }}>
                          <Pencil size={13} /> Editar
                        </button>
                        <button onClick={() => setEliminandoColab(c)}
                          title="Eliminar colaborador"
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
        </>
      )}

      {/* ── TAB SUPERVISORES ── */}
      {tab === 'supervisores' && <>

      {/* KPIs: cantidad usados / plan */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        {/* Total */}
        <div className="rounded-2xl border shadow-sm px-5 py-4 flex items-center gap-4"
          style={{ backgroundColor: cardBg, borderColor: cardBorder }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: '#af215418' }}>
            <Users size={20} style={{ color: '#af2154' }} />
          </div>
          <div>
            <p className="text-2xl font-extrabold leading-none" style={{ color: titleColor }}>
              {supervisores.length}
            </p>
            <p className="text-xs mt-1" style={{ color: subColor }}>Supervisores creados</p>
          </div>
        </div>

        {/* Plan */}
        <div className="rounded-2xl border shadow-sm px-5 py-4 flex items-center gap-4"
          style={{ backgroundColor: cardBg, borderColor: cardBorder }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${planMeta.color}22` }}>
            <PlanIcon size={20} style={{ color: planMeta.color }} />
          </div>
          <div>
            <p className="text-base font-bold leading-none" style={{ color: titleColor }}>
              {planMeta.label}
            </p>
            <p className="text-xs mt-1" style={{ color: subColor }}>Plan contratado</p>
          </div>
        </div>

        {/* Límite */}
        <div className="rounded-2xl border shadow-sm px-5 py-4 flex items-center gap-4"
          style={{ backgroundColor: cardBg, borderColor: cardBorder }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: '#83266d18' }}>
            <ShieldCheck size={20} style={{ color: '#83266d' }} />
          </div>
          <div>
            {planMeta.max === null ? (
              <span className="inline-flex items-center gap-1 font-semibold uppercase tracking-wider text-[11px] px-2 py-0.5 rounded-full"
                style={{
                  background: 'linear-gradient(90deg, #af2154 0%, #f58227 100%)',
                  color: '#ffffff',
                }}>
                ∞ Ilimitado
              </span>
            ) : (
              <p className="text-2xl font-extrabold leading-none"
                style={{ color: limiteAlcanzado ? '#ef4444' : titleColor }}>
                {supervisores.length}/{planMeta.max}
              </p>
            )}
            <p className="text-xs mt-1" style={{ color: subColor }}>Límite del plan</p>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="rounded-2xl border shadow-sm overflow-hidden"
        style={{ backgroundColor: cardBg, borderColor: cardBorder }}>

        <div className="px-6 py-4 flex items-center justify-between gap-4 border-b flex-wrap"
          style={{ borderColor: cardBorder }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: dark ? '#0f172a' : '#fceef4' }}>
              <Users size={17} style={{ color: '#af2154' }} />
            </div>
            <div>
              <p className="font-semibold text-sm" style={{ color: titleColor }}>Supervisores</p>
              <p className="text-xs mt-0.5" style={{ color: subColor }}>{filtrados.length} registros</p>
            </div>
          </div>
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

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: headBg }}>
                {['Supervisor', 'Correo', 'DNI', 'Cargo / Área', 'Teléfono', 'Creado', 'Acciones'].map(h => (
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
                  {busqueda ? 'Sin resultados' : 'Aún no has agregado supervisores'}
                </td></tr>
              ) : filtrados.map(s => (
                <tr key={s.id} className="border-t transition-colors"
                  style={{ borderColor: rowBorder, backgroundColor: 'transparent' }}
                  onMouseEnter={ev => ev.currentTarget.style.backgroundColor = dark ? '#334155' : '#f8fafc'}
                  onMouseLeave={ev => ev.currentTarget.style.backgroundColor = 'transparent'}>

                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg, #af2154, #83266d)' }}>
                        {(s.nombre || '?').charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-sm" style={{ color: rowText }}>{s.nombre}</span>
                    </div>
                  </td>

                  <td className="px-5 py-3.5 text-xs" style={{ color: subColor }}>{s.email}</td>

                  <td className="px-5 py-3.5 text-xs font-mono" style={{ color: subColor }}>
                    {s.dni
                      ? <span className="inline-flex items-center gap-1"><Hash size={11} />{s.dni}</span>
                      : '—'}
                  </td>

                  <td className="px-5 py-3.5 text-xs">
                    <div className="space-y-0.5">
                      {s.cargo && <p className="flex items-center gap-1" style={{ color: rowText }}>
                        <Briefcase size={11} />{s.cargo}
                      </p>}
                      {s.area && <p className="flex items-center gap-1" style={{ color: subColor }}>
                        <Building size={11} />{s.area}
                      </p>}
                      {!s.cargo && !s.area && <p style={{ color: subColor }}>—</p>}
                    </div>
                  </td>

                  <td className="px-5 py-3.5 text-xs" style={{ color: subColor }}>
                    {s.telefono
                      ? <span className="inline-flex items-center gap-1"><Phone size={11} />{s.telefono}</span>
                      : '—'}
                  </td>

                  <td className="px-5 py-3.5 text-xs tabular-nums" style={{ color: subColor }}>
                    {s.createdAt
                      ? new Date(s.createdAt).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })
                      : '—'}
                  </td>

                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <button onClick={() => abrirEditar(s)}
                        title="Editar supervisor"
                        className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all"
                        style={{
                          backgroundColor: dark ? '#1e293b' : '#fceef4',
                          color: '#af2154',
                          border: `1px solid ${dark ? '#334155' : '#f6ccdc'}`,
                        }}>
                        <Pencil size={13} /> Editar
                      </button>
                      <button onClick={() => setEliminando(s)}
                        title="Eliminar supervisor"
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

      </>}

      {showModal && (
        <ModalSupervisor dark={dark}
          supervisor={editando}
          onClose={cerrarModal}
          onGuardado={handleGuardado} />
      )}

      {eliminando && (
        <ModalEliminarSupervisor dark={dark}
          supervisor={eliminando}
          onClose={() => setEliminando(null)}
          onEliminado={handleEliminado} />
      )}

      {showModalColab && (
        <ModalColaborador dark={dark}
          colaborador={editandoColab}
          onClose={() => { setShowModalColab(false); setEditandoColab(null) }}
          onGuardado={c => {
            setColaboradores(prev => {
              const existe = prev.some(x => x.id === c.id)
              return existe ? prev.map(x => x.id === c.id ? c : x) : [c, ...prev]
            })
          }} />
      )}

      {eliminandoColab && (
        <ModalEliminarColaborador dark={dark}
          colaborador={eliminandoColab}
          onClose={() => setEliminandoColab(null)}
          onEliminado={id => setColaboradores(prev => prev.filter(c => c.id !== id))} />
      )}
    </div>
  )
}
