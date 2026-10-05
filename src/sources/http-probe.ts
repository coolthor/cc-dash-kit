import { t } from '../i18n'
import type { Source } from './types'
import { identityCard } from './types'

export function parseHttpCode(output: string) {
  const code = Number(output.trim())
  if (!Number.isInteger(code) || code < 100 || code > 599) throw new Error('invalid HTTP status')
  return { rows: [{ label: t('http'), value: String(code), status: code < 400 ? 'ok' as const : 'error' as const }] }
}

export const httpProbe: Source = {
  id: 'http-probe', title: t('httpProbe'), detect: async (_, config) => Boolean(config.url || config.endpoints?.length),
  sample: async ($, config) => {
    const endpoints = config.endpoints || [{ name: 'HTTP', url: config.url! }]
    const rows = await Promise.all(endpoints.map(async endpoint => {
      try {
        const result = await $.process.run(['curl', '--silent', '--output', '/dev/null', '--write-out', '%{http_code}', '--max-time', '3', endpoint.url], { timeoutMs: 3500 })
        if (result.exitCode !== 0) return { label: endpoint.name, value: t('offline'), status: 'error' as const }
        const parsed = parseHttpCode(result.stdout).rows[0]
        return { ...parsed, label: endpoint.name }
      } catch { return { label: endpoint.name, value: t('offline'), status: 'error' as const } }
    }))
    return { rows }
  }, card: identityCard,
}
