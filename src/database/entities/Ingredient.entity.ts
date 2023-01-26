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

  @ManyToMany(() => Drink, (drink) => drink.ingredients)
  @JoinTable({
    name: 'drink_ingredients',
    joinColumn: {
      name: 'drink_id',
    },
    inverseJoinColumn: {
      name: 'ingredient_id',
    },
  })
  drink: Drink

  @Column({
    name: 'drink_id',
  })
  drinkId: string
}
