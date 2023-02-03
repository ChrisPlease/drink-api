import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  ManyToOne,
  BaseEntity,
  ManyToMany,
  OneToOne,
  Unique,
} from 'typeorm'
import { dataSource } from '../data-source'
import { Entry } from './Entry.entity'
import { Ingredient } from './Ingredient.entity'
import { User } from './User.entity'

@Entity({ name: 'drinks' })
@Unique(['name', 'userId'])
export class Drink extends BaseEntity {

  @PrimaryGeneratedColumn('uuid')
  id?: string

  @Column({ unique: false })
  name: string

  @Column()
  icon: string

  @Column({
    default: 0,
    type: 'float',
    nullable: true,
  })
  coefficient?: number

  @Column({
    default: 0,
    type: 'float',
    nullable: true,
  })
  caffeine?: number

  @Column({
    default: 0,
    type: 'float',
    nullable: true,
  })
  sugar?: number

  @ManyToMany(
    () => Ingredient,
    (ingredient) => ingredient.drink,
    { cascade: true },
  )
  ingredients?: Ingredient[]

  @ManyToOne(
    () => User,
    (user) => user.drinks,
  )
  @JoinColumn({ name: 'user_id' })
  user: User

  @OneToOne(
    () => Entry,
    (entry) => entry.drink,
  )
  entry: Entry

  @Column({
    name: 'user_id',
    nullable: true,
    type: 'varchar',
  })
  userId: string

  get totalParts() {
    return this.ingredients?.reduce((acc, { parts }) => acc += parts, 0) || 1
  }

  async addIngredients(ingredients: { drinkId: string; parts: number }[]): Promise<Ingredient[]> {
    return await dataSource.getRepository(Ingredient).save(ingredients)
  }
}
