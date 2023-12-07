import { Drink } from '@prisma/client'

export type RawDrink = Pick<Drink, 'id'> & {
  ingredients: number,
}

export type RawEntry = {
  id: string,
  // drink: RawDrink,
  count: number,
  total_volume: number,
  water_volume: number,
}
