import { Request, Response } from 'express'
import { Op } from 'sequelize'
import { Drink, Ingredient } from '../models'
import { dataFormatter } from '../utils/serializer'
import { Controller } from './interfaces'

export class IngredientController implements Controller {
  public async read(req: Request, res: Response) {
    const { rows, count } = await Ingredient.findAndCountAll()

    if (rows) {
      const mappedRows = rows.map((ingredient) => ingredient.toJSON())
      const serializedIngredients = dataFormatter.serialize({ stuff: mappedRows, includeNames: ['drink'] })
      res.status(200).json({ ...serializedIngredients, meta: count })
    }

  }

  public async readById(req: Request, res: Response) {
    const id = req.params.id

    const ingredient = await Ingredient.findByPk(id)

    if (ingredient) {
      const serializedIngredient = dataFormatter
        .serialize({ stuff: ingredient.toJSON(), includeNames: ['drink'] })

      res.status(200).json(serializedIngredient)
    }

  }

  public async create(req: Request, res: Response) {
    const { body } = req
    const ingredientIds: number[] = []

    for (const { drink: { id }, ...rest } of body) {
      const ingredient = await Ingredient.scope('withDrinkId').create(rest)
      if (ingredient) {
        ingredientIds.push(ingredient.id)
        await ingredient.setDrink(id)
      }
    }

    const ingredients = await Ingredient.findAll({
      attributes: { exclude: ['drinkId'] },
      include: { model: Drink, as: 'drink' },
      where: { id: { [Op.in]: ingredientIds } },
    })
      .then(res => res.map((i) => i.toJSON()))

    const serializedIngredients = dataFormatter.serialize({ stuff: ingredients, includeNames: ['drink'] })

    res.status(201).json(serializedIngredients)
    // throw 'Not yet implemented'
  }
}
