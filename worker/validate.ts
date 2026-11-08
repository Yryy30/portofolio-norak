import type { Context } from 'hono'
import type { AppEnv } from './types'
import type { ContentFieldType, ProjectInput, ProjectStatus } from '../shared/types'

export const STATUSES: ProjectStatus[] = ['completed', 'in-progress', 'archived']

export const isObj = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v)

export const text = (v: unknown, max: number): string =>
  typeof v === 'string' ? v.trim().slice(0, max) : ''

export const strList = (v: unknown): string[] =>
  Array.isArray(v)
    ? v.filter((x): x is string => typeof x === 'string').map((s) => s.trim()).filter(Boolean).slice(0, 30)
    : []

export const bad = (c: Context<AppEnv>, msg: string) => c.json({ error: msg }, 400)

export async function readJson(c: Context<AppEnv>): Promise<unknown> {
  try {
    return await c.req.json()
  } catch {
    return null
  }
}

const HTTP = /^https?:\/\//i
export const CONTACT_URL = /^(https?:\/\/|mailto:|tel:)/i

export function link(v: unknown, re: RegExp = HTTP): string | null | undefined {
  if (v === null || v === undefined || v === '') return null
  if (typeof v !== 'string') return undefined
  const s = v.trim()
  return s.length <= 500 && re.test(s) ? s : undefined
}

export function intOrNull(v: unknown): number | null | undefined {
  if (v === null || v === undefined || v === '') return null
  const n = Number(v)
  return Number.isInteger(n) ? n : undefined
}

export function validateContentValue(type: ContentFieldType, v: string): string | null {
  if (v.length > 5000) return 'Too long'
  if (type === 'number' && v.trim() !== '' && !Number.isFinite(Number(v))) return 'Must be a number'
  if (type === 'url' && v.trim() !== '' && !/^(https?:\/\/|\/)/i.test(v.trim())) {
    return 'Must start with http(s):// or /'
  }
  return null
}

export function parseProject(b: unknown): ProjectInput | string {
  if (!isObj(b)) return 'Invalid body'

  const slug = text(b.slug, 80).toLowerCase()
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) return 'Slug: lowercase letters, numbers, and hyphens only'

  const title = text(b.title, 120)
  if (!title) return 'Title is required'

  const status = b.status
  if (typeof status !== 'string' || !STATUSES.includes(status as ProjectStatus)) return 'Invalid status'

  const year = intOrNull(b.year)
  if (year === undefined || (year !== null && (year < 1990 || year > 2100))) return 'Invalid year'

  const url = link(b.url)
  const repoUrl = link(b.repoUrl)
  if (url === undefined || repoUrl === undefined) return 'Link must start with http:// or https://'

  const sortOrder = intOrNull(b.sortOrder) ?? 0
  if (sortOrder === undefined) return 'Invalid sort order'

  return {
    slug,
    title,
    summary: text(b.summary, 300),
    description: text(b.description, 5000),
    tech: strList(b.tech),
    features: strList(b.features),
    role: text(b.role, 80),
    year,
    status: status as ProjectStatus,
    url,
    repoUrl,
    featured: b.featured === true,
    published: b.published !== false,
    sortOrder,
  }
}
