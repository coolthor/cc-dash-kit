import { sources } from './index'
import type { CardData, SourceConfig } from './types'

export async function collectSource($: any, card: SourceConfig): Promise<CardData | null> {
  const source = sources[card.id]
  if (!await source.detect($, card)) return null
  const data = await Promise.race([
    source.sample($, card),
    $.clock.sleep(4000).then(() => { throw new Error('sample timed out') }),
  ])
  return source.card(data)
}
