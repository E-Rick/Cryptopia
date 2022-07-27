import { ApolloServer } from 'apollo-server';
import { context } from './context';
import { ApolloServerPluginLandingPageLocalDefault } from 'apollo-server-core';
import * as dotenv from 'dotenv';
dotenv.config();

// 1
import { schema } from './schema';
export const server = new ApolloServer({
	schema,
	context,
	introspection: true,
	plugins: [ApolloServerPluginLandingPageLocalDefault()],
});

const port = process.env.PORT || 3000;
// 2
server.listen({ port }).then(({ url }) => {
	console.log(`🚀  Server ready at ${url}`);
	console.log(process.env);
});
