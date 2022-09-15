import { Drink, User, Ingredient } from '.'

export const initScopes = () => {
  Ingredient.addScope('defaultScope', {
    attributes: {
      exclude: ['drinkId'],
    },
    include: {
      model: Drink,
      attributes: {
        exclude: ['userId', 'totalParts'],
      },
    },
  })

  Ingredient.addScope('withDrinkId', {
    attributes: {
      exclude: [],
    },
    include: {
      model: Drink,
      attributes: {
        exclude: ['userId', 'totalParts'],
      },
    },
  })

  Ingredient.addScope('withoutDrink', {
    attributes: {
      exclude: [],
    },
  })

  Drink.addScope('withoutIngredients', {
    attributes: { exclude: ['ingredients'] },
  })

  Drink.addScope('defaultScope', {
    attributes: {
      exclude: ['drinkId', 'userId'],
    },
    include: [
      { model: User },
      {
        model: Ingredient.scope('withDrinkId'),
        // attributes: {
        //   exclude: ['drinkId'],
        // },
        as: 'ingredients',
        through: { attributes: [] },
        include: [{
          model: Drink.scope('withoutIngredients'),
          attributes: { exclude: ['userId', 'totalParts'] },
        }],
      },
    ],
  })
}
