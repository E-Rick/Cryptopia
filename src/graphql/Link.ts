import {
	extendType,
	objectType,
	nonNull,
	stringArg,
	intArg,
	arg,
	inputObjectType,
	enumType,
	list,
} from 'nexus';
import { Prisma } from '@prisma/client';

export const Link = objectType({
	name: 'Link',
	definition(t) {
		t.nonNull.int('id'), t.nonNull.string('description'), t.nonNull.string('url');
		t.nonNull.dateTime('createdAt');
		t.field('postedBy', {
			type: 'User',
			resolve(parent, args, context) {
				// fetch the link record using findUnique and the associated user relation who posted by chaining postedBy()
				return context.prisma.link.findUnique({ where: { id: parent.id } }).postedBy();
			},
		});
		t.nonNull.list.nonNull.field('voters', {
			type: 'User',
			resolve(parent, __, context) {
				return context.prisma.link.findUnique({ where: { id: parent.id } }).voters();
			},
		});
	},
});

//  Implement feed query
// Query: {feed: [Link!]!}
export const LinkQuery = extendType({
	type: 'Query',
	definition(t) {
		t.nonNull.list.nonNull.field('feed', {
			type: 'Link',
			args: {
				filter: stringArg(),
				skip: intArg(),
				take: intArg(),
				orderBy: arg({ type: list(nonNull(LinkOrderByInput)) }),
			},
			resolve(_, args, context) {
				// filter is optional. it can be omitted to skip filtering
				const where = args.filter
					? {
							OR: [{ description: { contains: args.filter } }, { url: { contains: args.filter } }],
					  }
					: {};
				return context.prisma.link.findMany({
					where,
					// type casting is needed because of type mismatch between Nexus gen type (number | undefined | null) and type expected by Prisma (number | undefined)
					skip: args?.skip as number | undefined,
					take: args?.take as number | undefined,
					orderBy: args?.orderBy as
						| Prisma.Enumerable<Prisma.LinkOrderByWithRelationInput>
						| undefined,
				});
			},
		});

		// Fetch a single link by it's id
		t.field('link', {
			type: 'Link',
			args: {
				id: nonNull(intArg()),
			},
		});
	},
});

//  Create a mutation for adding new links

export const LinkMutation = extendType({
	type: 'Mutation', // extend Mutation type to add new root field
	definition(t) {
		// Post a new link
		// -----------
		t.nonNull.field('post', {
			// the name of the mutation defined as post and returns non nullable link object
			type: 'Link',
			args: {
				description: nonNull(stringArg()),
				url: nonNull(stringArg()),
			},

			resolve(parent, args, context) {
				const { description, url } = args;
				const { userId } = context;

				// if user doesn't exist in the context, throw error. only authorized users can post new links
				if (!userId) throw new Error('Cannot post without logging in');

				// connect User to the Link postedBy field (rep Link to User relation)
				const newLink = context.prisma.link.create({
					data: {
						description,
						url,
						postedBy: { connect: { id: userId } },
					},
				});

				return newLink;
			},
		});

		// Update a link
		t.nonNull.field('updateLink', {
			type: 'Link',
			args: {
				id: nonNull(intArg()),
				url: stringArg(),
				description: stringArg(),
			},

			resolve(_, args, context) {
				const updatedLink = context.prisma.link.update({
					where: {
						id: args.id,
					},
					data: {
						description: args.description || undefined,
						url: args.url || undefined,
					},
				});
				return updatedLink;
			},
		});

		// Delete a link
		t.nonNull.field('deleteLink', {
			type: 'Link',
			args: {
				id: nonNull(intArg()),
			},

			resolve(_, args, context) {
				const deletedLink = context.prisma.link.delete({
					where: {
						id: args.id,
					},
				});
				return deletedLink;
			},
		});
	},
});

/**
 * LinkOrderByInput represents the criteria by which Link elements can be sorted. Sort enum defines sorting order
 */
export const LinkOrderByInput = inputObjectType({
	name: 'LinkOrderByInput',
	definition(t) {
		t.field('description', { type: Sort });
		t.field('url', { type: Sort });
		t.field('createdAt', { type: Sort });
	},
});

// Ordering options for sorting
export const Sort = enumType({
	name: 'Sort',
	members: ['asc', 'desc'],
});
