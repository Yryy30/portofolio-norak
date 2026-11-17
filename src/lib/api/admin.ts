import type { AdminProject, ContentItem, ProjectInput } from '@shared/types'

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

async function request<T>(method: string, path: string, body?: BodyInit, headers?: HeadersInit): Promise<T> {
  const r = await fetch('/api/admin' + path, { method, headers, body })
  const data = await r.json().catch(() => null)
  if (!r.ok) throw new ApiError(r.status, data?.error ?? `Error ${r.status}`)
  return data as T
}

const send = <T>(method: string, path: string, body?: unknown) =>
  request<T>(
    method,
    path,
    body !== undefined ? JSON.stringify(body) : undefined,
    body !== undefined ? { 'content-type': 'application/json' } : undefined,
  )

function form(file: File, alt?: string) {
  const fd = new FormData()
  fd.append('file', file)
  if (alt) fd.append('alt', alt)
  return fd
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

  upload: (file: File) => request<{ url: string }>('POST', '/upload', form(file)),

  // Projects
  projects: () => send<AdminProject[]>('GET', '/projects'),
  createProject: (p: ProjectInput) => send<AdminProject>('POST', '/projects', p),
  updateProject: (id: number, p: ProjectInput) => send<AdminProject>('PUT', `/projects/${id}`, p),
  deleteProject: (id: number) => send<{ ok: true }>('DELETE', `/projects/${id}`),

  setCover: (id: number, file: File) =>
    request<AdminProject>('POST', `/projects/${id}/cover`, form(file)),
  removeCover: (id: number) => send<AdminProject>('DELETE', `/projects/${id}/cover`),

  addImage: (id: number, file: File, alt = '') =>
    request<AdminProject>('POST', `/projects/${id}/images`, form(file, alt)),
  removeImage: (id: number, imageId: number) =>
    send<AdminProject>('DELETE', `/projects/${id}/images/${imageId}`),
}
