import DataLoader from 'dataloader'
import { In } from 'typeorm'
import { Drink } from '../database/entities/Drink.entity'
import { dataSource } from '../database/data-source'

const drinkRepository = dataSource.getRepository(Drink)

const batchDrinks = async (keys: readonly string[]) => {
  const drinks = await drinkRepository.findBy({ id: In(keys) })

  return keys.map(
    key => drinks.find(({ id }) => key === id) || new Error(`No result for ${key}`),
  )
}

export const drinksLoader = new DataLoader(
  (keys: readonly string[]) => batchDrinks(keys),
)
