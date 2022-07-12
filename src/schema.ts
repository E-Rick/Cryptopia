import { makeSchema } from 'nexus';
import { join } from 'path';
import * as types from './graphql'; // import graphql model which exports Link object type through index.ts

// schema.ts – generates the schema with Nexus
export const schema = makeSchema({
	types,
	outputs: {
		schema: join(process.cwd(), 'schema.graphql'), // generating schema with nexus
		typegen: join(process.cwd(), 'nexus-typegen.ts'),
	},
});
