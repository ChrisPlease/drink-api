import { Drink } from '@prisma/client'

export type ModelType = 'MixedDrink' | 'BaseDrink' | 'Entry' | 'DrinkHistory'

export type DrinkHistory = {
  id: string,
  drink: Drink,
  count: number,
  totalVolume: number,
  waterVolume: number,
  lastEntry: Date | null,
}
