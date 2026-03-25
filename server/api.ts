import { Hono } from 'hono'
import { getCookie, setCookie, deleteCookie } from 'hono/cookie'

const COOKIE_NAME = 'ghcd_token'
const GITHUB_GRAPHQL = 'https://api.github.com/graphql'

const api = new Hono()

api.post('/api/pat', async (c) => {
  const { token } = await c.req.json<{ token: string }>()
  if (!token) return c.json({ error: 'Missing token' }, 400)

  setCookie(c, COOKIE_NAME, token, {
    httpOnly: true,
    secure: c.req.url.startsWith('https'),
    sameSite: 'Strict',
    path: '/',
    maxAge: 60 * 60 * 24 * 90, // 90 days
  })

  return c.json({ ok: true })
})

api.delete('/api/pat', (c) => {
  deleteCookie(c, COOKIE_NAME, { path: '/' })
  return c.json({ ok: true })
})

api.get('/api/pat/status', (c) => {
  const token = getCookie(c, COOKIE_NAME)
  return c.json({ hasToken: !!token })
})

api.post('/api/graphql', async (c) => {
  const token = getCookie(c, COOKIE_NAME)
  if (!token) return c.json({ error: 'No token set' }, 401)

  const body = await c.req.text()

  const res = await fetch(GITHUB_GRAPHQL, {
    method: 'POST',
    headers: {
      Authorization: `bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body,
  })

  return c.json(await res.json(), res.status as 200)
})

export default api
