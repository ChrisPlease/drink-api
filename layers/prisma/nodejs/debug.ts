import { resolve } from 'path';
import { existsSync } from 'fs';

// Correct path
const prismaClientPath = resolve('./node_modules/.prisma/client');

// Verify path
console.log('Expected @prisma/client path:', prismaClientPath);
console.log('Path exists:', existsSync(prismaClientPath));

// Load PrismaClient directly
import { PrismaClient } from './node_modules/.prisma/client';
const prisma = new PrismaClient();

console.log('Prisma client loaded:', prisma);
