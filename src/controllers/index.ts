import { DrinkController } from './drink.controller'
import { EntryController } from './entry.controller'
import { UserController } from './user.controller'
import { AuthController } from './auth.controller'

const drinkController = new DrinkController()
const entryController = new EntryController()
const userController = new UserController()
const authController = new AuthController()

export {
  drinkController,
  entryController,
  userController,
  authController,
}
