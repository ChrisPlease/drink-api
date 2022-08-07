import {
  CreationOptional,
  DataTypes,
  ForeignKey,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
} from 'sequelize'

export class EntryModel extends Model<
  InferAttributes<EntryModel>,
  InferCreationAttributes<EntryModel>
> {
  declare id: CreationOptional<number>

  declare volume: number

  declare drinkId: ForeignKey<number>
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
    modelName: 'Entry',
    sequelize,
    timestamps: false,
    underscored: true,
  })

  return Entry
}
