import { DrinkController } from './Drink/drink.controller'
import { EntryController } from './Entry/entry.controller'
import { UserController } from './User/user.controller'

const drinkController = new DrinkController()
const entryController = new EntryController()
const userController = new UserController()

export {
  drinkController,
  entryController,
  userController,
}
