// Validadores y helpers compartidos entre formularios de distintos módulos.

export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export const dniRegex = /^\d{7,9}$/

// "YYYY-MM-DD" en hora local (lo que devuelve y espera <input type="date">)
export const hoyISO = () => new Date().toLocaleDateString('en-CA')
