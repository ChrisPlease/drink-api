import { Request, Response, Router } from 'express'
import { drinkController } from '../controllers'

export const router = Router({
  strict: true,
})

router.get('/', (req: Request, res: Response) => {
  drinkController.read(req, res)
})

router.get('/:id', (req: Request, res: Response) => {
  drinkController.readById(req, res)
})

router.post('/', (req, res) => {
  drinkController.create(req, res)
})

router.patch('/:id', (req: Request, res: Response) => {
  drinkController.update(req, res)
})

router.delete('/:id', (req: Request, res: Response) => {
  drinkController.delete(req, res)
})
