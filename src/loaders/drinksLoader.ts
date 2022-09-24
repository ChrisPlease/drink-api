import DataLoader from 'dataloader'
import { Op } from 'sequelize'
import { Drink } from '../models'

const batchDrinks = async (keys: readonly number[]) => {
  const drinks = await Drink.findAll({ where: { id: { [Op.in]: keys } } })

  return keys.map(key => drinks.find(({ id }) => key === id) || new Error(`No result for ${key}`))
}

export const drinksLoader = new DataLoader((keys: readonly number[]) => batchDrinks(keys))
