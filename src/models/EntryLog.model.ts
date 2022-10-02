import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
} from 'sequelize'

export class EntryLogModel extends Model<
  InferAttributes<EntryLogModel>,
  InferCreationAttributes<EntryLogModel>
> {
  declare entryId: number
  declare logId: number
}

export const EntryLogFactory = (sequelize: Sequelize) => {
  const EntryLog = EntryLogModel.init({
    entryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    logId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  }, {
    modelName: 'EntryLog',
    tableName: 'entry_logs',
    sequelize,
    timestamps: false,
    underscored: true,
  })

  return EntryLog
}
