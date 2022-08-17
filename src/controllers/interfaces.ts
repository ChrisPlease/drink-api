import { Request, Response } from 'express'

export interface Controller {
  create?: (req: Request, res: Response) => Promise<void>;
  read?: (req: Request, res: Response) => Promise<void>;
  readById?: (req: Request, res: Response) => Promise<void>;
  update?: (req: Request, res: Response) => Promise<void>;
  delete?: (req: Request, res: Response) => Promise<void>;
}
