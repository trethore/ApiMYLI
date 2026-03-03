import type {
  Account as PrismaAccount,
  PrismaClient,
} from "@prisma/generated/prisma/client";
import { createAuthToken, revokeAuthToken, verifyAuthToken } from "@/infrastructure/auth";
import { hashPassword, verifyPassword } from "@/infrastructure/password-hasher";

const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{12,}$/;
const validatePassword = (pw: string) => {
  if (!PASSWORD_REGEX.test(pw)) {
    throw new Error("Password must be at least 12 characters long and include at least one uppercase letter and one special character.");
  }
};
import { createSchema } from "graphql-yoga";
import type Redis from "ioredis";

type GraphqlArtist = {
  artistId: string;
  artistBio?: string | null;
  artistLocation?: string | null;
  artistLatitude?: number | null;
  artistLongitude?: number | null;
  artistActiveYearBegin?: number | null;
  artistActiveYearEnd?: number | null;
  artistFavorites?: number | null;
  artistComments?: number | null;
};

type GraphqlAccount = {
  accountId: string;
  login: string | null;
  email: string | null;
  name: string | null;
  isArtist: boolean;
  artist?: GraphqlArtist | null;
};

type GraphqlContext = {
  prisma: PrismaClient;
  redis: Redis;
  authToken: string | null;
};

const toGraphqlAccount = (
  account: PrismaAccount & { artist?: any }
): GraphqlAccount => ({
  accountId: account.accountId,
  login: account.login ?? null,
  email: account.email ?? null,
  name: account.name ?? null,
  isArtist: account.isArtist,
  artist: account.artist
    ? {
        artistId: account.artist.artistId,
        artistBio: account.artist.artistBio,
        artistLocation: account.artist.artistLocation,
        artistLatitude: account.artist.artistLatitude,
        artistLongitude: account.artist.artistLongitude,
        artistActiveYearBegin: account.artist.artistActiveYearBegin,
        artistActiveYearEnd: account.artist.artistActiveYearEnd,
        artistFavorites: account.artist.artistFavorites,
        artistComments: account.artist.artistComments,
      }
    : null,
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
    type Artist {
      artistId: ID!
      artistBio: String
      artistLocation: String
      artistLatitude: Float
      artistLongitude: Float
      artistActiveYearBegin: Int
      artistActiveYearEnd: Int
      artistFavorites: Float
      artistComments: Float
    }

    type Account {
      accountId: ID!
      login: String
      email: String
      name: String
      isArtist: Boolean!
      artist: Artist
    }

    type AuthPayload {
      token: String!
      account: Account!
    }

    input CreateAccountInput {
      login: String!
      email: String!
      password: String!
      name: String!
      isArtist: Boolean
    }

    input UpdateArtistInput {
      artistBio: String
      artistLocation: String
      artistLatitude: Float
      artistLongitude: Float
      artistActiveYearBegin: Int
      artistActiveYearEnd: Int
      artistFavorites: Float
      artistComments: Float
    }

    input UpdateAccountInput {
      login: String
      email: String
      password: String
      name: String
      isArtist: Boolean
    }

    input LoginInput {
      email: String!
      password: String!
    }

    type Query {
      hello: String!
      account(accountId: String!): Account
    }

    type Mutation {
      createAccount(input: CreateAccountInput!): Account!
      updateAccount(accountId: String!, input: UpdateAccountInput!): Account
      updateArtist(accountId: String!, input: UpdateArtistInput!): Artist
      deleteAccount(accountId: String!): Boolean!
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
      account: async (
        _parent: unknown,
        args: { accountId: string },
        context: GraphqlContext,
      ) => {
        await requireAuth(context);
        const account = await context.prisma.account.findUnique({
          where: { accountId: args.accountId },
          include: { artist: true },
        });

        return account ? toGraphqlAccount(account) : null;
      },
    },
    Mutation: {
      createAccount: async (
        _parent: unknown,
        args: {
          input: {
            login: string;
            email: string;
            password: string;
            name: string;
          };
        },
        context: GraphqlContext,
      ) => {
        const login = args.input.login;
        if (!login || login.trim() === "") {
          throw new Error("Login is required");
        }
        // unique login check
        const existing = await context.prisma.account.findUnique({
          where: { login },
        });
        if (existing) {
          throw new Error("Login already in use");
        }
        // unique email check
        const existingEmail = await context.prisma.account.findFirst({
          where: { email: args.input.email },
        });
        if (existingEmail) {
          throw new Error("Email already in use");
        }

        validatePassword(args.input.password);
        const passwordHash = await hashPassword(args.input.password);

        const accountData: any = {
            login,
            email: args.input.email,
            password: passwordHash,
            name: args.input.name,
            isArtist: args.input.isArtist ?? false,
        };
        if (args.input.isArtist) {
          accountData.artist = { create: {} };
        }
        const account = await context.prisma.account.create({
          data: accountData,
        });

        return toGraphqlAccount(account);
      },
      updateAccount: async (
        _parent: unknown,
        args: {
          accountId: string;
          input: {
            login?: string | null;
            email?: string | null;
            password?: string | null;
            name?: string | null;
          };
        },
        context: GraphqlContext,
      ) => {
        await requireAuth(context);

        if (args.input.login) {
          const other = await context.prisma.account.findUnique({
            where: { login: args.input.login },
          });
          if (other && other.accountId !== args.accountId) {
            throw new Error("Login already in use");
          }
        }
        if (args.input.email) {
          const otherEmail = await context.prisma.account.findFirst({
            where: { email: args.input.email },
          });
          if (otherEmail && otherEmail.accountId !== args.accountId) {
            throw new Error("Email already in use");
          }
        }

        let passwordHash: string | undefined | null;
        if (args.input.password !== undefined) {
          if (args.input.password === null) {
            passwordHash = null;
          } else {
            validatePassword(args.input.password);
            passwordHash = await hashPassword(args.input.password);
          }
        }

        const updateData: any = {
            login: args.input.login ?? undefined,
            email: args.input.email ?? undefined,
            password: passwordHash,
            name: args.input.name ?? undefined,
            isArtist: args.input.isArtist ?? undefined,
        };
        if (args.input.isArtist !== undefined) {
          if (args.input.isArtist) {
            updateData.artist = { upsert: {
              create: {},
              update: {},
            } };
          } else {
            updateData.artist = { delete: true };
          }
        }
        const account = await context.prisma.account.update({
          where: { accountId: args.accountId },
          data: updateData,
        });

        return toGraphqlAccount(account);
      },
      updateArtist: async (
        _parent: unknown,
        args: { accountId: string; input: Record<string, any> },
        context: GraphqlContext,
      ) => {
        await requireAuth(context);
        const artist = await context.prisma.artist.update({
          where: { artistId: args.accountId },
          data: args.input,
        });
        return artist;
      },
      deleteAccount: async (
        _parent: unknown,
        args: { accountId: string },
        context: GraphqlContext,
      ) => {
        await requireAuth(context);
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
        });

        if (!account || !account.password) {
          return null;
        }

        const isValid = await verifyPassword(args.input.password, account.password);
        if (!isValid) {
          return null;
        }

        const token = await createAuthToken(account.accountId, context.redis);
        return { token, account: toGraphqlAccount(account) };
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
