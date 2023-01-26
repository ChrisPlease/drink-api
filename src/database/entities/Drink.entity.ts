import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BeforeInsert,
  BeforeUpdate,
  JoinColumn,
  ManyToOne,
  BaseEntity,
  ManyToMany,
  OneToOne,
} from 'typeorm'
import { dataSource } from '../data-source'
import { roundNumber } from '../../utils/roundNumber'
import { Entry } from './Entry.entity'
import { Ingredient } from './Ingredient.entity'
import { User } from './User.entity'

@Entity({ name: 'drinks' })
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

  @ManyToOne(() => User, (user) => user.drinks)
  @JoinColumn({ name: 'user_id' })
  user: User

  @OneToOne(
    () => Entry,
    (entry) => entry.drink,
  )
  entry: Entry

  @Column({ name: 'user_id', nullable: true })
  userId: string

  get totalParts() {
    return this.ingredients?.reduce((acc, { parts }) => acc += parts, 0) || 1
  }

  @BeforeInsert()
  @BeforeUpdate()
  async calcNutrition() {
    const { ingredients, totalParts } = this
    const drinkRepository = dataSource.getRepository(Drink)

    if (ingredients && ingredients?.length > 1) {
      const nutrition = {
        caffeine: 0,
        coefficient: 0,
        sugar: 0,
      }

      for (const { parts, drinkId: id } of ingredients) {
        const {
          coefficient: drinkCoefficient = 0,
          caffeine: drinkCaffeine = 0,
          sugar: drinkSugar = 0,
        } = await drinkRepository.findOneBy({ id }) as Drink

        nutrition.caffeine += ((parts/totalParts)*drinkCaffeine)
        nutrition.coefficient += ((parts/totalParts)*drinkCoefficient)
        nutrition.sugar += ((parts/totalParts)*drinkSugar)
      }

      this.caffeine = roundNumber(nutrition.caffeine)
      this.coefficient = roundNumber(nutrition.coefficient)
      this.sugar = roundNumber(nutrition.sugar)
    }
  }
}
