import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
  BaseEntity,
} from 'typeorm'
import { Drink } from './Drink.entity'

@Entity({ name: 'ingredients' })
export class Ingredient extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  parts: number

  @ManyToMany(
    () => Drink,
    (drink) => drink.ingredients,
  )
  @JoinTable({
    name: 'drink_ingredients',
    joinColumn: {
      name: 'ingredient_id',
    },
    inverseJoinColumn: {
      name: 'drink_id',
    },
  })
  drink: Drink

  @Column({
    name: 'drink_id',
    type: 'uuid',
  })
  drinkId: string
}
