import { EventSubscriber, EntitySubscriberInterface, InsertEvent, UpdateEvent, UpdateQueryBuilder } from 'typeorm'
import { Drink } from '../entities/Drink.entity'

@EventSubscriber()
export class DrinkSubscriber implements EntitySubscriberInterface<Drink> {
  listenTo() {
    return Drink
  }

  async beforeInsert(event: InsertEvent<Drink>): Promise<any> {
    console.log('before insert:', event.entity)
      console.log(event.entity)
  }

  async afterInsert(event: InsertEvent<Drink>): Promise<void> {
    console.log('AFTER INSERT:', event.entity)
    if (event.entity.ingredients) {
      const drinkId = event.entity.id
      const drinkPartsQuery = event.manager
        .getRepository(Drink)
        .createQueryBuilder('drink')
        .select([
          'drink.id',
          'i.parts',
          'd.id',
          'd.coefficient',
          'd.caffeine',
          'd.sugar',
        ])
        .innerJoin('drink_ingredients', 'di', 'di.drink_id = drink.id')
        .innerJoin('ingredients', 'i', 'i.id = di.ingredient_id')
        .innerJoin('drinks', 'd', 'd.id = i.drink_id')

      const [totalsQuery] = await event.manager
        .createQueryBuilder()
        .select([
          'dp.drink_id',
        ])
        .addSelect(
          'ROUND(SUM((dp.i_parts::float/total_parts.total)*dp.d_coefficient)::numeric, 2)',
          'coefficient',
        )
        .addSelect(
          'ROUND(SUM((dp.i_parts::float/total_parts.total)*dp.d_caffeine)::numeric, 2)',
          'caffeine',
        )
        .addSelect(
          'ROUND(SUM((dp.i_parts::float/total_parts.total)*dp.d_sugar)::numeric, 2)',
          'sugar',
        )
        .from('drink_parts', 'dp')
        .addCommonTableExpression(drinkPartsQuery.getQuery(), 'drink_parts')
        .innerJoin(
          (qb) => (qb
            .select(['drink_id'])
            .addSelect('SUM(dp.i_parts)', 'total')
            .from('drink_parts', 'dp')
            .groupBy('drink_id')
          ),
          'total_parts',
          'total_parts.drink_id = dp.drink_id',
        )
        .where('dp.drink_id = :drinkId', { drinkId })
        .groupBy('dp.drink_id')
        .execute()

      await event.manager
        .getRepository(Drink)
        .createQueryBuilder()
        .update(Drink)
        .set({
          coefficient: totalsQuery.coefficient,
          caffeine: totalsQuery.caffeine,
          sugar: totalsQuery.sugar,
        })
        .where('drinks.id = :drinkId', { drinkId: totalsQuery.drink_id })
        .execute()
    }
  }

  afterUpdate(event: UpdateEvent<Drink>): void | Promise<any> {
    console.log('AFTER UPDATE:', event.entity)
  }
}
