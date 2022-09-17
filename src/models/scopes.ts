import { Drink, User, Ingredient } from '.'

export const initScopes = () => {
  // Ingredient.addScope('defaultScope', {
  //   include: {
  //     model: Drink,
  //     through: {},
  //   },
  // })

  // Ingredient.addScope('withDrinkId', {
  //   attributes: {
  //     exclude: [],
  //   },
  //   include: {
  //     model: Drink,
  //     attributes: {
  //       exclude: ['userId'],
  //     },
  //   },
  // })

  // // Ingredient.addScope('withoutDrink', {
  // //   attributes: {
  // //     exclude: [],
  // //   },
  // // })

  // Drink.addScope('withoutIngredients', {
  //   attributes: { exclude: ['ingredients'] },
  // })

  // Drink.addScope('defaultScope', {
  //   attributes: {
  //     exclude: [],
  //   },
  //   include: [
  //     { model: User },
  //     {
  //       model: Ingredient,
  //       as: 'ingredients',
  //       through: { attributes: [] },
  //       include: [{
  //         model: Drink.scope('withoutIngredients'),
  //         attributes: { exclude: ['userId', 'totalParts'] },
  //       }],
  //     },
  //   ],
  // })
}
