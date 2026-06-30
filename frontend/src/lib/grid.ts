// Choose a column count that keeps tiles reasonably sized as the room grows.
export function gridColsForCount(count: number): number {
  if (count <= 1) return 1
  if (count <= 4) return 2
  if (count <= 9) return 3
  return 4
}
