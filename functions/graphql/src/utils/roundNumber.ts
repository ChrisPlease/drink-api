export function roundNumber(number: number, place = 100): number {
  return Math.floor(number * place) / place
}
