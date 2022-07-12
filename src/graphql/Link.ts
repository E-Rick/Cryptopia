import { extendType, objectType, nonNull, stringArg, intArg, arg } from 'nexus';
import { NexusGenObjects } from '../../nexus-typegen';

export const Link = objectType({
	name: 'Link',
	definition(t) {
		t.nonNull.int('id'), t.nonNull.string('description'), t.nonNull.string('url');
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
			resolve(parent, args, context, info) {
				return links;
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
		t.nonNull.field('post', {
			// the name of the mutation defined as post and returns non nullable link object
			type: 'Link',
			args: {
				description: nonNull(stringArg()),
				url: nonNull(stringArg()),
			},

			resolve(parent, args, context) {
				const { description, url } = args;

				let idCount = links.length + 1; //5
				const link = {
					id: idCount,
					description: description,
					url: url,
				};
				links.push(link);
				return link;
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
				const { id, description, url } = args;

				let link = links[id - 1];

				// check if description or url exists
				link = {
					id: link.id,
					description: args.description || link.description,
					url: args.url || link.url,
				};
				links[id] = link;

				return link;
			},
		});

		// Delete a link
		t.nonNull.field('deleteLink', {
			type: 'Link',
			args: {
				id: nonNull(intArg()),
			},

			resolve(_, args, context) {
				const link = links[args.id - 1];
				links.splice(args.id - 1, 1);
				return link;
			},
		});
	},
});
