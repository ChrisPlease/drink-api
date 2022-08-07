import {
  CreationOptional,
  DataTypes,
  ForeignKey,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
} from 'sequelize'

export class DateLogModel extends Model<
  InferAttributes<DateLogModel>,
  InferCreationAttributes<DateLogModel>
> {
  declare id: CreationOptional<number>

  declare entryId: ForeignKey<number>

}

export const DateLogFactory = (sequelize: Sequelize) => {
  const DateLog = DateLogModel.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
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
