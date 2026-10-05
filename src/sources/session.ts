import { t } from '../i18n'
import type { Source } from './types'
import { identityCard } from './types'

export const session: Source = {
  id: 'session', title: t('session'), detect: async () => true,
  sample: async $ => {
    const [id, cwd, usage] = await Promise.all([
      $.session.id().catch(() => t('unavailable')),
      $.session.cwd().catch(() => '/'),
      $.session.usage().catch(() => null),
    ])
    const name = String(cwd).split('/').filter(Boolean).pop() || '/'
    const used = usage?.context?.percent
    return { rows: [
      { label: t('directory'), value: name },
      { label: 'ID', value: String(id).slice(0, 12) },
      { label: t('context'), value: typeof used === 'number' ? `${Math.round(used)}%` : t('unavailable'), percent: used },
    ] }
  }, card: identityCard,
}
