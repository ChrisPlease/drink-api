import type { ExpressContext } from 'apollo-server-express'
import DataLoader from 'dataloader'

type Loaders = 'drinksLoader' | 'ingredientsLoader' | 'logsLoader'

export interface AppContext extends ExpressContext {
  loaders: {
    [key in Loaders]: InstanceType<typeof DataLoader>
  };
}
