import {
  CreationOptional,
  DataTypes,
  ForeignKey,
  HasManyCreateAssociationMixin,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
} from 'sequelize'
import { DateLogModel } from './DateLog.model'

export class EntryModel extends Model<
  InferAttributes<EntryModel>,
  InferCreationAttributes<EntryModel>
> {
  declare id: CreationOptional<number>

  declare volume: number

  declare createLog: HasManyCreateAssociationMixin<DateLogModel, 'entryId'>

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
  }, {
    modelName: 'entry',
    sequelize,
    timestamps: false,
    underscored: true,
  })

  return Entry
}
