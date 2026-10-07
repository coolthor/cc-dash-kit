import { expect, test } from 'claude-code/testing'

// session.append cannot be driven from the test kit and the test $ has no state, so the paste path is verified in a live session
test('message rows without pasted images keep the engine drawing on every surface', async ($, on) => {
  on('ui.render', () => ({ type: 'engine', ref: 0 }) as never)
  for (const surface of ['terminal', 'desktop'] as const) {
    const row = await $.ui.mount({ plugin: 'image-peek', component: 'UserMessage', surface, requestId: 'u-none', viewport: { columns: 100, rows: 40 }, props: { text: 'hello', origin: { kind: 'prompt' }, isExpanded: false } } as never)
    const tree = JSON.stringify(await row.drawn())
    expect(tree).not.toContain('shot-0')
    expect(tree).toContain('engine')
    await row.unmount()
  }
})
