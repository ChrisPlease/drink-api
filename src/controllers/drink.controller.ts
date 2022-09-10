import { Request, Response } from 'express'
import { Controller } from './interfaces'
import { pagination } from '../config/constants'
import { Drink, Entry, Ingredient, sequelize, User } from '../models'
import { DrinkModel } from '../models/Drink.model'
import { Op } from 'sequelize'

export class DrinkController implements Controller {

  public async create(req: Request, res: Response): Promise<void> {
    const userId = req.user?.id

    if (Object.keys(req.body).length === 0) {
      res.status(400).json({ message: 'Object cannot be empty' })
    }

    try {
      let drink = await Drink.create(
        { ...req.body, userId },
        {
          include: [
            {
              model: Ingredient,
              as: 'ingredients',
            },
          ],
        })

      drink = await Drink.findByPk(
        drink.id,
        {
          include: [{
            model: Ingredient,
            as: 'ingredients',
            through: { attributes: [] },
            attributes: {
              exclude: ['drinkId', 'id'],
              include: [
                'parts',
                [sequelize.literal('(SELECT name FROM drinks d WHERE d.id=ingredients.drink_id)'), 'name'],
                [sequelize.literal('(SELECT id FROM drinks d WHERE d.id=ingredients.drink_id)'), 'id'],
              ],
            },
          }],
        }) as DrinkModel

      res.json(drink)
    } catch (err) {
      res.status(500)
    }
  }

  public async read(
    req: Request,
    res: Response,
  ): Promise<void> {
    const { search } = req.query

    try {
      const { rows, count } = await Drink
        .findAndCountAll({
          distinct: true,
          attributes: {
            exclude: ['userId'],
          },
          include: [{
            model: Ingredient,
            as: 'ingredients',
            through: { attributes: [] },
            attributes: {
              exclude: ['drinkId', 'id'],
              include: [
                'parts',
                [sequelize.literal('(SELECT name FROM drinks d WHERE d.id=ingredients.drink_id)'), 'name'],
                [sequelize.literal('(SELECT id FROM drinks d WHERE d.id=ingredients.drink_id)'), 'id'],
              ],
            },
          }, {
            model: Entry,
            as: 'entries',
            required: false,
            where: {
              userId: req.user?.id,
            },
          }],
          where: {
            ...(search ? { name: { [Op.iLike]: `%${search}%` as string }} : {}),
            [Op.or]: [
              { userId: { [Op.is]: null } },
              { userId: req.user?.id },
            ],
          },
        })

      res.json({ rows, count })
    } catch (err) {
      res.status(401).json(err)
    }
  }

  public async readById(
    req: Request,
    res: Response,
  ): Promise<void> {
    try {
      const drink = await Drink.findByPk(
        req.params.id,
        {
          attributes: {
            exclude: ['userId'],
          },
          include: [
            {
              model: Ingredient,
              as: 'ingredients',
              attributes: {
                exclude: ['drinkId', 'id'],
                include: [
                  'parts',
                  [sequelize.literal('(SELECT name FROM drinks d WHERE d.id=ingredients.drink_id)'), 'name'],
                  [sequelize.literal('(SELECT id FROM drinks d WHERE d.id=ingredients.drink_id)'), 'id'],
                ],
              },
              through: { attributes: [] },
            },
            {
              model: User,
            },
          ],
        },
      )

      if (drink === null) {
        res.status(404).json({ message: 'Not Found' })
      } else {
        res.json(drink)
      }

    } catch (err) {
      res.json(err)
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
