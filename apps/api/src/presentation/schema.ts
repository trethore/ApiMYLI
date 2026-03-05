import type {
  Account as PrismaAccount,
  Artist as PrismaArtist,
  Prisma,
  PrismaClient,
} from "@prisma/generated/prisma/client";
import { createSchema } from "graphql-yoga";
import type Redis from "ioredis";
import { createAuthToken, revokeAuthToken, verifyAuthToken } from "@/infrastructure/auth";
import { hashPassword, verifyPassword } from "@/infrastructure/password-hasher";

const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{12,}$/;
const validatePassword = (pw: string) => {
  if (!PASSWORD_REGEX.test(pw)) {
    throw new Error("Password must be at least 12 characters long and include at least one uppercase letter and one special character.");
  }
};

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

type CreateAccountInput = {
  login: string;
  email: string;
  password: string;
  name: string;
  isArtist?: boolean | null;
};

type UpdateAccountInput = {
  login?: string | null;
  email?: string | null;
  password?: string | null;
  name?: string | null;
  isArtist?: boolean | null;
};

type UpdateArtistInput = {
  artistBio?: string | null;
  artistLocation?: string | null;
  artistLatitude?: number | null;
  artistLongitude?: number | null;
  artistActiveYearBegin?: number | null;
  artistActiveYearEnd?: number | null;
  artistFavorites?: number | null;
  artistComments?: number | null;
};

type GraphqlContext = {
  prisma: PrismaClient;
  redis: Redis;
  authToken: string | null;
};

type PrismaAccountWithArtist = PrismaAccount & {
  artist?: PrismaArtist | null;
};

const toNullableNumber = (
  value: bigint | number | null | undefined,
): number | null => {
  if (value === null || value === undefined) {
    return null;
  }

  return Number(value);
};

const toGraphqlArtist = (artist: PrismaArtist): GraphqlArtist => ({
  artistId: artist.artistId,
  artistBio: artist.artistBio,
  artistLocation: artist.artistLocation,
  artistLatitude: artist.artistLatitude,
  artistLongitude: artist.artistLongitude,
  artistActiveYearBegin: artist.artistActiveYearBegin,
  artistActiveYearEnd: artist.artistActiveYearEnd,
  artistFavorites: toNullableNumber(artist.artistFavorites),
  artistComments: toNullableNumber(artist.artistComments),
});

const toGraphqlAccount = (
  account: PrismaAccountWithArtist
): GraphqlAccount => ({
  accountId: account.accountId,
  login: account.login ?? null,
  email: account.email ?? null,
  name: account.name ?? null,
  isArtist: account.isArtist,
  artist: account.artist ? toGraphqlArtist(account.artist) : null,
});

const ensureLoginAvailable = async (
  prisma: PrismaClient,
  login: string,
  currentAccountId?: string,
): Promise<void> => {
  const existingAccount = await prisma.account.findUnique({
    where: { login },
  });

  if (
    existingAccount &&
    (!currentAccountId || existingAccount.accountId !== currentAccountId)
  ) {
    throw new Error("Login already in use");
  }
};

const ensureEmailAvailable = async (
  prisma: PrismaClient,
  email: string,
  currentAccountId?: string,
): Promise<void> => {
  const existingAccount = await prisma.account.findFirst({
    where: { email },
  });

  if (
    existingAccount &&
    (!currentAccountId || existingAccount.accountId !== currentAccountId)
  ) {
    throw new Error("Email already in use");
  }
};

const resolvePasswordHash = async (
  password: string | null | undefined,
): Promise<string | null | undefined> => {
  if (password === undefined) {
    return undefined;
  }

  if (password === null) {
    return null;
  }

  validatePassword(password);
  return hashPassword(password);
};

const buildCreateAccountData = (
  input: CreateAccountInput,
  passwordHash: string,
): Prisma.AccountCreateInput => {
  const accountData: Prisma.AccountCreateInput = {
    login: input.login,
    email: input.email,
    password: passwordHash,
    name: input.name,
    isArtist: input.isArtist ?? false,
  };

  if (input.isArtist) {
    accountData.artist = { create: {} };
  }

  return accountData;
};

const buildUpdateAccountData = async (
  input: UpdateAccountInput,
): Promise<Prisma.AccountUpdateInput> => {
  const passwordHash = await resolvePasswordHash(input.password);
  const isArtist = input.isArtist ?? undefined;

  const updateData: Prisma.AccountUpdateInput = {
    login: input.login ?? undefined,
    email: input.email ?? undefined,
    name: input.name ?? undefined,
    isArtist,
  };

  if (passwordHash !== undefined) {
    updateData.password = passwordHash;
  }

  if (isArtist !== undefined) {
    updateData.artist = isArtist
      ? {
          upsert: {
            create: {},
            update: {},
          },
        }
      : { delete: true };
  }

  return updateData;
};

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
          input: CreateAccountInput;
        },
        context: GraphqlContext,
      ) => {
        const login = args.input.login;
        if (!login || login.trim() === "") {
          throw new Error("Login is required");
        }

        await ensureLoginAvailable(context.prisma, login);
        await ensureEmailAvailable(context.prisma, args.input.email);

        validatePassword(args.input.password);
        const passwordHash = await hashPassword(args.input.password);
        const accountData = buildCreateAccountData(args.input, passwordHash);

        const account = await context.prisma.account.create({
          data: accountData,
          include: { artist: true },
        });

        return toGraphqlAccount(account);
      },
      updateAccount: async (
        _parent: unknown,
        args: {
          accountId: string;
          input: UpdateAccountInput;
        },
        context: GraphqlContext,
      ) => {
        await requireAuth(context);

        if (args.input.login) {
          await ensureLoginAvailable(context.prisma, args.input.login, args.accountId);
        }

        if (args.input.email) {
          await ensureEmailAvailable(context.prisma, args.input.email, args.accountId);
        }

        const updateData = await buildUpdateAccountData(args.input);

        const account = await context.prisma.account.update({
          where: { accountId: args.accountId },
          data: updateData,
          include: { artist: true },
        });

        return toGraphqlAccount(account);
      },
      updateArtist: async (
        _parent: unknown,
        args: { accountId: string; input: UpdateArtistInput },
        context: GraphqlContext,
      ) => {
        await requireAuth(context);
        const artistUpdateData: Prisma.ArtistUpdateInput = args.input;
        const artist = await context.prisma.artist.update({
          where: { artistId: args.accountId },
          data: artistUpdateData,
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
          include: { artist: true },
        });

        if (!account?.password) {
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
