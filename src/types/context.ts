import type { ExpressContext } from 'apollo-server-express'
import DataLoader from 'dataloader'

export interface AppContext extends ExpressContext {
  loaders: {
    [key: string]: InstanceType<typeof DataLoader>,
  };
}
