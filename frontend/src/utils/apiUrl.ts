function joinUrl(base: string, path: string): string {
  const b = (base || '').trim().replace(/\/+$/, '')
  const p = (path || '').trim()
  if (!b) return p
  if (!p) return b
  return p.startsWith('/') ? `${b}${p}` : `${b}/${p}`
}

export function apiUrl(path: string): string {
  const base = String(import.meta.env.VITE_API_URL ?? '')
  console.log('VITE_API_URL:', base, 'path:', path)
  return joinUrl(base, path)
}

