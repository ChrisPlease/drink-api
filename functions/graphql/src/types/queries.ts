import { Drink } from '@prisma/client'

export interface RawDrink extends Drink {
  ingredients: number;
}

export type RawEntry = {
  id: string,
  count: number,
  total_volume: number,
  water_volume: number,
}
