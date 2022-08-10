import { DrinkController } from './Drink/drink.controller'
import { EntryController } from './Entry/entry.controller'
import { UserController } from './User/user.controller'
import { AuthController } from './Auth/auth.controller'

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
