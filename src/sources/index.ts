import { quota } from './quota'
import { session } from './session'
import { gpu } from './gpu'
import { disk } from './disk'
import { httpProbe } from './http-probe'
import { pauseFlag } from './pause-flag'
import type { Source } from './types'

export const sources: Record<string, Source> = { quota, session, gpu, disk, 'http-probe': httpProbe, 'pause-flag': pauseFlag }
