import { Request, Response, Router } from 'express'
import { entryController } from '../../controllers'

export const router = Router({
  strict: true,
})

router.get('/', (req: Request, res: Response) => {
  entryController.read(req, res)
})

// router.get('/:id', (req: Request, res: Response) => {
//   entryController.readById(req, res)
// })

router.post('/', (req, res) => {
  entryController.create(req, res)
})

// router.put('/:id', (req: Request, res: Response) => {
//   entryController.update(req, res)
// })

// router.delete('/:id', (req: Request, res: Response) => {
//   entryController.delete(req, res)
// })
