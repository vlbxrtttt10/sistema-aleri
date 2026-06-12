/**
 * Helpers para leer la sesión del usuario desde localStorage.
 * Centraliza el acceso para no tener JSON.parse + try/catch repetidos.
 */

export function getSession() {
  try {
    return JSON.parse(localStorage.getItem('aleri-user') || '{}')
  } catch (_) {
    return {}
  }
}

export function getRol() {
  return getSession().rol || null
}

export function isAdmin() {
  const rol = getRol()
  return rol === 'ADMIN' || rol === 'SUBADMIN'
}

/**
 * Devuelve el array de módulos del usuario (tal como vino del backend).
 * ADMIN/SUBADMIN: todos. Demás: los del plan de su empresa.
 */
export function getModulos() {
  const s = getSession()
  return Array.isArray(s.modulos) ? s.modulos : []
}

/**
 * ¿El usuario tiene acceso a un módulo concreto?
 * Ej: hasModulo('EPPS')
 */
export function hasModulo(modulo) {
  return getModulos().includes(modulo)
}
