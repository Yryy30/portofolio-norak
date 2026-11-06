import { Hono } from 'hono'
import type { AppEnv } from '../types'
import type {
  ContactLink, Project, ProjectStatus, SiteContent, Skill,
} from '../../shared/types'

interface ProjectRow {
  id: number
  slug: string
  title: string
  summary: string
  description: string
  tech: string
  features: string
  role: string
  year: number | null
  status: string
  url: string | null
  repo_url: string | null
  image_key: string | null
  featured: number
  sort_order: number
}

interface ImageRow {
  id: number
  project_id: number
  image_key: string
  alt: string
  sort_order: number
}

const STATUSES: string[] = ['completed', 'in-progress', 'archived']

function parseArray(s: string): string[] {
  try {
    const v: unknown = JSON.parse(s)
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []
  } catch {
    return []
  }
}

function toProject(r: ProjectRow, imgs: ImageRow[] = []): Project {
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    summary: r.summary,
    description: r.description,
    tech: parseArray(r.tech),
    features: parseArray(r.features),
    role: r.role,
    year: r.year,
    status: (STATUSES.includes(r.status) ? r.status : 'completed') as ProjectStatus,
    url: r.url,
    repoUrl: r.repo_url,
    imageUrl: r.image_key ? `/media/${r.image_key}` : null,
    images: imgs.map((i) => ({ id: i.id, url: `/media/${i.image_key}`, alt: i.alt })),
    featured: r.featured === 1,
    sortOrder: r.sort_order,
  }
}

export const publicRoutes = new Hono<AppEnv>()

publicRoutes.get('/content', async (c) => {
  const { results } = await c.env.DB
    .prepare('SELECT key, value FROM site_content')
    .all<{ key: string; value: string }>()
  const body: SiteContent = Object.fromEntries(results.map((r) => [r.key, r.value]))
  return c.json(body)
})

publicRoutes.get('/projects', async (c) => {
  const [projects, images] = await Promise.all([
    c.env.DB
      .prepare('SELECT * FROM projects WHERE published = 1 ORDER BY sort_order, id')
      .all<ProjectRow>(),
    c.env.DB
      .prepare('SELECT * FROM project_images ORDER BY sort_order, id')
      .all<ImageRow>(),
  ])

  const byProject = new Map<number, ImageRow[]>()
  for (const img of images.results) {
    const list = byProject.get(img.project_id) ?? []
    list.push(img)
    byProject.set(img.project_id, list)
  }

  return c.json(projects.results.map((p) => toProject(p, byProject.get(p.id))))
})

publicRoutes.get('/projects/:slug', async (c) => {
  const row = await c.env.DB
    .prepare('SELECT * FROM projects WHERE slug = ? AND published = 1')
    .bind(c.req.param('slug'))
    .first<ProjectRow>()
  if (!row) return c.json({ error: 'Not found' }, 404)

  const { results } = await c.env.DB
    .prepare('SELECT * FROM project_images WHERE project_id = ? ORDER BY sort_order, id')
    .bind(row.id)
    .all<ImageRow>()
  return c.json(toProject(row, results))
})

publicRoutes.get('/skills', async (c) => {
  const { results } = await c.env.DB
    .prepare('SELECT id, name, level, sort_order FROM skills ORDER BY sort_order, id')
    .all<{ id: number; name: string; level: number | null; sort_order: number }>()
  const body: Skill[] = results.map((r) => ({
    id: r.id,
    name: r.name,
    level: r.level,
    sortOrder: r.sort_order,
  }))
  return c.json(body)
})

publicRoutes.get('/contact-links', async (c) => {
  const { results } = await c.env.DB
    .prepare('SELECT id, label, value, url, icon, sort_order FROM contact_links ORDER BY sort_order, id')
    .all<{ id: number; label: string; value: string; url: string | null; icon: string; sort_order: number }>()
  const body: ContactLink[] = results.map((r) => ({
    id: r.id,
    label: r.label,
    value: r.value,
    url: r.url,
    icon: r.icon,
    sortOrder: r.sort_order,
  }))
  return c.json(body)
})
