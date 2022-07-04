import { UserController } from './User/User';
import { DrinkController } from './Drink/drink.controller'

const userController = new UserController();
const drinkController = new DrinkController()

export {
  userController,
  drinkController,
};
