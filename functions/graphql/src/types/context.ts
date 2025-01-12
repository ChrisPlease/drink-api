import type { BaseContext } from '@apollo/server'
import { PrismaClient } from '/opt/nodejs/node_modules/.prisma/client'
// import { createClient } from 'redis'

export interface AppContext extends BaseContext {
  user?: string | undefined | null;
  prisma: PrismaClient;
  // redis: ReturnType<typeof createClient>;
}
