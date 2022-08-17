import {
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  DataTypes,
  Sequelize,
  NonAttribute,
  HasManyGetAssociationsMixin,
} from 'sequelize'
import { DrinkModel } from './Drink.model'
import * as bcrypt from 'bcrypt'

export class UserModel extends Model<
  InferAttributes<UserModel>,
  InferCreationAttributes<UserModel>
> {
  declare id: CreationOptional<number>
  declare username?: string
  declare email: string
  declare password: string

  declare drinks?: NonAttribute<DrinkModel>

  declare getDrinks: HasManyGetAssociationsMixin<DrinkModel[]>

  async authenticate(password: string): Promise<boolean> {
    return await bcrypt.compare(password, this.password)
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


