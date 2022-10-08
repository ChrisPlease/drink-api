import type { Request as ExpressJwtRequest } from 'express-jwt'
import type { ExpressContext } from 'apollo-server-express'
import DataLoader from 'dataloader'

type Loaders = 'drinksLoader' | 'ingredientsLoader' | 'logsLoader'

export interface AppContext extends ExpressContext {
  req: ExpressJwtRequest;
  loaders: {
    [key in Loaders]: InstanceType<typeof DataLoader>
  };
}
