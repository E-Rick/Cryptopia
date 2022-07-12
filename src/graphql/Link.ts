import { extendType, objectType } from 'nexus';
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
	},
});
