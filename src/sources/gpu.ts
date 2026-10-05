import type { Source } from './types'
import { identityCard, run } from './types'

export function parseGpu(output: string) {
  const [name, usedText, totalText] = output.trim().split(/\s*,\s*/)
  const used = Number(usedText), total = Number(totalText)
  if (!name || !Number.isFinite(used) || !Number.isFinite(total) || total <= 0) throw new Error('invalid nvidia-smi output')
  return { rows: [{ label: name, value: `${used} / ${total} MiB`, percent: used / total * 100 }] }
}

export const gpu: Source = {
  id: 'gpu', title: 'GPU',
  detect: async $ => { try { await run($, ['nvidia-smi', '--help'], 1500); return true } catch { return false } },
  sample: async $ => parseGpu(await run($, ['nvidia-smi', '--query-gpu=name,memory.used,memory.total', '--format=csv,noheader,nounits'], 3000)),
  card: identityCard,
}
