import type { Source } from './types'
import { identityCard } from './types'

export function parseQuota(usage: any) {
  const limits = Array.isArray(usage?.rateLimits) ? usage.rateLimits : []
  return ['five_hour', 'seven_day'].map(kind => {
    const item = limits.find((one: any) => one.kind === kind)
    return { label: kind === 'five_hour' ? '5 小時' : '每週', value: item ? `${Math.round(item.percentUsed)}%` : '未提供', percent: item?.percentUsed, status: item?.percentUsed >= 90 ? 'warn' as const : 'ok' as const }
  })
}

export const quota: Source = {
  id: 'quota', title: 'Claude 額度', detect: async () => true,
  sample: async $ => {
    let usage: any = null
    try { usage = await $.session.usage() } catch {}
    return { rows: parseQuota(usage), note: '訂閱額度資料可能要送出首則訊息後才有' }
  },
  card: identityCard,
}
