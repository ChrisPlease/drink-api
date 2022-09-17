import {
  CreationOptional,
  DataTypes,
  ForeignKey,
  HasManyCreateAssociationMixin,
  HasOneSetAssociationMixin,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
} from 'sequelize'
import { DateLogModel } from './DateLog.model'
import { DrinkModel } from './Drink.model'
import { UserModel } from './User.model'

export class EntryModel extends Model<
  InferAttributes<EntryModel>,
  InferCreationAttributes<EntryModel>
> {
  type: CreationOptional<'entry'> = 'entry'
  declare id: CreationOptional<number>

  declare volume: number

  declare createLog: HasManyCreateAssociationMixin<DateLogModel, 'entryId'>

  declare relationshipNames: CreationOptional<string[]>

  declare setUser: HasOneSetAssociationMixin<UserModel, number>
  declare setDrink: HasOneSetAssociationMixin<DrinkModel, number>

  declare drinkId: ForeignKey<number>
  declare userId: ForeignKey<number>
}

export const EntryFactory = (sequelize: Sequelize) => {
  const Entry = EntryModel.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    volume: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    type: {
      type: DataTypes.VIRTUAL,
      defaultValue: 'entry',
    },

    relationshipNames: {
      type: DataTypes.VIRTUAL,
      get() {
        return ['drink', 'user']
      },
    },
  }, {
    modelName: 'entry',
    sequelize,
    timestamps: false,
    underscored: true,
  })

  return Entry
}
