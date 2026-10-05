import { expect, mock, test } from 'claude-code/testing'

const PANE = {
  plugin: 'cc-dash-kit', component: 'Pane', requestId: 'cc-dash',
  viewport: { columns: 100, rows: 30 },
  props: { title: 'Dashboard', isFocused: true, bodyColumns: 48, placement: 'inline', scroll: { offset: 0, bodyRows: 20 }, view: {} },
} as const

function base(on: any, config?: unknown) {
  mock.clock(on)
  on('fs.exists', (_: any, e: any) => ({ value: !!config && e.path.endsWith('/dash.config.json') }))
  if (config) on('fs.read', () => ({ value: JSON.stringify(config) }))
  on('session.usage', () => ({ value: { rateLimits: [{ kind: 'five_hour', percentUsed: 30 }, { kind: 'seven_day', percentUsed: 60 }], context: { percent: 25 } } }))
  on('session.id', () => ({ value: 'sample-session-id' }))
  on('session.cwd', () => ({ value: '/work/project' }))
  on('command.register', () => ({ value: undefined }))
  on('tool.register', () => ({ value: undefined }))
  on('ui.open', () => ({ value: { isPlaced: true } }))
  on('ui.close', () => ({ value: undefined }))
  on('session.start', () => ({}))
}

test('empty config draws only quota and session on both surfaces', async ($, on) => {
  base(on)
  await $.command.run({ command: 'cc-dash', args: '' })
  for (const surface of ['terminal', 'desktop'] as const) {
    const ui = await $.ui.mount({ ...PANE, surface })
    const drawn = await ui.drawn()
    const tree = JSON.stringify(drawn)
    expect(tree.includes('card-quota')).toEqual(true)
    expect(tree.includes('card-session')).toEqual(true)
    expect(tree.includes('card-gpu')).toEqual(false)
    expect(tree.includes('card-disk')).toEqual(false)
    expect(tree.includes('讀取失敗')).toEqual(false)
    expect(tree.includes('Dashboard status')).toEqual(surface === 'desktop')
    await ui.unmount()
  }
})

test('one failing optional source does not hide the default cards', async ($, on) => {
  base(on, { cards: [{ id: 'quota' }, { id: 'session' }, { id: 'gpu' }] })
  on('process.run', () => ({ value: { exitCode: 1, stdout: '', stderr: 'unavailable' } }))
  await $.command.run({ command: 'cc-dash', args: '' })
  const ui = await $.ui.mount({ ...PANE, surface: 'terminal' })
  const tree = JSON.stringify(await ui.drawn())
  expect(tree.includes('card-quota')).toEqual(true)
  expect(tree.includes('card-session')).toEqual(true)
  expect(tree.includes('card-gpu')).toEqual(false)
  await ui.unmount()
})

test('opening the pane reloads a config written after session start', async ($, on) => {
  let config: unknown = null
  mock.clock(on)
  on('fs.exists', (_: any, e: any) => ({ value: !!config && e.path.endsWith('/dash.config.json') }))
  on('fs.read', () => ({ value: JSON.stringify(config) }))
  on('session.usage', () => ({ value: { rateLimits: [], context: { percent: 0 } } }))
  on('session.id', () => ({ value: 'sample-session-id' }))
  on('session.cwd', () => ({ value: '/work/project' }))
  on('command.register', () => ({ value: undefined }))
  on('ui.open', () => ({ value: { isPlaced: true } }))
  on('ui.close', () => ({ value: undefined }))
  on('process.run', (_: any, e: any) => ({ value: { exitCode: 0, stdout: e.argv[1] === '--help' ? 'help' : 'Trial GPU, 2048, 8192', stderr: '' } }))
  on('session.start', () => ({}))
  await $.command.run({ command: 'cc-dash', args: '' })
  config = { cards: [{ id: 'quota' }, { id: 'session' }, { id: 'gpu' }] }
  await $.command.run({ command: 'cc-dash', args: '' })
  const ui = await $.ui.mount({ ...PANE, surface: 'terminal' })
  expect(JSON.stringify(await ui.drawn()).includes('card-gpu')).toEqual(true)
  await ui.unmount()
})

test('pause button receives keyboard focus in the opened pane', async ($, on) => {
  base(on, { cards: [{ id: 'pause-flag', path: '/tmp/ccdk-paused' }] })
  await $.command.run({ command: 'cc-dash', args: '' })
  const ui = await $.ui.mount({ ...PANE, surface: 'terminal' })
  const tree = JSON.stringify(await ui.drawn())
  expect(tree.includes('toggle-pause-flag')).toEqual(true)
  expect(tree.includes('"autoFocus":true')).toEqual(true)
  await ui.unmount()
})

test('LANG selects panel text and config locale takes precedence', async ($, on) => {
  const config = { locale: 'zh-TW', cards: [{ id: 'quota' }, { id: 'session' }] }
  base(on, config)
  on('process.run', (_: any, e: any) => ({ value: { exitCode: e.argv[0] === 'printenv' && e.argv[1] === 'LANG' ? 0 : 1, stdout: e.argv[1] === 'LANG' ? 'en_US.UTF-8' : '', stderr: '' } }))
  await $.command.run({ command: 'cc-dash', args: '' })
  const ui = await $.ui.mount({ ...PANE, surface: 'terminal' })
  const tree = JSON.stringify(await ui.drawn())
  expect(tree.includes('Claude 額度')).toEqual(true)
  expect(tree.includes('5 小時')).toEqual(true)
  expect(tree.includes('Claude usage')).toEqual(false)
  await ui.unmount()
})

test('English LANG draws English zero-config labels', async ($, on) => {
  base(on)
  on('process.run', (_: any, e: any) => ({ value: { exitCode: e.argv[0] === 'printenv' && e.argv[1] === 'LANG' ? 0 : 1, stdout: e.argv[1] === 'LANG' ? 'en_US.UTF-8' : '', stderr: '' } }))
  await $.command.run({ command: 'cc-dash', args: '' })
  const ui = await $.ui.mount({ ...PANE, surface: 'terminal' })
  const tree = JSON.stringify(await ui.drawn())
  expect(tree.includes('Claude usage')).toEqual(true)
  expect(tree.includes('5 hours')).toEqual(true)
  expect(tree.includes('目前 Session')).toEqual(false)
  await ui.unmount()
})

test('Chinese LANG draws Chinese zero-config labels', async ($, on) => {
  base(on)
  on('process.run', (_: any, e: any) => ({ value: { exitCode: e.argv[0] === 'printenv' && e.argv[1] === 'LANG' ? 0 : 1, stdout: e.argv[1] === 'LANG' ? 'zh_TW.UTF-8' : '', stderr: '' } }))
  await $.command.run({ command: 'cc-dash', args: '' })
  const ui = await $.ui.mount({ ...PANE, surface: 'terminal' })
  const tree = JSON.stringify(await ui.drawn())
  expect(tree.includes('Claude 額度')).toEqual(true)
  expect(tree.includes('5 小時')).toEqual(true)
  expect(tree.includes('Current session')).toEqual(false)
  await ui.unmount()
})
