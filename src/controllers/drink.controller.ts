import { Request, Response } from 'express'
import { Controller } from './interfaces'
import type { TJsonaModel } from 'jsona/lib/JsonaTypes'
import { Drink, Ingredient, User } from '../models'
import { DrinkModel } from '../models/Drink.model'
import { Op } from 'sequelize'
import { dataFormatter } from '../utils/serializer'

export class DrinkController implements Controller {

  public async create(req: Request, res: Response): Promise<void> {
    const userId = req.user?.id
    if (Object.keys(req.body).length === 0) {
      res.status(400).json({ message: 'Object cannot be empty' })
    }

    const { ingredients: ing, ...rest } = req.body
    let drink = await Drink.create({ ...rest, userId })
    const ingredients = await Ingredient
      .findAll({
        where: {
          id: {
            [Op.in]: ing.map(({ id }: { id: number }) => id),
          },
        },
        include: {
          model: Drink,
          attributes: {
            exclude: ['relationshipNames', 'ingredients', 'userId', 'totalParts'],
          },
        },
      })

    await drink.setIngredients(ingredients)

    drink = await Drink.findByPk(
      drink.id, {
        include: [{
          model: Ingredient,
          through: { attributes: [] },
          include: [{ model: Drink }],
        }],
      },
    ) as DrinkModel
    drink = (await drink.save()).toJSON()

    const serializedDrink = dataFormatter.serialize({
      stuff: drink,
      includeNames: ['user', 'ingredients', 'ingredients.drink'],
    })
    res.json(serializedDrink)
  }

  public async read(
    req: Request,
    res: Response,
  ): Promise<void> {
    const { pagination } = req
    const { search } = req.query

    console.log(pagination)
    const { rows, count } = await Drink
      .findAndCountAll({
        limit: +pagination.size,
        offset: 13,
        distinct: true,
        include: [{
          model: Ingredient,
          through: { attributes: [] },
          include: [{ model: Drink, attributes: { exclude: ['userId'] } }],
        }],
        where: {
          ...(search ? { name: { [Op.iLike]: `%${search}%` as string }} : {}),
          [Op.or]: [
            { userId: { [Op.is]: null } },
            { userId: req.user?.id },
          ],
        },
        order: [['id', 'ASC']],
      })

    const serializedRows = dataFormatter.serialize({
      stuff: rows.map(r => r.toJSON()),
      includeNames: ['user', 'ingredients', 'ingredients.drink'],
    })

    pagination.records = count

    res.json({
      ...serializedRows,
        meta: pagination,
    })
  }

  public async readById(
    req: Request,
    res: Response,
  ): Promise<void> {
    try {
      let drink = await Drink.findByPk(req.params.id, {
        attributes: {
          exclude: ['userId'],
        },
        include: [{
          model: Ingredient,
          through: { attributes: [] },
          include: [{ model: Drink, attributes: { exclude: ['userId'] } }],
        }, {
          model: User,
        }],
      })

      if (drink === null) {
        res.status(404).json({ message: 'Not Found' })
      } else {
        drink = <TJsonaModel & DrinkModel> drink.toJSON()
        const serializedDrink = dataFormatter.serialize({
          stuff: drink,
          includeNames: ['ingredients', 'ingredients.drink', 'user'],
        })

        res.json(serializedDrink)
      }

    } catch (err) {
      res.status(400).json(err)
    }

  }

  public async update(
    /* eslint-disable @typescript-eslint/no-unused-vars */
    req: Request,
    res: Response,
  /* eslint-enable @typescript-eslint/no-unused-vars */
  ): Promise<void> {
    throw 'not yet implemented'
  }

  public async delete(
    req: Request,
    res: Response,
  ): Promise<void> {
    const { id } = req.params
    const userId = req.user?.id

    const drink = await Drink.findByPk(id)

    if (drink?.userId === userId) {
      await Drink.destroy({ where: { id } })
      res.status(201).end()
    } else {
      res.status(403).json({ message: 'not enough stuff to delete this' })
    }
  }
}
