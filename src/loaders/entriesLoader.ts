// import DataLoader from 'dataloader'
// import { Op } from 'sequelize'
// import { EntryLog, Entry } from '../models'

// const batchIngredients = async (keys: readonly number[]) => {
//   const ingredients = await Entry.findAll({
//     include: [{
//       model: EntryLog,
//       required: true,
//       where: { entryId: { [Op.in]: keys } },
//     }],
//   })

//   return keys.map(key => ingredients.filter(
//     ({ drinkIngredient }) => key === drinkIngredient.drinkId) || new Error(`No result for ${key}`,
//   ))
// }

// export const ingredientsLoader = new DataLoader((keys: readonly number[]) => batchIngredients(keys))
