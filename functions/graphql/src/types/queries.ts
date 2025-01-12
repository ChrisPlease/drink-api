import { Drink } from '/opt/nodejs/node_modules/.prisma/client'

export interface RawDrink extends Drink {
  ingredients: number;
}

export type RawEntry = {
  id: string,
  count: number,
  total_volume: number,
  water_volume: number,
}
