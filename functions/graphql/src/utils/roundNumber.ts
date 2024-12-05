export function roundNumber(
  number: number, place = 100,
): number {
  return Math.ceil(number * place) / place
}
