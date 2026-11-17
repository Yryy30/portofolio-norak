import type { ContentItem } from '@shared/types'

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

async function send<T>(method: string, path: string, body?: unknown): Promise<T> {
  const r = await fetch('/api/admin' + path, {
    method,
    headers: body !== undefined ? { 'content-type': 'application/json' } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  const data = await r.json().catch(() => null)
  if (!r.ok) throw new ApiError(r.status, data?.error ?? `Error ${r.status}`)
  return data as T
}

export interface SkillRow { name: string; level: number | null }
export interface ContactRow { label: string; value: string; url: string | null; icon: string }

export const admin = {
  me: () => send<{ ok: true }>('GET', '/me'),
  login: (password: string) => send<{ ok: true }>('POST', '/login', { password }),
  logout: () => send<{ ok: true }>('POST', '/logout'),

  content: () => send<ContentItem[]>('GET', '/content'),
  saveContent: (values: Record<string, string>) => send<{ ok: true }>('PUT', '/content', values),

  saveSkills: (rows: SkillRow[]) => send<{ ok: true }>('PUT', '/skills', rows),
  saveContactLinks: (rows: ContactRow[]) => send<{ ok: true }>('PUT', '/contact-links', rows),

  async upload(file: File): Promise<{ url: string }> {
    const fd = new FormData()
    fd.append('file', file)
    const r = await fetch('/api/admin/upload', { method: 'POST', body: fd })
    const data = await r.json().catch(() => null)
    if (!r.ok) throw new ApiError(r.status, data?.error ?? `Error ${r.status}`)
    return data as { url: string }
  },
}
