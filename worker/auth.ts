import { createMiddleware } from 'hono/factory'
import { getCookie } from 'hono/cookie'
import { verify } from 'hono/jwt'
import type { AppEnv } from './types'

export const COOKIE = 'admin_session'
export const MAX_AGE = 60 * 60 * 12

export async function safeEqual(a: string, b: string): Promise<boolean> {
  const enc = new TextEncoder()
  const [ha, hb] = await Promise.all([
    crypto.subtle.digest('SHA-256', enc.encode(a)),
    crypto.subtle.digest('SHA-256', enc.encode(b)),
  ])
  return crypto.subtle.timingSafeEqual(ha, hb)
}

export const baseGuard = createMiddleware<AppEnv>(async (c, next) => {
  c.header('Cache-Control', 'no-store')
  if (c.req.method !== 'GET' && c.req.method !== 'HEAD') {
    const origin = c.req.header('origin')
    if (origin && origin !== new URL(c.req.url).origin) {
      return c.json({ error: 'Forbidden' }, 403)
    }
  }
  await next()
})

export const requireAdmin = createMiddleware<AppEnv>(async (c, next) => {
  const token = getCookie(c, COOKIE)
  if (!token || !c.env.JWT_SECRET) return c.json({ error: 'Unauthorized' }, 401)
  try {
    await verify(token, c.env.JWT_SECRET, 'HS256')
  } catch {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  await next()
})
