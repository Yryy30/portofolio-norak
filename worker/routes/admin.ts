import { Hono } from 'hono'
import type { Context } from 'hono'
import { deleteCookie, setCookie } from 'hono/cookie'
import { sign } from 'hono/jwt'
import type { AppEnv } from '../types'
import type { AdminProject, ContentFieldType, ContentItem, ProjectInput } from '../../shared/types'
import { COOKIE, MAX_AGE, baseGuard, requireAdmin, safeEqual } from '../auth'
import {
  CONTACT_URL, bad, intOrNull, isObj, link, parseProject, readJson, text, validateContentValue,
} from '../validate'
import { toProject } from './public'
import type { ImageRow, ProjectRow } from './public'

export const adminRoutes = new Hono<AppEnv>()

adminRoutes.use('*', baseGuard)

// ---------- Auth ----------

adminRoutes.post('/login', async (c) => {
  if (!c.env.ADMIN_PASSWORD || !c.env.JWT_SECRET) {
    return c.json({ error: 'Server not configured' }, 500)
  }
  const b = await readJson(c)
  const pw = isObj(b) && typeof b.password === 'string' ? b.password : ''

  if (!(await safeEqual(pw, c.env.ADMIN_PASSWORD))) {
    await new Promise((r) => setTimeout(r, 600))
    return c.json({ error: 'Wrong password' }, 401)
  }

  const token = await sign(
    { sub: 'admin', exp: Math.floor(Date.now() / 1000) + MAX_AGE },
    c.env.JWT_SECRET,
    'HS256',
  )
  setCookie(c, COOKIE, token, {
    httpOnly: true,
    secure: new URL(c.req.url).protocol === 'https:',
    sameSite: 'Strict',
    path: '/api',
    maxAge: MAX_AGE,
  })
  return c.json({ ok: true })
})

adminRoutes.post('/logout', (c) => {
  deleteCookie(c, COOKIE, { path: '/api' })
  return c.json({ ok: true })
})

// ---------- Login Required ----------

adminRoutes.use('*', requireAdmin)

adminRoutes.get('/me', (c) => c.json({ ok: true }))

// ---------- Helper ----------

const idParam = (c: Context<AppEnv>, name = 'id'): number | null => {
  const n = Number(c.req.param(name))
  return Number.isInteger(n) && n > 0 ? n : null
}

const isUnique = (e: unknown) => e instanceof Error && /UNIQUE/i.test(e.message)

const IMAGE_TYPES: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'avif',
}
const MAX_BYTES = 5 * 1024 * 1024

interface IncomingImage {
  file: File
  ext: string
  alt: string
}

async function readImage(c: Context<AppEnv>): Promise<IncomingImage | string> {
  let form: FormData
  try {
    form = await c.req.formData()
  } catch {
    return 'Expected multipart form data'
  }
  const file = form.get('file')
  if (!(file instanceof File)) return 'Field "file" is required'
  const ext = IMAGE_TYPES[file.type]
  if (!ext) return 'Only png, jpg, webp, gif, or avif images are allowed'
  if (file.size > MAX_BYTES) return 'Image is too big (max 5MB)'
  const alt = form.get('alt')
  return { file, ext, alt: typeof alt === 'string' ? alt.trim().slice(0, 200) : '' }
}

async function storeImage(bucket: R2Bucket, img: IncomingImage, folder: string): Promise<string> {
  const key = `${folder}/${crypto.randomUUID()}.${img.ext}`
  await bucket.put(key, await img.file.arrayBuffer(), {
    httpMetadata: { contentType: img.file.type },
  })
  return key
}

async function loadProject(db: D1Database, id: number): Promise<AdminProject | null> {
  const row = await db.prepare('SELECT * FROM projects WHERE id = ?').bind(id).first<ProjectRow>()
  if (!row) return null
  const { results } = await db
    .prepare('SELECT * FROM project_images WHERE project_id = ? ORDER BY sort_order, id')
    .bind(id)
    .all<ImageRow>()
  return { ...toProject(row, results), published: row.published === 1 }
}

const projectValues = (p: ProjectInput) => [
  p.slug, p.title, p.summary, p.description,
  JSON.stringify(p.tech), JSON.stringify(p.features),
  p.role, p.year, p.status, p.url, p.repoUrl,
  p.featured ? 1 : 0, p.sortOrder, p.published ? 1 : 0,
]

// ---------- Upload (mis. home_image) ----------

adminRoutes.post('/upload', async (c) => {
  const img = await readImage(c)
  if (typeof img === 'string') return bad(c, img)
  const key = await storeImage(c.env.MEDIA, img, 'site')
  return c.json({ url: `/media/${key}` })
})

// ---------- Site content ----------

adminRoutes.get('/content', async (c) => {
  const { results } = await c.env.DB
    .prepare('SELECT key, value, type, group_name, label, sort_order FROM site_content ORDER BY group_name, sort_order')
    .all<{ key: string; value: string; type: ContentFieldType; group_name: string; label: string; sort_order: number }>()
  const body: ContentItem[] = results.map((r) => ({
    key: r.key,
    value: r.value,
    type: r.type,
    group: r.group_name,
    label: r.label,
    sortOrder: r.sort_order,
  }))
  return c.json(body)
})

// body
adminRoutes.put('/content', async (c) => {
  const b = await readJson(c)
  if (!isObj(b)) return bad(c, 'Invalid body')

  const { results } = await c.env.DB
    .prepare('SELECT key, type FROM site_content')
    .all<{ key: string; type: ContentFieldType }>()
  const types = new Map(results.map((r) => [r.key, r.type]))

  const stmts: D1PreparedStatement[] = []
  for (const [k, v] of Object.entries(b)) {
    const t = types.get(k)
    if (!t) return bad(c, `Unknown key: ${k}`)
    if (typeof v !== 'string') return bad(c, `${k}: must be a string`)
    const err = validateContentValue(t, v)
    if (err) return bad(c, `${k}: ${err}`)
    stmts.push(
      c.env.DB
        .prepare("UPDATE site_content SET value = ?, updated_at = datetime('now') WHERE key = ?")
        .bind(t === 'textarea' ? v : v.trim(), k),
    )
  }
  if (stmts.length) await c.env.DB.batch(stmts)
  return c.json({ ok: true })
})

// ---------- Projects ----------

adminRoutes.get('/projects', async (c) => {
  const [projects, images] = await Promise.all([
    c.env.DB.prepare('SELECT * FROM projects ORDER BY sort_order, id').all<ProjectRow>(),
    c.env.DB.prepare('SELECT * FROM project_images ORDER BY sort_order, id').all<ImageRow>(),
  ])
  const byProject = new Map<number, ImageRow[]>()
  for (const img of images.results) {
    const list = byProject.get(img.project_id) ?? []
    list.push(img)
    byProject.set(img.project_id, list)
  }
  const body: AdminProject[] = projects.results.map((p) => ({
    ...toProject(p, byProject.get(p.id)),
    published: p.published === 1,
  }))
  return c.json(body)
})

adminRoutes.post('/projects', async (c) => {
  const p = parseProject(await readJson(c))
  if (typeof p === 'string') return bad(c, p)
  try {
    const res = await c.env.DB
      .prepare(
        `INSERT INTO projects
         (slug, title, summary, description, tech, features, role, year, status, url, repo_url, featured, sort_order, published)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(...projectValues(p))
      .run()
    return c.json(await loadProject(c.env.DB, res.meta.last_row_id), 201)
  } catch (e) {
    if (isUnique(e)) return c.json({ error: 'Slug already used' }, 409)
    throw e
  }
})

adminRoutes.put('/projects/:id', async (c) => {
  const id = idParam(c)
  if (!id) return bad(c, 'Invalid id')
  const p = parseProject(await readJson(c))
  if (typeof p === 'string') return bad(c, p)
  try {
    const res = await c.env.DB
      .prepare(
        `UPDATE projects SET
           slug = ?, title = ?, summary = ?, description = ?, tech = ?, features = ?,
           role = ?, year = ?, status = ?, url = ?, repo_url = ?, featured = ?,
           sort_order = ?, published = ?, updated_at = datetime('now')
         WHERE id = ?`,
      )
      .bind(...projectValues(p), id)
      .run()
    if (res.meta.changes === 0) return c.json({ error: 'Not found' }, 404)
    return c.json(await loadProject(c.env.DB, id))
  } catch (e) {
    if (isUnique(e)) return c.json({ error: 'Slug already used' }, 409)
    throw e
  }
})

adminRoutes.delete('/projects/:id', async (c) => {
  const id = idParam(c)
  if (!id) return bad(c, 'Invalid id')

  const row = await c.env.DB
    .prepare('SELECT image_key FROM projects WHERE id = ?')
    .bind(id)
    .first<{ image_key: string | null }>()
  if (!row) return c.json({ error: 'Not found' }, 404)

  const imgs = await c.env.DB
    .prepare('SELECT image_key FROM project_images WHERE project_id = ?')
    .bind(id)
    .all<{ image_key: string }>()

  await c.env.DB.prepare('DELETE FROM projects WHERE id = ?').bind(id).run() // gallery ikut terhapus (CASCADE)

  const keys = imgs.results.map((i) => i.image_key)
  if (row.image_key) keys.push(row.image_key)
  if (keys.length) await c.env.MEDIA.delete(keys)
  return c.json({ ok: true })
})

// Cover
adminRoutes.post('/projects/:id/cover', async (c) => {
  const id = idParam(c)
  if (!id) return bad(c, 'Invalid id')
  const row = await c.env.DB
    .prepare('SELECT image_key FROM projects WHERE id = ?')
    .bind(id)
    .first<{ image_key: string | null }>()
  if (!row) return c.json({ error: 'Not found' }, 404)

  const img = await readImage(c)
  if (typeof img === 'string') return bad(c, img)

  const key = await storeImage(c.env.MEDIA, img, 'projects')
  await c.env.DB
    .prepare("UPDATE projects SET image_key = ?, updated_at = datetime('now') WHERE id = ?")
    .bind(key, id)
    .run()
  if (row.image_key) await c.env.MEDIA.delete(row.image_key)
  return c.json(await loadProject(c.env.DB, id))
})

adminRoutes.delete('/projects/:id/cover', async (c) => {
  const id = idParam(c)
  if (!id) return bad(c, 'Invalid id')
  const row = await c.env.DB
    .prepare('SELECT image_key FROM projects WHERE id = ?')
    .bind(id)
    .first<{ image_key: string | null }>()
  if (!row) return c.json({ error: 'Not found' }, 404)

  await c.env.DB
    .prepare("UPDATE projects SET image_key = NULL, updated_at = datetime('now') WHERE id = ?")
    .bind(id)
    .run()
  if (row.image_key) await c.env.MEDIA.delete(row.image_key)
  return c.json(await loadProject(c.env.DB, id))
})

// Gallery
adminRoutes.post('/projects/:id/images', async (c) => {
  const id = idParam(c)
  if (!id) return bad(c, 'Invalid id')
  const exists = await c.env.DB.prepare('SELECT 1 AS x FROM projects WHERE id = ?').bind(id).first()
  if (!exists) return c.json({ error: 'Not found' }, 404)

  const img = await readImage(c)
  if (typeof img === 'string') return bad(c, img)

  const key = await storeImage(c.env.MEDIA, img, 'projects')
  await c.env.DB
    .prepare(
      `INSERT INTO project_images (project_id, image_key, alt, sort_order)
       VALUES (?, ?, ?, (SELECT COALESCE(MAX(sort_order), 0) + 1 FROM project_images WHERE project_id = ?))`,
    )
    .bind(id, key, img.alt, id)
    .run()
  return c.json(await loadProject(c.env.DB, id), 201)
})

adminRoutes.delete('/projects/:id/images/:imageId', async (c) => {
  const id = idParam(c)
  const imageId = idParam(c, 'imageId')
  if (!id || !imageId) return bad(c, 'Invalid id')

  const row = await c.env.DB
    .prepare('SELECT image_key FROM project_images WHERE id = ? AND project_id = ?')
    .bind(imageId, id)
    .first<{ image_key: string }>()
  if (!row) return c.json({ error: 'Not found' }, 404)

  await c.env.DB.prepare('DELETE FROM project_images WHERE id = ?').bind(imageId).run()
  await c.env.MEDIA.delete(row.image_key)
  return c.json(await loadProject(c.env.DB, id))
})

adminRoutes.put('/skills', async (c) => {
  const b = await readJson(c)
  if (!Array.isArray(b) || b.length > 50) return bad(c, 'Expected an array (max 50)')

  const stmts: D1PreparedStatement[] = [c.env.DB.prepare('DELETE FROM skills')]
  for (const [i, s] of b.entries()) {
    if (!isObj(s)) return bad(c, 'Invalid item')
    const name = text(s.name, 60)
    if (!name) return bad(c, 'Skill name is required')
    const level = intOrNull(s.level)
    if (level === undefined || (level !== null && (level < 0 || level > 100))) {
      return bad(c, `${name}: level must be 0-100`)
    }
    stmts.push(
      c.env.DB.prepare('INSERT INTO skills (name, level, sort_order) VALUES (?, ?, ?)').bind(name, level, i + 1),
    )
  }
  await c.env.DB.batch(stmts)
  return c.json({ ok: true })
})

// Contact
adminRoutes.put('/contact-links', async (c) => {
  const b = await readJson(c)
  if (!Array.isArray(b) || b.length > 30) return bad(c, 'Expected an array (max 30)')

  const stmts: D1PreparedStatement[] = [c.env.DB.prepare('DELETE FROM contact_links')]
  for (const [i, l] of b.entries()) {
    if (!isObj(l)) return bad(c, 'Invalid item')
    const label = text(l.label, 40)
    const value = text(l.value, 200)
    if (!label || !value) return bad(c, 'Label and value are required')
    const url = link(l.url, CONTACT_URL)
    if (url === undefined) return bad(c, `${label}: link must start with http(s)://, mailto:, or tel:`)
    const icon = text(l.icon, 8) || '🔗'
    stmts.push(
      c.env.DB
        .prepare('INSERT INTO contact_links (label, value, url, icon, sort_order) VALUES (?, ?, ?, ?, ?)')
        .bind(label, value, url, icon, i + 1),
    )
  }
  await c.env.DB.batch(stmts)
  return c.json({ ok: true })
})
