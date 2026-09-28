// Shared date rules. The SERVER is the source of truth for "today" (Sofia time),
// so a wrong clock/timezone on the customer's device can't bypass the rules.
export const TIMEZONE = 'Europe/Sofia'
export const MIN_LEAD_DAYS = 3 // earliest = today + 3
export const MAX_ADVANCE_DAYS = 90 // latest   = today + 90

export function todayISO(now = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now) // "YYYY-MM-DD"
}

// Work at 12:00 UTC so DST shifts can never move the calendar day
export function addDays(iso: string, days: number): string {
  const d = new Date(`${iso}T12:00:00Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

export function getBookingWindow() {
  const today = todayISO()
  return {today, min: addDays(today, MIN_LEAD_DAYS), max: addDays(today, MAX_ADVANCE_DAYS)}
}

export function isISODate(s: unknown): s is string {
  if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false
  const d = new Date(`${s}T12:00:00Z`)
  return !isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s
}

export function expandRange(from: string, to: string, min: string, max: string): string[] {
  const out: string[] = []
  let cur = from < min ? min : from
  const end = to > max ? max : to
  for (let i = 0; cur <= end && i < 400; i++) {
    out.push(cur)
    cur = addDays(cur, 1)
  }
  return out
}
