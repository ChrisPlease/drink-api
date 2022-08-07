import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { ParsedQs } from 'qs'
import { CrudController  } from '../controller'
import { Drink, Ingredient, sequelize } from '../../models'
import { IngredientModel } from '../../models/Ingredient.model'
import { DrinkModel } from '../../models/Drink.model'

export class DrinkController extends CrudController {

  public async create(
    req: Request<
      ParamsDictionary, any, any, ParsedQs, Record<string, any>
    >,
    res: Response<any, Record<string, any>>,
  ): Promise<void> {
    try {
      let drink = await Drink.create(
        req.body,
        {
          include: [
            {
              model: Ingredient,
              as: 'ingredients',
            }
          ]
        })
      console.log(drink.toJSON())

      drink = await Drink.findByPk(
        drink.id,
        {
          include: [
            {
              model: Ingredient,
              as: 'ingredients',
              through: {
                attributes: []
              },
              attributes: ['parts'],
              include: [{
                model: Drink,
                attributes: ['caffeine', 'coefficient', 'name']
              }],
            }
          ]
        }
      ) as DrinkModel

      res.json(drink)
    } catch (err) {
      console.log(err)
      res.status(500)
    }
  }

  public async read(
    req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
    res: Response<any, Record<string, any>>
  ): Promise<void> {
    try {
      const drinks = await Drink.findAll({
        include: [{
          model: Ingredient,
          as: 'ingredients',
          through: { attributes: [] },
          attributes: {
            exclude: ['drinkId', 'id'],
            include: [
              'parts',
              [sequelize.literal(`(SELECT name FROM drinks d WHERE d.id=ingredients.drink_id)`), 'name'],
              [sequelize.literal(`(SELECT id FROM drinks d WHERE d.id=ingredients.drink_id)`), 'id']
            ],
          },
        }],
      })
      res.json(drinks)
    } catch (err) {
      res.json
    }
  }

  public async readById(
    req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
    res: Response<any, Record<string, any>>
  ): Promise<void> {
    try {
      const drink = await Drink.findByPk(
        req.params.id,
        {
          include: [
            {
              model: Ingredient,
              as: 'ingredients',
              attributes: {
                exclude: ['drinkId', 'id'],
                include: [
                  'parts',
                  [sequelize.literal(`(SELECT name FROM drinks d WHERE d.id=ingredients.drink_id)`), 'name']
                ],
              },
              through: { attributes: [] },
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
    res: Response<any, Record<string, any>>
  ): Promise<void> {
    const { id } = req.params

    await Drink.update(req.body, { where: { id } })
    const drink = await Drink.findByPk(id)
    res.json(drink)
  }

  public async delete(
    req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
    res: Response<any, Record<string, any>>
  ): Promise<void> {
    const { id } = req.params

    await Drink.destroy({ where: { id } })
    res.json({})
  }
}
