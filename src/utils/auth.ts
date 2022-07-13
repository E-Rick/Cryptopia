import * as jwt from 'jsonwebtoken';

export const APP_SECRET = 'GraphQL-is-aw3some';

// Based on the shape of the JWT token issued during signup and login. When server decodes an issued token, it expects it in this format.
export interface AuthTokenPayload {
	userId: number;
}

export function decodeAuthHeader(authHeader: String): AuthTokenPayload {
	const token = authHeader.replace('Bearer ', '');

	if (!token) {
		throw new Error('No token found');
	}
	return jwt.verify(token, APP_SECRET) as AuthTokenPayload;
}
