import type { Source } from './types'
import { identityCard, run } from './types'

export function parseDisk(output: string) {
  const line = output.trim().split('\n').at(-1) || ''
  const parts = line.trim().split(/\s+/)
  const text = parts.find(x => /^\d+%$/.test(x))
  const pct = Number(text?.slice(0, -1))
  if (!text || !Number.isFinite(pct)) throw new Error('invalid df output')
  return { rows: [{ label: '使用率', value: `${pct}%`, percent: pct }, { label: '可用', value: parts[3] || '—' }] }
}

export const disk: Source = {
  id: 'disk', title: '磁碟', detect: async () => true,
  sample: async ($, config) => parseDisk(await run($, ['df', '-h', config.path || '/'], 3000)),
  card: identityCard,
}
