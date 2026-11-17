const BASE = '/api'

function extraerMensaje(data) {
  if (!data) return 'Error inesperado en el servidor'
  if (data.errores) return Object.values(data.errores).join(' · ')
  return data.message || data.error || 'Error inesperado en el servidor'
}

async function request(method, path, body) {
  const res = await fetch(BASE + path, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined
  })

  if (res.status === 204) return null

  const data = await res.json().catch(() => null)
  if (!res.ok) throw new Error(extraerMensaje(data))
  return data
}

export const api = {
  productos: {
    listar: () => request('GET', '/productos'),
    crear: (p) => request('POST', '/productos', p),
    actualizar: (id, p) => request('PUT', `/productos/${id}`, p),
    eliminar: (id) => request('DELETE', `/productos/${id}`)
  },
  ventas: {
    listar: () => request('GET', '/ventas'),
    registrar: (v) => request('POST', '/ventas', v)
  }
}

export const formatoMoneda = (valor) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(Number(valor))