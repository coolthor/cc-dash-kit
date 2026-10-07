import { atom, read, update } from 'claude-code'
import type { EngineInterface as Engine, Register } from 'claude-code'

// via: 'path' for a pasted file, 'bytes' for image data inside the prompt
type Shot = { png: string; width: number; height: number; via: 'path' | 'bytes' }

const MAX_MESSAGES = 30
// An attachment row and its prompt can arrive in either order; pair them within this window
const WINDOW_MS = 5_000

const shots = atom({ plugin: 'image-peek', key: 'shots' } as const, {} as Record<string, Shot[]>)
const lastPrompt = atom({ plugin: 'image-peek', key: 'lastPrompt' } as const, null as null | { uuid: string; at: number })
const pending = atom({ plugin: 'image-peek', key: 'pending' } as const, null as null | { at: number; shots: Shot[] })

export const register: Register = on => {
  on('session.append', async ($, e, next) => {
    const result = await next(e)
    if (e.agentId !== undefined) return result
    collectShots($, e).catch(err => $.ui.log(`image-peek: could not read pasted image: ${String(err)}`))
    return result
  })

  on('ui.render', { component: 'UserMessage' }, async ($, e, next) => {
    const drawn = await next(e)
    if (e.surface !== 'terminal') return drawn
    const all = await read($, shots)
    // A message row's requestId is its uuid with the last group zeroed, so match the first four groups
    const stem = e.requestId.slice(0, 23)
    const list = all[e.requestId] ?? Object.entries(all).find(([k]) => k.slice(0, 23) === stem)?.[1]
    if (!list?.length) return drawn
    const { Box, Image } = $.ui.resolve(e)
    const room = (e.viewport?.columns ?? 80) - 4
    return <Box flexDirection="column">
      {drawn}
      {list.map((shot, i) => {
        // A cell is about twice as tall as it is wide
        let columns = Math.max(8, Math.min(48, room))
        let rows = Math.round(columns * shot.height / shot.width / 2)
        if (rows > 24) { columns = Math.max(8, Math.round(columns * 24 / rows)); rows = 24 }
        return <Image key={`shot-${i}`} source={{ file: shot.png, format: 'png' }} columns={columns} rows={Math.max(2, rows)} alt="[image preview needs a terminal with kitty graphics, e.g. Ghostty or kitty]" />
      })}
    </Box>
  })
}

export async function collectShots($: Engine, e: { door: string; uuid: string; message: { type: string; content?: unknown } }) {
  const now = Date.now()
  const isPrompt = e.door === 'prompt' && e.message.type === 'user'
  if (isPrompt) await update($, lastPrompt, () => ({ uuid: e.uuid, at: now }))
  const blocks = Array.isArray(e.message.content) ? e.message.content as { type?: string; text?: string; source?: { type?: string; data?: string } }[] : []
  const text = blocks.map(b => b.text ?? '').join('\n')
  const paths = [...text.matchAll(/\[Image: source: ([^\]]+)\]/g)].map(m => (m[1] ?? '').trim())
  // A pasted file brings its path; a clipboard paste brings only the bytes inside the prompt
  const inputs: { arg: string; stdin?: string; via: Shot['via'] }[] = paths.length
    ? paths.map(arg => ({ arg, via: 'path' as const }))
    : isPrompt
      ? blocks.filter(b => b.type === 'image' && b.source?.type === 'base64' && b.source.data).map(b => ({ arg: '-', stdin: b.source?.data as string, via: 'bytes' as const }))
      : []
  const script = `${$.plugin.root}/hooks/preview.py`
  const found: Shot[] = []
  for (const input of inputs) {
    const r = await $.process.run(['python3', script, input.arg], { timeoutMs: 15_000, ...(input.stdin ? { stdin: input.stdin } : {}) })
    if (r.exitCode !== 0) { $.ui.log(`image-peek: ${r.stderr.trim() || `exit ${r.exitCode}`}`); continue }
    found.push({ ...JSON.parse(r.stdout) as Omit<Shot, 'via'>, via: input.via })
  }
  if (isPrompt) {
    // Claim images from an attachment row that arrived first
    const waiting = await read($, pending)
    if (waiting && now - waiting.at <= WINDOW_MS) {
      found.unshift(...waiting.shots)
      await update($, pending, () => null)
    }
    return attach($, e.uuid, found)
  }
  if (!found.length) return
  const last = await read($, lastPrompt)
  if (last && now - last.at <= WINDOW_MS) return attach($, last.uuid, found)
  // The prompt has not arrived yet: hold the images for the next one
  await update($, pending, () => ({ at: now, shots: found }))
}

async function attach($: Engine, target: string, found: Shot[]) {
  if (!found.length) return
  await update($, shots, all => {
    // The same image can arrive twice, once as a path and once as bytes: drop the second copy, matched by size
    const merged = [...(all?.[target] ?? [])]
    for (const f of found) if (!merged.some(s => s.png === f.png || (s.via !== f.via && s.width === f.width && s.height === f.height))) merged.push(f)
    const next = { ...all, [target]: merged }
    const keys = Object.keys(next)
    for (const k of keys.slice(0, Math.max(0, keys.length - MAX_MESSAGES))) delete next[k]
    return next
  })
}
