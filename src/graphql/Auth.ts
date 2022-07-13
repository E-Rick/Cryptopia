import { extendType, nonNull, objectType, stringArg } from 'Nexus';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

import { APP_SECRET } from '../utils/auth';

export const AuthPayload = objectType({
	name: 'AuthPayload',
	definition(t) {
		t.nonNull.string('token');
		t.nonNull.field('user', {
			type: 'User',
		});
	},
});

export const AuthMutation = extendType({
	type: 'Mutation',
	definition(t) {
		// Login mutation
		t.nonNull.field('login', {
			type: 'AuthPayload',
			args: {
				email: nonNull(stringArg()),
				password: nonNull(stringArg()),
			},
			async resolve(parent, args, context) {
				// Search up existing user in Prisma database by email arg
				const user = await context.prisma.user.findUnique({ where: { email: args.email } });

				// throw error if no existing user found
				if (!user) throw new Error('no such user found!');

				// Compare provided password with the one stored in the database.
				const valid = await bcrypt.compare(args.password, user.password);

				// If no match on password, throw an error
				if (!valid) throw new Error('Invalid password!');

				// Create a JWT token encoded with the user's id trying to login
				const token = jwt.sign({ userId: user.id }, APP_SECRET);

				return {
					token,
					user,
				};
			},
		});

		// Signup mutation
		t.nonNull.field('signup', {
			type: 'AuthPayload',
			args: {
				email: nonNull(stringArg()),
				password: nonNull(stringArg()),
				name: nonNull(stringArg()),
			},
			async resolve(parent, args, context) {
				// deconstruct the email and name from args
				const { email, name } = args;

				// hash password using the bcrypt library
				const password = await bcrypt.hash(args.password, 10);

				// store the new `User` record in the database
				const user = await context.prisma.user.create({
					data: {
						email,
						name,
						password,
					},
				});

				// generate a JSON Web Token which is signed with APP_SECRET. The id of newly created user is encoded in token.
				const token = jwt.sign({ userId: user.id }, APP_SECRET);

				// Return the token and the user object in a object that adheres to the shape of the AuthPayload type
				return {
					token,
					user,
				};
			},
		});
	},
});
