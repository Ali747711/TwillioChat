// Format a Date as zero-padded 24-hour HH:MM:SS (local time).
export function formatClock(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}
