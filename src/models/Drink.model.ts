import { Model, InferAttributes, InferCreationAttributes, CreationOptional, DataTypes, HasManyAddAssociationsMixin, HasManyGetAssociationsMixin, NonAttribute } from 'sequelize'
import { sequelize } from '.'

class Drink extends Model<
  InferAttributes<Drink>,
  InferCreationAttributes<Drink>
> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare coefficient: CreationOptional<number>;
  declare caffeine: CreationOptional<number>;

  declare getIngredients: HasManyGetAssociationsMixin<Drink>;
  declare addIngredients: HasManyAddAssociationsMixin<Drink, number>;

  declare ingredients?: NonAttribute<Drink[]>;

  declare isMixedDrink: boolean;
}

Drink.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },

  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  coefficient: {
    type: DataTypes.FLOAT(3),
    validate: {
      max: 1,
    },
  },

  caffeine: {
    type: DataTypes.INTEGER,
    validate: {
      min: 0,
    },
  },

  isMixedDrink: {
    type: DataTypes.VIRTUAL,
    get(): boolean {
      return !!this.ingredients?.length
    },
    set(value: unknown): void {
      throw new Error('Unable to set the `isMixedDrink` property')
    }
  },
}, {
  tableName: 'dictionary',
  sequelize,
  modelName: 'Drink',
})

export { Drink }
