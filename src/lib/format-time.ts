/**
 * Format a timestamp for note display.
 * <1min → "Just now", <60min → "X min ago", <24h → "Xh ago (HH:MM)", older → "DD Mon, HH:MM"
 */
export function formatNoteTimestamp(ts: string): string {
  const d = new Date(ts)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffHr = Math.floor(diffMs / 3600000)

  const time = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })

  if (diffMin < 1) return 'Just now'
  if (diffMin < 60) return `${diffMin} min ago`
  if (diffHr < 24) return `${diffHr}h ago (${time})`
  return `${d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}, ${time}`
}

/**
 * Format a timestamp as "H:MMam/pm" for note labels.
 */
export function formatNoteLabel(ts: string): string {
  const d = new Date(ts)
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase()
}
