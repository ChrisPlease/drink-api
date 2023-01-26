import {
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
@Unique(['userId', 'drinkId'])
export class Entry {

  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ nullable: true, default: 0 })
  count: number

  @ManyToOne(
    () => User,
    (user) => user.entries,
  )
  @JoinColumn({ name: 'user_id' })
  user: User

  @OneToOne(
    () => Drink,
    (drink) => drink.entry,
  )
  @JoinColumn({ name: 'drink_id' })
  drink: Drink

  @OneToMany(
    () => DateLog,
    (log) => log.entryId,
  )
  logs: DateLog[]

  @Column({ name: 'drink_id' })
  drinkId: string

  @Column({ name: 'user_id' })
  userId: string
}
