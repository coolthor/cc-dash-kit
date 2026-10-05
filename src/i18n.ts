export const messages = {
  en: {
    dashboard: 'Dashboard', quota: 'Claude usage', session: 'Current session', gpu: 'GPU', disk: 'Disk', httpProbe: 'Endpoints', pauseFlag: 'Dispatch pause', config: 'Config',
    fiveHour: '5 hours', weekly: 'Weekly', unavailable: 'Unavailable', quotaHint: 'Usage may appear after your first message', directory: 'Folder', context: 'Context', usage: 'Used', free: 'Free',
    http: 'HTTP', dispatch: 'Dispatch', paused: 'Paused', available: 'Available', pause: 'Pause', resume: 'Resume', status: 'Status', offline: 'Offline', loadFailed: 'Read failed', configFailed: 'Config error', flagFailed: 'Flag update failed',
    opened: 'Dashboard opened.', waiting: 'Dashboard waiting', fullscreenHint: 'Sidebar requires fullscreen layout. Run /tui fullscreen, then /cc-dash.', footer: 'cc-dash-kit',
  },
  'zh-TW': {
    dashboard: '看板', quota: 'Claude 額度', session: '目前 Session', gpu: 'GPU', disk: '磁碟', httpProbe: '端點', pauseFlag: '派工暫停', config: '設定',
    fiveHour: '5 小時', weekly: '每週', unavailable: '未提供', quotaHint: '訂閱額度資料可能要送出首則訊息後才有', directory: '目錄', context: 'Context', usage: '使用率', free: '可用',
    http: 'HTTP', dispatch: '派工', paused: '暫停', available: '可用', pause: '暫停', resume: '恢復', status: '狀態', offline: '離線', loadFailed: '讀取失敗', configFailed: '設定錯誤', flagFailed: '旗標更新失敗',
    opened: '看板已開啟。', waiting: '看板等待中', fullscreenHint: '側邊欄需要全螢幕版面。執行 /tui fullscreen，再執行 /cc-dash。', footer: 'cc-dash-kit',
  },
} as const
export type Locale = keyof typeof messages
export type MessageKey = keyof typeof messages.en
let current: Locale = 'en'
export const setLocale = (locale: Locale) => { current = locale }
export const t = (key: MessageKey): string => messages[current][key]
export function parseLocale(value: unknown): Locale | undefined {
  if (typeof value !== 'string') return undefined
  return /^zh(?:[_-]|$)/i.test(value) ? 'zh-TW' : value.toLowerCase().startsWith('en') ? 'en' : undefined
}
