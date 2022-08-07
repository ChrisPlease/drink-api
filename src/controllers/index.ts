import { UserController } from './User/user.controller'
import { DrinkController } from './Drink/drink.controller'
import { EntryController } from './Entry/entry.controller'

const userController = new UserController()
const drinkController = new DrinkController()
const entryController = new EntryController()

export {
  userController,
  drinkController,
  entryController,
}
