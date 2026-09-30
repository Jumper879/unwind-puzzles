export function greetingForHour(hour: number): string {
  if (hour >= 5 && hour < 12) return 'Good morning · pick a puzzle and unwind'
  if (hour >= 12 && hour < 17) return 'Good afternoon · pick a puzzle and unwind'
  return 'Good evening · pick a puzzle and unwind'
}

export function currentGreeting(now: Date = new Date()): string {
  return greetingForHour(now.getHours())
}
