import {
  Model,
  InferAttributes,
  InferCreationAttributes,
  DataTypes,
  Sequelize,
  NonAttribute,
  HasManyGetAssociationsMixin,
} from 'sequelize'
import { DrinkModel } from './Drink.model'
import { EntryModel } from './Entry.model'

export class UserModel extends Model<
  InferAttributes<UserModel>,
  InferCreationAttributes<UserModel>
> {
  declare id: string

  declare drinks?: NonAttribute<DrinkModel>

  declare getDrinks: HasManyGetAssociationsMixin<DrinkModel>

  declare entries?: NonAttribute<EntryModel>

  declare getEntries: HasManyGetAssociationsMixin<EntryModel>
}

export const UserFactory = (sequelize: Sequelize) => {
  const User = UserModel.init({
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
    },

  }, {
    sequelize,
    underscored: true,
    modelName: 'user',
  })

  return User
}


