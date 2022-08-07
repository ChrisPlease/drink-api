import { DrinkController } from './Drink/drink.controller'
import { EntryController } from './Entry/entry.controller'

const drinkController = new DrinkController()
const entryController = new EntryController()

export {
  drinkController,
  entryController,
}
