import { Hono } from 'hono'
import type { AppEnv } from '../types'

export const mediaRoutes = new Hono<AppEnv>()

mediaRoutes.get('/:key{.+}', async (c) => {
  const obj = await c.env.MEDIA.get(c.req.param('key'))
  if (!obj) return c.json({ error: 'Not found' }, 404)

  const headers = new Headers()
  obj.writeHttpMetadata(headers)
  headers.set('etag', obj.httpEtag)
  headers.set('cache-control', 'public, max-age=86400')
  return new Response(obj.body, { headers })
})
