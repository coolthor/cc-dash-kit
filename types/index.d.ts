export type DashRow = { label: string; value: string; percent?: number; status?: 'ok' | 'warn' | 'error' }
export type DashCard = { rows: DashRow[]; note?: string; error?: string }

declare module 'claude-code' {
  interface PluginState {
    'cc-dash-kit': { snapshot: Record<string, DashCard> }
  }
}
