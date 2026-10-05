import type { SourceConfig } from './sources/types'

export type DashConfig = { cards: SourceConfig[]; refreshMs: number }
export const DEFAULT_CONFIG: DashConfig = { cards: [{ id: 'quota' }, { id: 'session' }], refreshMs: 30000 }
const IDS = new Set(['quota', 'session', 'gpu', 'disk', 'http-probe', 'pause-flag'])

export function parseConfig(value: unknown): DashConfig {
  if (value == null) return DEFAULT_CONFIG
  if (typeof value !== 'object' || Array.isArray(value)) throw new Error('config must be an object')
  const input = value as Record<string, unknown>
  if (!Array.isArray(input.cards)) throw new Error('cards must be an array')
  const cards = input.cards.map((raw, index) => {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new Error(`cards[${index}] must be an object`)
    const card = raw as Record<string, unknown>
    if (typeof card.id !== 'string' || !IDS.has(card.id)) throw new Error(`cards[${index}] has unknown source`)
    if (card.title !== undefined && (typeof card.title !== 'string' || card.title.length > 60)) throw new Error(`cards[${index}].title invalid`)
    if (card.path !== undefined && (typeof card.path !== 'string' || !card.path.startsWith('/'))) throw new Error(`cards[${index}].path must be absolute`)
    if (card.id === 'pause-flag' && !card.path) throw new Error(`cards[${index}].path required`)
    if (card.id === 'http-probe' && (typeof card.url !== 'string' || !/^https?:\/\//.test(card.url))) throw new Error(`cards[${index}].url invalid`)
    if (card.url !== undefined && (typeof card.url !== 'string' || !/^https?:\/\//.test(card.url))) throw new Error(`cards[${index}].url invalid`)
    return { id: card.id, title: card.title as string | undefined, path: card.path as string | undefined, url: card.url as string | undefined }
  })
  if (new Set(cards.map(card => card.id)).size !== cards.length) throw new Error('duplicate source id')
  const refreshMs = input.refreshMs === undefined ? 30000 : Number(input.refreshMs)
  if (!Number.isInteger(refreshMs) || refreshMs < 5000 || refreshMs > 300000) throw new Error('refreshMs must be 5000..300000')
  return { cards, refreshMs }
}
