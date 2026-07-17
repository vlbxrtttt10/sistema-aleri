import { useEffect, useRef, useState } from 'react'
import { Eraser, PenLine } from 'lucide-react'

/**
 * Canvas para firma digital. Dibuja con mouse o touch.
 *
 * Props:
 *  - value      string base64 (data URI) inicial. Si llega, se renderiza.
 *  - onChange   (base64|null) => void  — emite al levantar el dedo/mouse o al limpiar.
 *  - dark       boolean — afecta colores de bordes y trazo.
 *  - height     number  — alto del canvas en px (default 130)
 *  - label      string  — etiqueta superior opcional
 *  - disabled   boolean — si true, no permite dibujar ni limpiar (solo lectura)
 */
export default function FirmaCanvas({ value, onChange, dark, height = 130, label, disabled = false }) {
  const canvasRef = useRef(null)
  const drawing = useRef(false)
  const lastPos = useRef({ x: 0, y: 0 })
  const [hasInk, setHasInk] = useState(Boolean(value))

  /* Configura el contexto y restaura value si existe */
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.lineWidth = 2
    ctx.strokeStyle = dark ? '#f1f5f9' : '#1e293b'

    if (value) {
      const img = new Image()
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        setHasInk(true)
      }
      img.src = value
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      setHasInk(false)
    }
  }, [value, dark])

  const getPos = (e) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width  / rect.width
    const scaleY = canvas.height / rect.height
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top)  * scaleY,
    }
  }

  const start = (e) => {
    if (disabled) return
    e.preventDefault()
    drawing.current = true
    lastPos.current = getPos(e)
  }

  const move = (e) => {
    if (disabled || !drawing.current) return
    e.preventDefault()
    const ctx = canvasRef.current.getContext('2d')
    const pos = getPos(e)
    ctx.beginPath()
    ctx.moveTo(lastPos.current.x, lastPos.current.y)
    ctx.lineTo(pos.x, pos.y)
    ctx.stroke()
    lastPos.current = pos
    if (!hasInk) setHasInk(true)
  }

  const end = () => {
    if (!drawing.current) return
    drawing.current = false
    const data = canvasRef.current.toDataURL('image/png')
    onChange?.(data)
  }

  const limpiar = () => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setHasInk(false)
    onChange?.(null)
  }

  const borderColor = dark ? '#334155' : '#e2e8f0'
  const labelColor  = dark ? '#94a3b8' : '#6b7280'
  const bg          = dark ? '#0f172a' : '#ffffff'

  return (
    <div className="space-y-1.5">
      {label && (
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium" style={{ color: labelColor }}>{label}</span>
          {hasInk && !disabled && (
            <button type="button" onClick={limpiar}
              className="text-[11px] font-medium flex items-center gap-1 hover:opacity-80"
              style={{ color: '#ef4444' }}>
              <Eraser size={12} />
              Limpiar
            </button>
          )}
        </div>
      )}
      <div className="relative rounded-xl border overflow-hidden"
        style={{ borderColor, backgroundColor: bg }}>
        <canvas
          ref={canvasRef}
          width={520}
          height={height}
          style={{ width: '100%', height: `${height}px`, touchAction: 'none', cursor: disabled ? 'default' : 'crosshair' }}
          onMouseDown={start} onMouseMove={move} onMouseUp={end} onMouseLeave={end}
          onTouchStart={start} onTouchMove={move} onTouchEnd={end}
        />
        {!hasInk && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none gap-2"
            style={{ color: labelColor }}>
            <PenLine size={14} />
            <span className="text-xs">Firma aquí</span>
          </div>
        )}
      </div>
    </div>
  )
}
