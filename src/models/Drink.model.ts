import { Model, InferAttributes, InferCreationAttributes, CreationOptional, DataTypes, HasManyAddAssociationsMixin, HasManyGetAssociationsMixin, NonAttribute, Sequelize } from 'sequelize'
import { IngredientModel } from './Ingredient.model';

export class DrinkModel extends Model<
  InferAttributes<DrinkModel>,
  InferCreationAttributes<DrinkModel>
> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare coefficient: CreationOptional<number>;
  declare caffeine: CreationOptional<number>;

  declare getIngredients: HasManyGetAssociationsMixin<IngredientModel>;
  declare addIngredients: HasManyAddAssociationsMixin<IngredientModel, number>;

  declare ingredients?: NonAttribute<IngredientModel[]>;

  declare isMixedDrink: CreationOptional<boolean>;

  get totalParts(): NonAttribute<number> {
    return this.ingredients?.reduce((acc, { parts }) => acc += parts, 0) || 1;
  }
}

export const DrinkFactory = (sequelize: Sequelize) => {

  const Drink = DrinkModel.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },

    coefficient: {
      type: DataTypes.FLOAT(3),
      validate: {
        max: 1,
      },
    },

    caffeine: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },

    isMixedDrink: {
      type: DataTypes.VIRTUAL,
      get(): boolean {
        return !!this.ingredients?.length
      },
      /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
      set(value: unknown): void {
        throw new Error('Unable to set the `isMixedDrink` property')
      }
    },
  }, {
    modelName: 'drink',
    sequelize,
  })

  return Drink
}
