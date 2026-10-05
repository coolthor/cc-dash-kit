import { expect, test } from 'claude-code/testing'
import { parseQuota } from '../src/sources/quota'
import { parseGpu } from '../src/sources/gpu'
import { parseDisk } from '../src/sources/disk'
import { parseHttpCode } from '../src/sources/http-probe'
import { parseConfig, DEFAULT_CONFIG } from '../src/config'
import { session } from '../src/sources/session'
import { pauseFlag } from '../src/sources/pause-flag'

test('quota parses both windows and missing data', async () => {
  expect(parseQuota({ rateLimits: [{ kind: 'five_hour', percentUsed: 42 }] }).map(x => x.value)).toEqual(['42%', '未提供'])
  expect(parseQuota({ rateLimits: [] }).map(x => x.value)).toEqual(['未提供', '未提供'])
})

test('gpu and disk output parse', async () => {
  expect(parseGpu('Example GPU, 2048, 8192').rows[0].percent).toEqual(25)
  expect(parseDisk('Filesystem Size Used Avail Capacity Mounted on\n/dev/disk1 100G 25G 75G 25% /').rows[0].value).toEqual('25%')
})

test('HTTP status parses', async () => {
  expect(parseHttpCode('200').rows[0].status).toEqual('ok')
  expect(parseHttpCode('503').rows[0].status).toEqual('error')
})

test('config defaults and rejects unknown sources', async () => {
  expect(parseConfig(null)).toEqual(DEFAULT_CONFIG)
  let rejected = false
  try { parseConfig({ cards: [{ id: 'unknown' }] }) } catch { rejected = true }
  expect(rejected).toEqual(true)
})

test('config requires safe shapes for optional sources', async () => {
  for (const cards of [[{ id: 'http-probe', url: 'file:///secret' }], [{ id: 'pause-flag', path: 'relative' }]]) {
    let rejected = false
    try { parseConfig({ cards }) } catch { rejected = true }
    expect(rejected).toEqual(true)
  }
})

test('session source samples current metadata', async () => {
  const data = await session.sample({ session: { id: async () => 'abc123', cwd: async () => '/work/demo', usage: async () => ({ context: { percent: 24 } }) } }, { id: 'session' })
  expect(data.rows.map(x => x.value)).toEqual(['demo', 'abc123', '24%'])
})

test('pause flag source detects and samples a local file', async () => {
  const api = { fs: { exists: async (path: string) => path === '/tmp/paused' } }
  expect(await pauseFlag.detect(api, { id: 'pause-flag', path: '/tmp/paused' })).toEqual(true)
  expect((await pauseFlag.sample(api, { id: 'pause-flag', path: '/tmp/paused' })).rows[0].value).toEqual('暫停')
})
