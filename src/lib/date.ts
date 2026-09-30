/** `YYYY-MM-DD` in local time — used for "did you play today" checks, not a billing boundary. */
export function todayDateString(d = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
