import { Request, Response, Router } from 'express'
import { userController } from '../../controllers'

export const router = Router({
  strict: true,
})

router.get('/', (req: Request, res: Response) => {
  userController.read(req, res)
})

// router.get('/:id', (req: Request, res: Response) => {
//   userController.readById(req, res)
// })

router.post('/', (req, res) => {
  userController.create(req, res)
})

// router.put('/:id', (req: Request, res: Response) => {
//   entryController.update(req, res)
// })

// router.delete('/:id', (req: Request, res: Response) => {
//   entryController.delete(req, res)
// })
