import { BaseEntity, Entity, OneToMany, PrimaryColumn, Relation } from 'typeorm'
import { Drink } from './Drink.entity'
import { Entry } from './Entry.entity'

@Entity({ name: 'users' })
export class User extends BaseEntity {
  @PrimaryColumn()
  id: string

  @OneToMany(() => Drink, (drink) => drink.user)
  drinks: Relation<Drink[]>

  @OneToMany(() => Entry, (entry) => entry.user)
  entries: Entry[]
}
