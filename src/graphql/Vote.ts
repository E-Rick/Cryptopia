import { extendType, intArg, nonNull, objectType } from 'Nexus';
import { User } from '@prisma/client';

export const Vote = objectType({
	name: 'Vote',
	definition(t) {
		t.nonNull.field('link', { type: 'Link' });
		t.nonNull.field('user', { type: 'User' });
	},
});

export const VoteMutation = extendType({
	type: 'Mutation',
	definition(t) {
		t.field('vote', {
			type: 'Vote',
			args: {
				linkId: nonNull(intArg()),
			},
			async resolve(parent, args, context) {
				const { userId } = context;
				const { linkId } = args;

				if (!userId) throw new Error('Cannot vote without loggin in');

				// Update link with upvote
				const link = await context.prisma.link.update({
					where: {
						id: linkId, // which link to update
					},
					data: { voters: { connect: { id: userId } } }, // attach new many to many relation represented by voters field using `connect` option
				});

				const user = await context.prisma.user.findUnique({ where: { id: userId } });

				// return an object of Vote type which contains the user and link in question
				return {
					link,
					// necessary typecasting because prisma.user.findUnique returns User | null whereas the type expected from resolve function is User
					user: user as User,
				};
			},
		});
	},
});
