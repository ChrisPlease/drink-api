import type { Request as ExpressJwtRequest } from 'express-jwt'
import type { BaseContext } from '@apollo/server'
import { Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { createClient } from 'redis'

export interface AppContext extends BaseContext {
  req: ExpressJwtRequest;
  res: Response;
  prisma: PrismaClient;
  redis: ReturnType<typeof createClient>;
}
