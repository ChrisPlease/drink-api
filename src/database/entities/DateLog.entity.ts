import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  BaseEntity,
} from 'typeorm'
import { Entry } from './Entry.entity'

@Entity({ name: 'logs' })
export class DateLog extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  volume: number

  @CreateDateColumn()
  timestamp: Date

  @ManyToOne(
    () => Entry,
    (entry) => entry.logs,
  )
  @JoinColumn({ name: 'entry_id' })
  entry: Entry

  @Column({ name: 'entry_id' })
  entryId: string
}
