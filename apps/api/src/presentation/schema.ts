import type {
  Account as PrismaAccount,
  PrismaClient,
  User as PrismaUser,
} from "@prisma/generated/prisma/client";
import { createAuthToken, revokeAuthToken, verifyAuthToken } from "@/infrastructure/auth";
import { hashPassword, verifyPassword } from "@/infrastructure/password-hasher";
import { createSchema } from "graphql-yoga";
import type Redis from "ioredis";

type GraphqlUser = {
  accountId: string;
  email: string | null;
  name: string | null;
};

type GraphqlContext = {
  prisma: PrismaClient;
  redis: Redis;
  authToken: string | null;
};

const toGraphqlUser = (user: PrismaUser & { account: PrismaAccount }): GraphqlUser => ({
  accountId: user.accountId,
  email: user.account.email,
  name: user.account.name,
});

const requireAuth = async (context: GraphqlContext): Promise<string> => {
  if (!context.authToken) {
    throw new Error("Unauthorized");
  }

  const accountId = await verifyAuthToken(context.authToken, context.redis);

  if (!accountId) {
    throw new Error("Unauthorized");
  }

  return accountId;
};

export const schema = createSchema({
  typeDefs: /* GraphQL */ `
    type User {
      accountId: ID!
      email: String
      name: String
    }

    type AuthPayload {
      token: String!
      user: User!
    }

    input CreateUserInput {
      email: String!
      password: String!
      name: String!
    }

    input UpdateUserInput {
      email: String
      password: String
      name: String
    }

    input LoginInput {
      email: String!
      password: String!
    }

    type Query {
      hello: String!
      users: [User!]!
      user(accountId: String!): User
    }

    type Mutation {
      createUser(input: CreateUserInput!): User!
      updateUser(accountId: String!, input: UpdateUserInput!): User
      deleteUser(accountId: String!): Boolean!
      login(input: LoginInput!): AuthPayload
      logout: Boolean!
    }
  `,
  resolvers: {
    Query: {
      hello: async (_parent: unknown, _args: unknown, context: GraphqlContext) => {
        await requireAuth(context);
        return "Hello from GraphQL + Prisma";
      },
      users: async (_parent: unknown, _args: unknown, context: GraphqlContext) => {
        await requireAuth(context);
        const users = await context.prisma.user.findMany({
          include: { account: true },
        });
        return users.map(toGraphqlUser);
      },
      user: async (
        _parent: unknown,
        args: { accountId: string },
        context: GraphqlContext,
      ) => {
        await requireAuth(context);
        const user = await context.prisma.user.findUnique({
          where: { accountId: args.accountId },
          include: { account: true },
        });

        return user ? toGraphqlUser(user) : null;
      },
    },
    Mutation: {
      createUser: async (
        _parent: unknown,
        args: {
          input: {
            email: string;
            password: string;
            name: string;
          };
        },
        context: GraphqlContext,
      ) => {
        const passwordHash = await hashPassword(args.input.password);

        const user = await context.prisma.user.create({
          data: {
            account: {
              create: {
                email: args.input.email,
                password: passwordHash,
                name: args.input.name,
              },
            },
          },
          include: { account: true },
        });

        return toGraphqlUser(user);
      },
      updateUser: async (
        _parent: unknown,
        args: {
          accountId: string;
          input: {
            email?: string | null;
            password?: string | null;
            name?: string | null;
          };
        },
        context: GraphqlContext,
      ) => {
        await requireAuth(context);
        const passwordHash =
          args.input.password === undefined
            ? undefined
            : args.input.password === null
              ? null
              : await hashPassword(args.input.password);

        const user = await context.prisma.user.update({
          where: { accountId: args.accountId },
          data: {
            account: {
              update: {
                email: args.input.email ?? undefined,
                password: passwordHash,
                name: args.input.name ?? undefined,
              },
            },
          },
          include: { account: true },
        });

        return toGraphqlUser(user);
      },
      deleteUser: async (
        _parent: unknown,
        args: { accountId: string },
        context: GraphqlContext,
      ) => {
        await requireAuth(context);
        await context.prisma.user.delete({
          where: { accountId: args.accountId },
        });
        await context.prisma.account.delete({
          where: { accountId: args.accountId },
        });
        return true;
      },
      login: async (
        _parent: unknown,
        args: { input: { email: string; password: string } },
        context: GraphqlContext,
      ) => {
        const account = await context.prisma.account.findFirst({
          where: { email: args.input.email },
          include: { user: true },
        });

        if (!account?.user || !account.password) {
          return null;
        }

        const isValid = await verifyPassword(args.input.password, account.password);

        if (!isValid) {
          return null;
        }

        const user = await context.prisma.user.findUnique({
          where: { accountId: account.accountId },
          include: { account: true },
        });

        if (!user) {
          return null;
        }

        const token = await createAuthToken(account.accountId, context.redis);

        return { token, user: toGraphqlUser(user) };
      },
      logout: async (_parent: unknown, _args: unknown, context: GraphqlContext) => {
        if (!context.authToken) {
          return false;
        }

        return revokeAuthToken(context.authToken, context.redis);
      },
    },
  },
});
