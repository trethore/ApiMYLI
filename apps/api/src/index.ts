import "dotenv/config";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import {
  PrismaClient,
  type User as PrismaUser,
} from "@prisma/generated/prisma/client";
import { createSchema, createYoga } from "graphql-yoga";

const databaseUrl = Bun.env.DATABASE_URL ?? "file:./prisma/dev.db";
const adapter = new PrismaLibSql({ url: databaseUrl });
const prisma = new PrismaClient({ adapter });

type GraphqlUser = {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
};

const toGraphqlUser = (user: PrismaUser): GraphqlUser => ({
  ...user,
  createdAt: user.createdAt.toISOString(),
});

const schema = createSchema({
  typeDefs: /* GraphQL */ `
    type User {
      id: ID!
      email: String!
      name: String
      createdAt: String!
    }

    type Query {
      hello: String!
      users: [User!]!
    }

    type Mutation {
      createUser(email: String!, name: String): User!
    }
  `,
  resolvers: {
    Query: {
      hello: () => "Hello from GraphQL + Prisma",
      users: async (
        _parent: unknown,
        _args: unknown,
        context: { prisma: PrismaClient }
      ) => {
        const users = await context.prisma.user.findMany();
        return users.map(toGraphqlUser);
      },
    },
    Mutation: {
      createUser: async (
        _parent: unknown,
        args: { email: string; name?: string | null },
        context: { prisma: PrismaClient }
      ) => {
        const user = await context.prisma.user.create({
          data: {
            email: args.email,
            name: args.name ?? null,
          },
        });
        return toGraphqlUser(user);
      },
    },
  },
});

const yoga = createYoga({
  schema,
  context: { prisma },
});

const port = Number(Bun.env.PORT ?? 4000);
const server = Bun.serve({
  port,
  fetch: yoga.fetch,
});

console.log(
  `GraphQL server ready at http://localhost:${server.port}${yoga.graphqlEndpoint}`
);
