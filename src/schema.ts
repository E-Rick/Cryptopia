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
	// Nexus ensures all context arguments match the Context interface
	contextType: {
		module: join(process.cwd(), './src/context.ts'), // path to the file (sometimes called a module) where context interface (or type) is exported.
		export: 'Context', // name of the xported interface in that module
	},
});
