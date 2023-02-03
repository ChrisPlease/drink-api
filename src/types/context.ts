import type { Request as ExpressJwtRequest } from 'express-jwt'
import type { BaseContext } from '@apollo/server'
import DataLoader from 'dataloader'
import { Response } from 'express'

type Loaders = 'drinksLoader' | 'ingredientsLoader' /* | 'logsLoader' */

export interface AppContext extends BaseContext {
  req: ExpressJwtRequest;
  res: Response;
  loaders: {
    [key in Loaders]: InstanceType<typeof DataLoader>
  };
}
