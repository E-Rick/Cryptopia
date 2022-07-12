import { PrismaClient } from '@prisma/client';
// create the context object along with the Context typescript interface
export const prisma = new PrismaClient();

// For code modularity you will create a dedicated file for initializing the context, called context.ts
export interface Context {
	prisma: PrismaClient;
}

export const context: Context = {
	prisma,
};
