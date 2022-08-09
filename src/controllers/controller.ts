import { Request, Response } from 'express'

export interface ICrudController {
  create(req: Request, res: Response): Promise<void>;
  read(req: Request, res: Response): Promise<void>;
  readById(req: Request, res: Response): Promise<void>;
  update(req: Request, res: Response): Promise<void>;
  delete(req: Request, res: Response): Promise<void>;
}

export abstract class CrudController implements ICrudController {
  public abstract create(req: Request, res: Response): Promise<void>
  public abstract read(req: Request, res: Response): Promise<void>
  public abstract readById(req: Request, res: Response): Promise<void>
  public abstract update(req: Request,  res: Response): Promise<void>
  public abstract delete(req: Request, res: Response): Promise<void>
}
