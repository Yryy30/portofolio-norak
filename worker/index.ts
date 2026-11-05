import { Hono } from 'hono'
import type { HealthResponse } from '../shared/types'

type Bindings = {
  DB: D1Database
  MEDIA: R2Bucket
}

const app = new Hono<{ Bindings: Bindings }>()

app.get('/api/health', (c) => {
  const body: HealthResponse = { ok: true, time: new Date().toISOString() }
  return c.json(body)
})

app.notFound((c) => c.json({ error: 'Not found' }, 404))

export default app
