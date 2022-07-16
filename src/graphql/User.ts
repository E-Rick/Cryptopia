import { objectType } from 'nexus';

export const User = objectType({
	name: 'User',
	definition(t) {
		t.nonNull.int('id', { description: "the user's id index" });
		t.nonNull.string('address', { description: "the user's unique public wallet address" });
		t.string('username', { description: "the user's unique username" });
		t.string('email', { description: "the user's email" });
		t.string('name', { description: "the user's name" });
		t.string('bio', { description: "the user's bio description" });
		t.string('profileImageUrl', { description: "the user's profile image url" });
		t.string('coverImageUrl', { description: "the user's cover image url" });
		t.string('token', { description: "the user's jwt authentication token for sesson data" });
		t.int('nonce', { description: "the user's generated nonce for wallet authentication" });
		t.nonNull.list.nonNull.field('links', {
			type: 'Link',
			resolve(parent, __, ctx) {
				// returns the associated user.links for a certain user in database
				return ctx.prisma.user.findUnique({ where: { address: parent.address } }).links();
			},
		});
		t.nonNull.list.nonNull.field('votes', {
			type: 'Link',
			resolve(parent, __, ctx) {
				return ctx.prisma.user.findUnique({ where: { address: parent.address } }).votes();
			},
		});
	},
});
