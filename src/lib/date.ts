import { addMinutes, format, formatDistanceToNow, isValid, parse, parseISO } from 'date-fns'

export const DATE_KEY_FORMAT = 'yyyy-MM-dd'

export const toDateKey = (date: Date) => format(date, DATE_KEY_FORMAT)

export const fromDateKey = (key: string) => parse(key, DATE_KEY_FORMAT, new Date())

export function formatDate(value: string | Date, pattern = 'MMM d, yyyy') {
  const date = typeof value === 'string' ? parseISO(value) : value
  return isValid(date) ? format(date, pattern) : '—'
}

/** "14:30" -> "2:30 PM" */
export function formatTime(time: string) {
  const date = parse(time, 'HH:mm', new Date())
  return isValid(date) ? format(date, 'h:mm a') : time
}

export function formatRelative(value: string) {
  const date = parseISO(value)
  return isValid(date) ? formatDistanceToNow(date, { addSuffix: true }) : '—'
}

/** Builds "HH:mm" strings between start (inclusive) and end (exclusive). */
export function buildTimeRange(start: string, end: string, stepMinutes: number) {
  const base = new Date(2000, 0, 1)
  let cursor = parse(start, 'HH:mm', base)
  const stop = parse(end, 'HH:mm', base)
  const times: string[] = []
  while (cursor < stop) {
    times.push(format(cursor, 'HH:mm'))
    cursor = addMinutes(cursor, stepMinutes)
  }
  return times
}

export function getDayPeriod(time: string): 'morning' | 'afternoon' | 'evening' {
  const hour = Number(time.split(':')[0])
  if (hour < 12) return 'morning'
  if (hour < 17) return 'afternoon'
  return 'evening'
}
