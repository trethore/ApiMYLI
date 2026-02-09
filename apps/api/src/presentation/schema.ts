import type { PrismaClient, User as PrismaUser } from "@prisma/generated/prisma/client";
import { createSchema } from "graphql-yoga";
import type Redis from "ioredis";

type GraphqlUser = {
  accountId: string;
  pseudo: string | null;
};

type GraphqlContext = {
  prisma: PrismaClient;
  redis: Redis;
};

const toGraphqlUser = (user: PrismaUser): GraphqlUser => ({
  accountId: user.accountId,
  pseudo: user.pseudo,
});

export const schema = createSchema({
  typeDefs: /* GraphQL */ `
    type User {
      accountId: ID!
      pseudo: String
    }

    type Query {
      hello: String!
      users: [User!]!
    }

    type Mutation {
      createUser(accountId: String!, pseudo: String): User!
    }
  `,
  resolvers: {
    Query: {
      hello: () => "Hello from GraphQL + Prisma",
      users: async (_parent: unknown, _args: unknown, context: GraphqlContext) => {
        const users = await context.prisma.user.findMany();
        return users.map(toGraphqlUser);
      },
    },
    Mutation: {
      createUser: async (
        _parent: unknown,
        args: { accountId: string; pseudo?: string | null },
        context: GraphqlContext,
      ) => {
        const user = await context.prisma.user.create({
          data: {
            accountId: args.accountId,
            pseudo: args.pseudo ?? null,
          },
        });

        return toGraphqlUser(user);
      },
    },
  },
});
