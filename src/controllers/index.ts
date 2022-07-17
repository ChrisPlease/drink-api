import { UserController } from './User/user.controller'
import { DrinkController } from './Drink/drink.controller'

const userController = new UserController()
const drinkController = new DrinkController()

export {
  userController,
  drinkController,
}
