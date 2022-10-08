import {
  CreationOptional,
  DataTypes,
  ForeignKey,
  InferAttributes,
  InferCreationAttributes,
  Model,
  NonAttribute,
  Sequelize,
} from 'sequelize'
import { EntryLogModel } from './EntryLog.model'

export class DateLogModel extends Model<
  InferAttributes<DateLogModel>,
  InferCreationAttributes<DateLogModel>
> {
  declare id: CreationOptional<number>
  declare volume: number
  declare entryId: ForeignKey<number>
  declare entryLog: NonAttribute<EntryLogModel>
}

export const DateLogFactory = (sequelize: Sequelize) => {
  const DateLog = DateLogModel.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    volume: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  }, {
    modelName: 'log',
    sequelize,
    updatedAt: false,
    underscored: true,
    createdAt: 'entryTimestamp',
  })

  return DateLog
}
