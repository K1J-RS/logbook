export function todayDate(): string {
  const d = new Date()
  return d.toISOString().slice(0, 10)
}

export function nowTime(): string {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export function formatDateShort(dateStr: string): string {
  // YYYY-MM-DD -> MM-DD
  const parts = dateStr.split('-')
  if (parts.length !== 3) return dateStr
  return `${parts[1]}-${parts[2]}`
}

export function durationMinutes(startTime: string, endTime: string): number {
  const [sh, sm] = startTime.split(':').map(Number)
  const [eh, em] = endTime.split(':').map(Number)
  if ([sh, sm, eh, em].some((n) => Number.isNaN(n))) return 0
  let diff = eh * 60 + em - (sh * 60 + sm)
  if (diff < 0) diff += 24 * 60
  return diff
}

export function formatThousands(n: number): string {
  return n.toLocaleString('en-US')
}

export function planShortName(name: string): string {
  return name.split('—')[0].trim()
}
