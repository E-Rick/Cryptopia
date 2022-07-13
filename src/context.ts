import { PrismaClient } from '@prisma/client';
import { decodeAuthHeader } from './utils/auth';
import { Request } from 'express';

// create the context object along with the Context typescript interface
export const prisma = new PrismaClient();

// For code modularity you will create a dedicated file for initializing the context, called context.ts
export interface Context {
	prisma: PrismaClient;
	userId?: number;
}

export const context = ({ req }: { req: Request }): Context => {
	const token =
		req && req.headers.authorization ? decodeAuthHeader(req.headers.authorization) : null;

	return {
		prisma,
		userId: token?.userId,
	};
};
