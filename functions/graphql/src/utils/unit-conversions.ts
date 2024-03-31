import { roundNumber } from './roundNumber'

export const ozToMl = (value: number): number => value * 29.57353

export const mLToOz = (value: number): number => value / 29.57353

export const convertEntryToOz = (
  entryVolume: number,
  {
    servingSize,
    servingUnit,
    metricSize,
  }: {
    servingSize?: number | null,
    servingUnit?: string | null,
    metricSize?: number | null,
  },
  unit?: string,
): number => {
  let volume: number

  switch (unit) {
    case servingUnit:
      volume = Math.round(mLToOz((entryVolume / (servingSize || 1)) * (metricSize || 1))*2) / 2
      break
    case 'mL':
      volume = Math.ceil(mLToOz(entryVolume) * 10) / 10
      break
    default:
      volume = entryVolume
      break
  }

  return volume
}

export const volumeToServings = (
  volume?: number | null,
  metricSize?: number | null,
) => roundNumber((ozToMl(volume || 1)) / (metricSize || 1), 16)
