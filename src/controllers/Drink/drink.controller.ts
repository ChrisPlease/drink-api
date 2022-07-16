import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { ParsedQs } from 'qs'
import { CrudController  } from '../CrudController'
import { Drink, Ingredient } from '../../models'

export class DrinkController extends CrudController {

  public async create(
    req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
    res: Response<any, Record<string, any>>
  ): Promise<void> {
    const { body } = req

    if (!body.name) {
      res.status(400).json({ message: 'Name is required' })
    } else {
      try {
        const drink = await Drink.create(
          body,
          {
            include: [{
              as: 'ingredients',
              model: Ingredient,
              include: [
                {
                  model: Drink,
                  attributes: ['caffeine', 'coefficient'],
                },
              ],
            }],
          },
        )
        console.log(drink.toJSON())
        res.json(drink)
      } catch (err) {
        console.log(err)
        res.status(500)
      }
    }
  }

  public async read(
    req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
    res: Response<any, Record<string, any>>
  ): Promise<void> {
    const drinks = await Drink.findAll({
      include: [
        {
          model: Ingredient,
          as: 'ingredients',
          include: [{
            model: Drink,
            attributes: ['caffeine', 'coefficient'],
          }]
        },
      ],
    })
    res.json(drinks)
  }

  public async readById(
    req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
    res: Response<any, Record<string, any>>
  ): Promise<void> {
    const drink = await Drink.findByPk(
      req.params.id,
      {
        include: [
          {
            model: Ingredient,
            as: 'ingredients',
            include: [{
              model: Drink,
              attributes: ['caffeine', 'coefficient'],
            }],
          },
        ],
      },
    )
    console.log(drink?.isMixedDrink)
    if (drink === null) {
      res.status(404).json({ message: 'Not Found' })
    } else {
      res.json(drink)
    }

  }

  public async update(
    req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
    res: Response<any, Record<string, any>>
  ): Promise<void> {
    const { id } = req.params;

    await Drink.update(req.body, { where: { id } })
    const drink = await Drink.findByPk(id)
    res.json(drink)
  }

  public async delete(
    req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
    res: Response<any, Record<string, any>>
  ): Promise<void> {
    const { id } = req.params;

    await Drink.destroy({ where: { id } })
    res.json({})
  }
}
