import DataLoader from 'dataloader'
import { Op } from 'sequelize'
import { DrinkIngredient, Ingredient } from '../models'

const batchIngredients = async (keys: readonly number[]) => {
  const ingredients = await Ingredient.findAll({
    include: [{
      model: DrinkIngredient,
      as: 'drinkIngredient',
      required: true,
      where: { drinkId: { [Op.in]: keys } },
    }],
  })

  return keys.map(key => ingredients.filter(
    ({ drinkIngredient }) => key === drinkIngredient.drinkId) || new Error(`No result for ${key}`,
  ))
}

export const ingredientsLoader = new DataLoader((keys: readonly number[]) => batchIngredients(keys))
