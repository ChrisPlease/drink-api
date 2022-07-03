import express, { Request, Response } from 'express';
import { userController } from '../../controllers';

export const router = express.Router({
  strict: true,
});

router.get('/', (req: Request, res: Response) => {
  userController.read(req, res)
})

router.get('/:id', (req: Request, res: Response) => {
  userController.readById(req, res);
})

router.post('/', (req, res) => {
  userController.create(req, res)
})
