import type { Plugin } from 'vite'
import api from './api'

export default function apiPlugin(): Plugin {
  return {
    name: 'ghcd-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/')) return next()

        const response = await api.fetch(
          new Request(new URL(req.url, `http://${req.headers.host}`), {
            method: req.method,
            headers: req.headers as HeadersInit,
            body: ['POST', 'PUT', 'PATCH'].includes(req.method ?? '')
              ? await new Promise<string>((resolve) => {
                  let data = ''
                  req.on('data', (chunk) => (data += chunk))
                  req.on('end', () => resolve(data))
                })
              : undefined,
          }),
        )

        res.statusCode = response.status
        response.headers.forEach((value, key) => {
          res.setHeader(key, value)
        })
        res.end(await response.text())
      })
    },
  }
}
