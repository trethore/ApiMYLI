import { createSchema } from "graphql-yoga";
import { createAccount } from "packages/application/src/use-cases/account/create-account";
import { deleteAccount } from "packages/application/src/use-cases/account/delete-account";
import { getAccountById } from "packages/application/src/use-cases/account/get-account-by-id";
import { getAuthenticatedAccountId } from "packages/application/src/use-cases/account/get-authenticated-account-id";
import { loginAccount } from "packages/application/src/use-cases/account/login-account";
import { logoutAccount } from "packages/application/src/use-cases/account/logout-account";
import { updateAccount } from "packages/application/src/use-cases/account/update-account";
import { updateArtistProfile } from "packages/application/src/use-cases/account/update-artist-profile";
import type { AuthTokenServicePort } from "packages/application/src/ports/security/auth-token-service-port";
import type { PasswordHasherPort } from "packages/application/src/ports/security/password-hasher-port";
import type { Account } from "packages/domain/src/entities/account";
import type { ArtistProfile } from "packages/domain/src/entities/artist-profile";
import type { AccountRepository } from "packages/domain/src/repositories/account-repository";

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

type GraphqlContextServices = {
  accountRepository: AccountRepository;
  passwordHasher: PasswordHasherPort;
  authTokenService: AuthTokenServicePort;
};

type GraphqlContext = {
  authToken: string | null;
  services: GraphqlContextServices;
};

const toGraphqlArtist = (artist: ArtistProfile): GraphqlArtist => ({
  artistId: artist.artistId,
  artistBio: artist.artistBio,
  artistLocation: artist.artistLocation,
  artistLatitude: artist.artistLatitude,
  artistLongitude: artist.artistLongitude,
  artistActiveYearBegin: artist.artistActiveYearBegin,
  artistActiveYearEnd: artist.artistActiveYearEnd,
  artistFavorites: artist.artistFavorites,
  artistComments: artist.artistComments,
});

const toGraphqlAccount = (account: Account): GraphqlAccount => ({
  accountId: account.accountId,
  login: account.login ?? null,
  email: account.email ?? null,
  name: account.name ?? null,
  isArtist: account.isArtist,
  artist: account.artist ? toGraphqlArtist(account.artist) : null,
});

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
        await getAuthenticatedAccountId(context.services.authTokenService, context.authToken);
        return "Hello from GraphQL + Prisma";
      },
      account: async (_parent: unknown, args: { accountId: string }, context: GraphqlContext) => {
        const currentAccountId = await getAuthenticatedAccountId(
          context.services.authTokenService,
          context.authToken,
        );

        const account = await getAccountById(
          context.services.accountRepository,
          currentAccountId,
          args.accountId,
        );

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
        const account = await createAccount(
          {
            accountRepository: context.services.accountRepository,
            passwordHasher: context.services.passwordHasher,
          },
          args.input,
        );

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
        const currentAccountId = await getAuthenticatedAccountId(
          context.services.authTokenService,
          context.authToken,
        );

        const account = await updateAccount(
          {
            accountRepository: context.services.accountRepository,
            passwordHasher: context.services.passwordHasher,
          },
          currentAccountId,
          args.accountId,
          args.input,
        );

        return account ? toGraphqlAccount(account) : null;
      },
      updateArtist: async (
        _parent: unknown,
        args: { accountId: string; input: UpdateArtistInput },
        context: GraphqlContext,
      ) => {
        const currentAccountId = await getAuthenticatedAccountId(
          context.services.authTokenService,
          context.authToken,
        );

        const artist = await updateArtistProfile(
          context.services.accountRepository,
          currentAccountId,
          args.accountId,
          args.input,
        );

        return artist ? toGraphqlArtist(artist) : null;
      },
      deleteAccount: async (
        _parent: unknown,
        args: { accountId: string },
        context: GraphqlContext,
      ) => {
        const currentAccountId = await getAuthenticatedAccountId(
          context.services.authTokenService,
          context.authToken,
        );

        return deleteAccount(context.services.accountRepository, currentAccountId, args.accountId);
      },
      login: async (
        _parent: unknown,
        args: { input: { email: string; password: string } },
        context: GraphqlContext,
      ) => {
        const result = await loginAccount(
          {
            accountRepository: context.services.accountRepository,
            passwordHasher: context.services.passwordHasher,
            authTokenService: context.services.authTokenService,
          },
          args.input,
        );

        if (!result) {
          return null;
        }

        return {
          token: result.token,
          account: toGraphqlAccount(result.account),
        };
      },
      logout: async (_parent: unknown, _args: unknown, context: GraphqlContext) => {
        return logoutAccount(context.services.authTokenService, context.authToken);
      },
    },
  },
});
