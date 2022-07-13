import { objectType } from 'nexus';

export const User = objectType({
	name: 'User',
	definition(t) {
		t.nonNull.int('id');
		t.nonNull.string('name');
		t.nonNull.string('email');
		t.nonNull.list.nonNull.field('links', {
			type: 'Link',
			resolve(parent, __, ctx) {
				// returns the associated user.links for a certain user in database
				return ctx.prisma.user.findUnique({ where: { id: parent.id } }).links();
			},
		});
		t.nonNull.list.nonNull.field('votes', {
			type: 'Link',
			resolve(parent, __, ctx) {
				return ctx.prisma.user.findUnique({ where: { id: parent.id } }).votes();
			},
		});
	},
});
