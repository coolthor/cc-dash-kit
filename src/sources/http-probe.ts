import type { Source } from './types'
import { identityCard } from './types'

export function parseHttpCode(output: string) {
  const code = Number(output.trim())
  if (!Number.isInteger(code) || code < 100 || code > 599) throw new Error('invalid HTTP status')
  return { rows: [{ label: 'HTTP', value: String(code), status: code < 400 ? 'ok' as const : 'error' as const }] }
}

export const httpProbe: Source = {
  id: 'http-probe', title: '端點', detect: async (_, config) => Boolean(config.url),
  sample: async ($, config) => {
    const result = await $.process.run(['curl', '--silent', '--output', '/dev/null', '--write-out', '%{http_code}', '--max-time', '3', config.url], { timeoutMs: 3500 })
    if (result.exitCode !== 0) return { rows: [{ label: '狀態', value: '離線', status: 'error' }] }
    return parseHttpCode(result.stdout)
  }, card: identityCard,
}
