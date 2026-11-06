import { Hono } from 'hono'
import type { HealthResponse } from '../shared/types'
import type { AppEnv } from './types'
import { publicRoutes } from './routes/public'
import { mediaRoutes } from './routes/media'

const app = new Hono<AppEnv>()

app.get('/api/health', (c) => {
  const body: HealthResponse = { ok: true, time: new Date().toISOString() }
  return c.json(body)
})

app.route('/api', publicRoutes)
app.route('/media', mediaRoutes)

app.notFound((c) => c.json({ error: 'Not found' }, 404))

export default app
