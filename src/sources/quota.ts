import { t } from '../i18n'
import type { Source } from './types'
import { identityCard } from './types'

export function parseQuota(usage: any) {
  const limits = Array.isArray(usage?.rateLimits) ? usage.rateLimits : []
  return ['five_hour', 'seven_day'].map(kind => {
    const item = limits.find((one: any) => one.kind === kind)
    return { label: kind === 'five_hour' ? t('fiveHour') : t('weekly'), value: item ? `${Math.round(item.percentUsed)}%` : t('unavailable'), percent: item?.percentUsed, status: item?.percentUsed >= 90 ? 'warn' as const : 'ok' as const }
  })
}

export const quota: Source = {
  id: 'quota', title: t('quota'), detect: async () => true,
  sample: async $ => {
    let usage: any = null
    try { usage = await $.session.usage() } catch {}
    return { rows: parseQuota(usage), note: !Array.isArray(usage?.rateLimits) || usage.rateLimits.length === 0 ? t('quotaHint') : undefined }
  },
  card: identityCard,
}
