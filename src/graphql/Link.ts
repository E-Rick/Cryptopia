import { extendType, objectType, nonNull, stringArg, intArg, arg } from 'nexus';
import { NexusGenObjects } from '../../nexus-typegen';

export const Link = objectType({
	name: 'Link',
	definition(t) {
		t.nonNull.int('id'), t.nonNull.string('description'), t.nonNull.string('url');
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
				return context.prisma.link.findUnique({ where: { id: parent.id } }).votes();
			},
		});
	},
});

//  Implement feed query

let links: NexusGenObjects['Link'][] = [
	{ id: 1, url: 'www.howtographql.com', description: 'fullstack tutorial for GraphQl' },
	{ id: 2, url: 'www.graphql.org', description: 'fullstack tutorial for GraphQl' },
];

// Query: {feed: [Link!]!}
export const LinkQuery = extendType({
	type: 'Query',
	definition(t) {
		t.nonNull.list.nonNull.field('feed', {
			type: 'Link',
			resolve(parent, args, context) {
				return context.prisma.link.findMany();
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
