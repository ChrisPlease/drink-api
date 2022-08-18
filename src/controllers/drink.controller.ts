import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { ParsedQs } from 'qs'
import { Controller } from './interfaces'
import { Drink, Ingredient, sequelize, User } from '../models'
import { DrinkModel } from '../models/Drink.model'
import { UserModel } from '../models/User.model'
import { Op } from 'sequelize'

export class DrinkController implements Controller {

  public async create(
    req: Request<
      ParamsDictionary, any, any, ParsedQs, Record<string, any>
    >,
    res: Response<any, Record<string, any>>,
  ): Promise<void> {
    const userId = (req.user as UserModel)?.id
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
                [sequelize.literal(`(SELECT name FROM drinks d WHERE d.id=ingredients.drink_id)`), 'name'],
                [sequelize.literal(`(SELECT id FROM drinks d WHERE d.id=ingredients.drink_id)`), 'id'],
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
    req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
    res: Response<any, Record<string, any>>,
  ): Promise<void> {
    try {
      const drinks = await Drink
        .findAndCountAll({
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
                [sequelize.literal(`(SELECT name FROM drinks d WHERE d.id=ingredients.drink_id)`), 'name'],
                [sequelize.literal(`(SELECT id FROM drinks d WHERE d.id=ingredients.drink_id)`), 'id'],
              ],
            },
          }],
          where: {
            [Op.or]: [
              { userId: { [Op.is]: null } },
              { userId: req.user?.id },
            ],
          },
        })
      res.json(drinks)
    } catch (err) {
      res.status(401).json(err)
    }
  }

  public async readById(
    req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
    res: Response<any, Record<string, any>>,
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
                  [sequelize.literal(`(SELECT name FROM drinks d WHERE d.id=ingredients.drink_id)`), 'name'],
                  [sequelize.literal(`(SELECT id FROM drinks d WHERE d.id=ingredients.drink_id)`), 'id'],
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
    req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
    res: Response<any, Record<string, any>>,
  ): Promise<void> {
    const { id } = req.params
    const newDrink = req.body
    console.log(newDrink)
    try {
      const drink = await Drink.findByPk(id)

      if (!drink) {
        throw new Error('Not found')

      }

      drink.name = req.body.name

      await drink.save()

      res.json(drink)

    } catch (err) {
      console.log(err)
      res.status(400).json(err)
    }

  }

  public async delete(
    req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
    res: Response<any, Record<string, any>>,
  ): Promise<void> {
    const { id } = req.params
    const userId = (req.user as UserModel)?.id

    const drink = await Drink.findByPk(id)

    if (drink?.userId === userId) {
      await Drink.destroy({ where: { id } })
      res.json({})
    } else {
      res.status(403).json({ message: 'not enough stuff to delete this' })
    }
  }
}
