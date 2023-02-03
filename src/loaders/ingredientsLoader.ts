import DataLoader from 'dataloader'
import { In } from 'typeorm'
import { Ingredient } from '../database/entities/Ingredient.entity'
import { dataSource } from '../database/data-source'

const ingredientRepository = dataSource.getRepository(Ingredient)

const batchIngredients = async (keys: readonly string[]) => {
  const ingredients = await ingredientRepository.find({
    where: {
      drink: { id: In(keys) },
    },
  })
  // const ingredients = await Ingredient.findAll({
  //   include: [{
  //     model: DrinkIngredient,
  //     as: 'drinkIngredient',
  //     required: true,
  //     where: { drinkId: { [Op.in]: keys } },
  //   }],
  // })

  return keys.map(key => ingredients.filter(
    ({ drink }) => key === drink.id) || new Error(`No result for ${key}`,
  ))
}

export const ingredientsLoader = new DataLoader((keys: readonly string[]) => batchIngredients(keys))
