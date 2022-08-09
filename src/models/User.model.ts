import {
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  DataTypes,
  Sequelize,
} from 'sequelize'

export class UserModel extends Model<
  InferAttributes<UserModel>,
  InferCreationAttributes<UserModel>
> {
  declare id: CreationOptional<number>
  declare username?: string
  declare email: string
  declare password: string
}

export const UserFactory = (sequelize: Sequelize) => {
  const User = UserModel.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },

    username: {
      type: DataTypes.STRING,
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false,
      get() {
        return this.getDataValue('email')
      },
      set(value: string) {
        this.setDataValue('email', value.toLowerCase())
      },
    },

    password: {
      type: DataTypes.STRING,
      get() {
        return this.getDataValue('password')
      },
      set(value: string) {
        console.log(value)
        this.setDataValue('password', value.toLowerCase())
      },
    },

  }, {
    sequelize,
    underscored: true,
    modelName: 'user',
  })

  return User
}


