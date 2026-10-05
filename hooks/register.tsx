import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'
import { DEFAULT_CONFIG, parseConfig } from '../src/config'
import type { DashConfig } from '../src/config'
import type { CardData, SourceConfig } from '../src/sources/types'
import { setPaused } from '../src/sources/pause-flag'
import { collectSource } from '../src/sources/collect'
import { Card, StatusDot } from '../src/ui/components'
import { parseLocale, setLocale, t } from '../src/i18n'

const PANE = 'cc-dash'
const snapshot = atom({ plugin: 'cc-dash-kit', key: 'snapshot' } as const, {} as Record<string, CardData>)
let config: DashConfig = DEFAULT_CONFIG
let configError: string | null = null
let started = false
let pauseToolRegistered = false
let detectedLocale: 'en' | 'zh-TW' = 'en'
let paneCanDock = false
let inlineHintShown = false

async function loadConfig($: any) {
  const path = `${$.plugin.root}/dash.config.json`
  if (!await $.fs.exists(path)) return DEFAULT_CONFIG
  return parseConfig(JSON.parse(await $.fs.read(path)))
}

async function sampleOne($: any, card: SourceConfig): Promise<CardData | null> {
  try {
    return await collectSource({
      session: {
        usage: () => $.session.usage(),
        id: () => $.session.id(),
        cwd: () => $.session.cwd(),
      },
      process: { run: (argv: string[], options: any) => $.process.run(argv, options) },
      fs: {
        exists: (path: string) => $.fs.exists(path),
        write: (path: string, content: string) => $.fs.write(path, content),
      },
      clock: { sleep: (ms: number) => $.clock.sleep(ms) },
    }, card)
  } catch (error) {
    return { rows: [], error: `${t('loadFailed')}: ${String(error).slice(0, 100)}` }
  }
}

async function refresh($: any) {
  try { config = await loadConfig($); configError = null }
  catch (error) {
    config = DEFAULT_CONFIG
    configError = `${t('configFailed')}: ${String(error).slice(0, 100)}`
  }
  setLocale(config.locale && config.locale !== 'auto' ? config.locale : detectedLocale)
  if (config.cards.some(card => card.id === 'pause-flag') && !pauseToolRegistered) {
    await registerPauseTool($)
    pauseToolRegistered = true
  }
  const pairs = await Promise.all(config.cards.map(async card => [card.id, await sampleOne($, card)] as const))
  await update($, snapshot, () => Object.fromEntries(pairs.filter(([, data]) => data !== null)))
}

async function detectLocale($: any): Promise<'en' | 'zh-TW'> {
  for (const key of ['LC_ALL', 'LC_MESSAGES', 'LANG']) {
    try {
      const result = await $.process.run(['printenv', key], { timeoutMs: 1000 })
      if (result.exitCode === 0 && result.stdout.trim()) return parseLocale(result.stdout.trim()) || 'en'
    } catch {}
  }
  try {
    const result = await $.process.run(['defaults', 'read', '-g', 'AppleLanguages'], { timeoutMs: 1000 })
    if (result.exitCode === 0) return parseLocale(result.stdout.match(/["']?([a-z]{2}(?:[-_][A-Za-z]+)?)/i)?.[1]) || 'en'
  } catch {}
  return 'en'
}

async function start($: any) {
  if (started) return
  started = true
  detectedLocale = await detectLocale($)
  setLocale(detectedLocale)
  void refresh($)
  $.clock.every(config.refreshMs, () => void refresh($))
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    paneCanDock = Boolean(e.viewport?.isFullscreen || e.surface === 'desktop')
    inlineHintShown = false
    await $.command.register({ name: 'cc-dash', description: 'Open the dashboard' })
    await start($)
    if (paneCanDock)
      void $.ui.open({ id: PANE, title: t('dashboard') }).catch(() => {})
    return next(e)
  })

  on('session.attach', async ($, e, next) => {
    if (e.viewport?.isFullscreen || e.surface === 'desktop') {
      paneCanDock = true
      await start($)
      void $.ui.open({ id: PANE, title: t('dashboard') }).catch(() => {})
    }
    return next(e)
  })

  on('command.run', { command: 'cc-dash' }, async $ => {
    await start($)
    await refresh($)
    await $.ui.close({ id: PANE })
    const result = await $.ui.open({ id: PANE, title: t('dashboard'), focus: true })
    return { text: result.isPlaced ? t('opened') : `${t('waiting')}: ${result.reason || 'pane unavailable'}` }
  })

  on('tool.call', { tool: 'mcp__cc-dash-kit__pause_status' }, async $ => {
    const flags = config.cards.filter(card => card.id === 'pause-flag')
    const rows = await Promise.all(flags.map(async card => {
      try { return `${card.title || card.path}: ${await $.fs.exists(card.path) ? 'paused' : 'available'}` }
      catch { return `${card.title || card.path}: unknown; do not dispatch until checked` }
    }))
    return { result: rows.join('\n') || 'No pause flags configured.' }
  })

  on('turn.complete', async ($, e, next) => {
    if (!e.agentId) void refresh($)
    return next(e)
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    paneCanDock = e.props.placement === 'dock'
    if (e.props.placement === 'inline' && !inlineHintShown) {
      inlineHintShown = true
      $.ui.toast(t('fullscreenHint'))
    }
    const ui = $.ui.resolve(e)
    const { Box, Text, Button } = ui
    const Svg = e.surface === 'desktop' ? (ui as any).Svg : undefined
    const data = await read($, snapshot)
    const width = Math.max(16, e.props.bodyColumns || 40)
    return <Box flexDirection="column">
      {config.cards.map(card => {
        const item = data[card.id]
        if (!item) return null
        const extra = card.id === 'pause-flag' ? <Button key={`toggle-${card.id}`} autoFocus label={item.rows[0]?.value === t('paused') ? t('resume') : t('pause')} onPress={async () => {
          try { await setPaused({ fs: { write: (path: string, content: string) => $.fs.write(path, content) }, process: { run: (argv: string[], options: any) => $.process.run(argv, options) } }, card.path!, item.rows[0]?.value !== t('paused')); await refresh($) }
          catch (error) { $.ui.toast(`${t('flagFailed')}: ${String(error)}`) }
        }} /> : null
        const titleKey = { quota: 'quota', session: 'session', gpu: 'gpu', disk: 'disk', 'http-probe': 'httpProbe', 'pause-flag': 'pauseFlag' }[card.id] as Parameters<typeof t>[0]
        return Card(ui, card.id, card.title || t(titleKey), item, width, extra)
      })}
      {configError && Card(ui, 'config', t('config'), { rows: [], error: configError }, width)}
      {Svg && <Box><Svg alt="Dashboard status" width={12} height={12} source={'<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12"><circle cx="6" cy="6" r="4" fill="#38b46a"/></svg>'} /><Text dimColor> cc-dash-kit</Text></Box>}
      {e.surface !== 'desktop' && <Box>{StatusDot(ui, 'ok')}<Text dimColor>cc-dash-kit</Text></Box>}
    </Box>
  })
}

async function registerPauseTool($: any) {
  await $.tool.register({ name: 'pause_status', description: 'Read configured pause flags before dispatching work to another AI. This is advisory, not a permission boundary.', inputSchema: { type: 'object', properties: {} } })
}
