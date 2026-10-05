import type { CardData, RowData } from '../sources/types'

export function Bar(ui: any, percent: number | undefined, bodyColumns: number) {
  const { Text } = ui
  if (percent === undefined) return null
  const width = Math.max(2, Math.min(14, bodyColumns - 18))
  const fill = Math.round(Math.max(0, Math.min(100, percent)) * width / 100)
  return <Text><Text color={percent >= 90 ? 'red' : percent >= 75 ? 'yellow' : 'green'}>{'━'.repeat(fill)}</Text><Text color="gray">{'─'.repeat(width - fill)}</Text></Text>
}

export function StatusDot(ui: any, status: RowData['status']) {
  const { Text } = ui
  return <Text color={status === 'error' ? 'red' : status === 'warn' ? 'yellow' : 'green'}>● </Text>
}

export function Row(ui: any, row: RowData, bodyColumns: number, key: string) {
  const { Box, Text } = ui
  return <Box key={key} flexDirection="row">
    <Box width={bodyColumns < 28 ? 7 : 10} flexShrink={0}><Text wrap="truncate-end">{row.label}</Text></Box>
    {row.status && StatusDot(ui, row.status)}
    <Box flexGrow={1} flexShrink={1}><Text wrap="truncate-end">{row.value}</Text></Box>
    {bodyColumns >= 30 && Bar(ui, row.percent, bodyColumns)}
  </Box>
}

export function List(ui: any, data: CardData, bodyColumns: number) {
  const { Box, Text } = ui
  return <Box flexDirection="column">
    {data.error ? <Text color="red">{data.error}</Text> : data.rows.map((row, i) => Row(ui, row, bodyColumns, String(i)))}
    {data.note && bodyColumns >= 35 && <Text dimColor wrap="truncate-end">{data.note}</Text>}
  </Box>
}

export function Card(ui: any, id: string, title: string, data: CardData, bodyColumns: number, extra?: any) {
  const { Box, Text } = ui
  return <Box key={`card-${id}`} flexDirection="column" borderStyle="round" borderColor={data.error ? 'red' : 'blue'} paddingX={1}>
    <Box justifyContent="space-between"><Text bold>{title}</Text>{extra}</Box>
    {List(ui, data, bodyColumns)}
  </Box>
}
