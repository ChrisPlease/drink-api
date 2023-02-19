import {
  BaseEntity,
  CreateDateColumn,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  VirtualColumn,
} from 'typeorm'
import { Drink } from './Drink.entity'
import { User } from './User.entity'

@Entity({ name: 'entries' })
export class Entry extends BaseEntity {

  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({
    name: 'volume',
    type: 'float',
    nullable: false,
  })
  volume: number

  @CreateDateColumn()
  timestamp: Date

  @ManyToOne(
    () => User,
    (user) => user.entries,
  )
  @JoinColumn({
    name: 'user_id',
  })
  user: User

  @ManyToOne(
    () => Drink,
    (drink) => drink.entries,
  )
  @JoinColumn({
    name: 'drink_id',
  })
  drink: Drink

  @Column({
    name: 'drink_id',
    type: 'varchar',
  })
  drinkId: string

  @Column({
    name: 'user_id',
    type: 'varchar',
  })
  userId: string

  @VirtualColumn({
    query: (alias) => `SUM(${alias}.volume)`,
  })
  totalVolume: number

  @VirtualColumn({
    query: (alias) => `MAX(${alias}.timestamp)`,
  })
  lastEntry: Date

  @VirtualColumn({
    query: (alias) => `ROUND(SUM(${
      alias
    }.volume*(SELECT sugar FROM drinks WHERE drinks.id = ${
      alias
    }.drink_id)))`,
  })
  sugar: number

  @VirtualColumn({
    query: (alias) => `ROUND(SUM(${
      alias
    }.volume*(SELECT caffeine FROM drinks WHERE drinks.id = ${
      alias
    }.drink_id)))`,
  })
  caffeine: number

  @VirtualColumn({
    query: (alias) => `ROUND(AVG(${alias}.volume))`,
  })
  average: number
}
