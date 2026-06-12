import { createPortal } from 'react-dom'

/**
 * Renderiza sus children en document.body usando un portal.
 *
 * Por qué: los modales que viven dentro de <main className="overflow-y-auto">
 * quedan atrapados en el stacking context del main. Eso hace que el navbar
 * sticky (que sí es hijo directo del root) aparezca por encima del overlay
 * oscuro del modal, generando una franja fea arriba.
 *
 * Solución: portar el modal a body — sale del stacking context conflictivo
 * y su z-index pasa a competir a nivel de root, donde gana sin problemas.
 */
export default function ModalPortal({ children }) {
  if (typeof document === 'undefined') return null
  return createPortal(children, document.body)
}
