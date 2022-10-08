import {
  BelongsToManyCreateAssociationMixin,
  BelongsToManyGetAssociationsMixin,
  CreationOptional,
  DataTypes,
  ForeignKey,
  InferAttributes,
  InferCreationAttributes,
  Model,
  NonAttribute,
  Sequelize,
} from 'sequelize'
import { DateLogModel } from './DateLog.model'

export class EntryModel extends Model<
  InferAttributes<EntryModel>,
  InferCreationAttributes<EntryModel>
> {
  declare id: CreationOptional<number>
  declare count: CreationOptional<number>

  declare logs: NonAttribute<DateLogModel[]>
  declare createLog: BelongsToManyCreateAssociationMixin<DateLogModel>
  declare getLogs: BelongsToManyGetAssociationsMixin<DateLogModel>

  declare drinkId: ForeignKey<number>
  declare userId: ForeignKey<string>
}

export const EntryFactory = (sequelize: Sequelize) => {
  const Entry = EntryModel.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  }, {
    modelName: 'entry',
    sequelize,
    underscored: true,
  })

  return Entry
}
