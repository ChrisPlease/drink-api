import {
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  DataTypes,
  Sequelize,
} from 'sequelize'
import * as bcrypt from 'bcrypt'

export class UserModel extends Model<
  InferAttributes<UserModel>,
  InferCreationAttributes<UserModel>
> {
  declare id: CreationOptional<number>
  declare username?: string
  declare email: string
  declare password: string

  async authenticate(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password)
  }
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
      allowNull: false,
      unique: true,
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
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
        const hashedPass = bcrypt.hashSync(value, 10)
        this.setDataValue('password', hashedPass)
      },
    },

  }, {
    sequelize,
    underscored: true,
    modelName: 'user',
    defaultScope: {
      attributes: {
        exclude: ['password'],
      },
    },
    scopes: {
      withPassword: {
        attributes: {
          exclude: [],
        },
      },
    },
  })

  return User
}


