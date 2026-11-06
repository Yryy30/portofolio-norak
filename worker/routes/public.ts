import { Hono } from 'hono'
import type { AppEnv } from '../types'
import type { ContactLink, Project, SiteContent, Skill } from '../../shared/types'

interface ProjectRow {
  id: number
  slug: string
  title: string
  description: string
  tech: string
  url: string | null
  image_key: string | null
  sort_order: number
}

function toProject(r: ProjectRow): Project {
  let tech: string[] = []
  try {
    tech = JSON.parse(r.tech)
  } catch {
    tech = []
  }
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    description: r.description,
    tech,
    url: r.url,
    imageUrl: r.image_key ? `/media/${r.image_key}` : null,
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
  const { results } = await c.env.DB
    .prepare('SELECT * FROM projects WHERE published = 1 ORDER BY sort_order, id')
    .all<ProjectRow>()
  return c.json(results.map(toProject))
})

publicRoutes.get('/projects/:slug', async (c) => {
  const row = await c.env.DB
    .prepare('SELECT * FROM projects WHERE slug = ? AND published = 1')
    .bind(c.req.param('slug'))
    .first<ProjectRow>()
  if (!row) return c.json({ error: 'Not found' }, 404)
  return c.json(toProject(row))
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
