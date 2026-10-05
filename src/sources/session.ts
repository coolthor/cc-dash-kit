import type { Source } from './types'
import { identityCard } from './types'

export const session: Source = {
  id: 'session', title: '目前 Session', detect: async () => true,
  sample: async $ => {
    const [id, cwd, usage] = await Promise.all([
      $.session.id().catch(() => '未提供'),
      $.session.cwd().catch(() => '/'),
      $.session.usage().catch(() => null),
    ])
    const name = String(cwd).split('/').filter(Boolean).pop() || '/'
    const used = usage?.context?.percent
    return { rows: [
      { label: '目錄', value: name },
      { label: 'ID', value: String(id).slice(0, 12) },
      { label: 'Context', value: typeof used === 'number' ? `${Math.round(used)}%` : '未提供', percent: used },
    ] }
  }, card: identityCard,
}
