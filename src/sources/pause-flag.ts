import { t } from '../i18n'
import type { Source } from './types'
import { identityCard } from './types'

export const pauseFlag: Source = {
  id: 'pause-flag', title: t('pauseFlag'), detect: async (_, config) => Boolean(config.path),
  sample: async ($, config) => ({ rows: [{ label: t('dispatch'), value: await $.fs.exists(config.path) ? t('paused') : t('available') }] }),
  card: identityCard,
}

export async function setPaused($: any, path: string, paused: boolean) {
  if (paused) await $.fs.write(path, 'paused\n')
  else {
    const result = await $.process.run(['rm', '-f', '--', path], { timeoutMs: 3000 })
    if (result.exitCode !== 0) throw new Error(`rm exited ${result.exitCode}`)
  }
}
