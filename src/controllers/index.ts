import { DrinkController } from './drink.controller'
import { IngredientController } from './ingredient.controller'
import { EntryController } from './entry.controller'
import { UserController } from './user.controller'
import { AuthController } from './auth.controller'

const drinkController = new DrinkController()
const entryController = new EntryController()
const ingredientController = new IngredientController()
const userController = new UserController()
const authController = new AuthController()

export {
  drinkController,
  ingredientController,
  entryController,
  userController,
  authController,
}
