import { asNexusMethod } from 'nexus';
import { GraphQLDateTime } from 'graphql-scalars';

// GraphQLDateTime uses ISO-8601 specification, same used by Prisma for its own `DateTime` type
// asNexusMethod allows you to expose a custom scalar as Nexus Type. 2 args: custom scalar, and name for Nexus type
export const GQLDate = asNexusMethod(GraphQLDateTime, 'dateTime');
