import { Seeder } from '@jorgebodega/typeorm-seeding'
import { DataSource } from 'typeorm'
import { User } from '../entities/User.entity'

export default class UsersSeeder extends Seeder {
  async run(dataSource: DataSource) {
    const users = User.create([
      { id: 'auth0|633cb40c15422d538368f4c6' },
      { id: 'auth0|6341da849ae95d74a374a5e1' },
    ])

    await dataSource.createEntityManager().save<User>(users)
  }
}
