export type RowData = { label: string; value: string; percent?: number; status?: 'ok' | 'warn' | 'error' }
export type CardData = { rows: RowData[]; note?: string; error?: string }
export type SourceConfig = { id: string; title?: string; path?: string; url?: string; endpoints?: { name: string; url: string }[] }
export type Source = {
  id: string
  title: string
  detect: ($: any, config: SourceConfig) => Promise<boolean>
  sample: ($: any, config: SourceConfig) => Promise<CardData>
  card: (data: CardData) => CardData
}
export const identityCard = (data: CardData) => data
export async function run($: any, argv: string[], timeoutMs = 3000) {
  const result = await $.process.run(argv, { timeoutMs })
  if (result.exitCode !== 0) throw new Error(`${argv[0]} exited ${result.exitCode}`)
  return result.stdout as string
}
