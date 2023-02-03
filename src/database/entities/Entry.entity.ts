import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm'
import { DateLog } from './DateLog.entity'
import { Drink } from './Drink.entity'
import { User } from './User.entity'

@Entity({ name: 'entries' })
@Unique(['drinkId', 'userId'])
export class Entry extends BaseEntity {

  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ nullable: true, default: 0 })
  count: number

  @ManyToOne(
    () => User,
    (user) => user.entries,
  )
  @JoinColumn()
  user: User

  @OneToOne(
    () => Drink,
    (drink) => drink.entry,
  )
  @JoinColumn()
  drink: Drink

  @OneToMany(
    () => DateLog,
    (log) => log.entryId,
  )
  logs: DateLog[]

  @Column({ name: 'drink_id', type: 'uuid' })
  drinkId: string

  @Column({ name: 'user_id', type: 'varchar' })
  userId: string
}

