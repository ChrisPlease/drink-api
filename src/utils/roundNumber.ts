export function roundNumber(number: number, place = 100): number {
  return Math.round(number * place) / place
}
