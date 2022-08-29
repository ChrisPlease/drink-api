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
import { EntryModel } from './Entry.model'

export class UserModel extends Model<
  InferAttributes<UserModel>,
  InferCreationAttributes<UserModel>
> {
  declare id: CreationOptional<number>
  declare username?: string
  declare email: string
  declare password: string

  declare drinks?: NonAttribute<DrinkModel>

  declare getDrinks: HasManyGetAssociationsMixin<DrinkModel>

  declare entries?: NonAttribute<EntryModel>

  declare getEntries: HasManyGetAssociationsMixin<EntryModel>

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
      validate: {
        isEmail: { msg: 'Invalid email address' },
      },
      get() {
        return this.getDataValue('email')
      },
      set(value: string) {
        this.setDataValue('email', value.toLowerCase())
      },
    },

    password: {
      type: DataTypes.STRING,
      validate: {
        is: {
          args: /^.*(?=.{6,})(?=.*[a-zA-Z])(?=.*\d)(?=.*[!&$%&? "]).*$/,
          msg: 'Password too weak',
        },
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

  User.beforeSave(async (user) => {
    if (user.changed('password')) {
      const hashedPass = await bcrypt.hash(user.getDataValue('password'), +(process.env.SALT_ROUNDS as string) || 10)
      user.setDataValue('password', hashedPass)
    }
  })

  return User
}


