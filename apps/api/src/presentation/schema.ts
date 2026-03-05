import { createSchema } from "graphql-yoga";
import { createPlaylist } from "packages/application/src/use-cases/playlist/create-playlist";
import { deletePlaylist } from "packages/application/src/use-cases/playlist/delete-playlist";
import { getPlaylistById } from "packages/application/src/use-cases/playlist/get-playlist-by-id";
import { listMyPlaylists } from "packages/application/src/use-cases/playlist/list-my-playlists";
import { updatePlaylist } from "packages/application/src/use-cases/playlist/update-playlist";
import { addTrackToPlaylist } from "packages/application/src/use-cases/playlist/add-track-to-playlist";
import { removeTrackFromPlaylist } from "packages/application/src/use-cases/playlist/remove-track-from-playlist";
import { createAccount } from "packages/application/src/use-cases/account/create-account";
import { deleteAccount } from "packages/application/src/use-cases/account/delete-account";
import { getAccountById } from "packages/application/src/use-cases/account/get-account-by-id";
import { getAuthenticatedAccountId } from "packages/application/src/use-cases/account/get-authenticated-account-id";
import { loginAccount } from "packages/application/src/use-cases/account/login-account";
import { logoutAccount } from "packages/application/src/use-cases/account/logout-account";
import { updateAccount } from "packages/application/src/use-cases/account/update-account";
import { updateArtistProfile } from "packages/application/src/use-cases/account/update-artist-profile";
import { getTrackById } from "packages/application/src/use-cases/track/get-track-by-id";
import { likeTrack } from "packages/application/src/use-cases/track/like-track";
import { listArtistTopTracks } from "packages/application/src/use-cases/track/list-artist-top-tracks";
import { listLikedTracks } from "packages/application/src/use-cases/track/list-liked-tracks";
import { listTracksByAlbum } from "packages/application/src/use-cases/track/list-tracks-by-album";
import { recordTrackListen } from "packages/application/src/use-cases/track/record-track-listen";
import { unlikeTrack } from "packages/application/src/use-cases/track/unlike-track";
import type { AuthTokenServicePort } from "packages/application/src/ports/security/auth-token-service-port";
import type { PasswordHasherPort } from "packages/application/src/ports/security/password-hasher-port";
import type { Account } from "packages/domain/src/entities/account";
import type { ArtistProfile } from "packages/domain/src/entities/artist-profile";
import type { Playlist } from "packages/domain/src/entities/playlist";
import type { AlbumSummary, ArtistSummary, Track } from "packages/domain/src/entities/track";
import type { PlaylistRepository } from "packages/domain/src/repositories/playlist-repository";
import type { AccountRepository } from "packages/domain/src/repositories/account-repository";
import type { TrackCatalogRepository } from "packages/domain/src/repositories/track-catalog-repository";
import type { TrackLibraryRepository } from "packages/domain/src/repositories/track-library-repository";

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

type GraphqlArtistSummary = {
  artistId: string;
  name: string | null;
  imageUrl: string | null;
};

type GraphqlAlbumSummary = {
  albumId: string;
  title: string | null;
  imageUrl: string | null;
  type: string | null;
};

type GraphqlTrack = {
  trackId: string;
  title: string | null;
  imageUrl: string | null;
  audioSrc: string | null;
  durationSeconds: number | null;
  trackNumber: number | null;
  discNumber: number | null;
  isExplicit: boolean;
  isInstrumental: boolean;
  listens: number | null;
  favorites: number | null;
  comments: number | null;
  album: GraphqlAlbumSummary | null;
  mainArtists: GraphqlArtistSummary[];
  featArtists: GraphqlArtistSummary[];
  isLiked: boolean;
};

type GraphqlPlaylist = {
  playlistId: string;
  name: string | null;
  ownerDisplayName: string | null;
  isEditable: boolean;
  trackCount: number;
  tracks: GraphqlTrack[];
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

type CreatePlaylistInput = {
  name: string;
};

type UpdatePlaylistInput = {
  name?: string | null;
};

type GraphqlContextServices = {
  accountRepository: AccountRepository;
  trackCatalogRepository: TrackCatalogRepository;
  trackLibraryRepository: TrackLibraryRepository;
  playlistRepository: PlaylistRepository;
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

const toGraphqlArtistSummary = (artist: ArtistSummary): GraphqlArtistSummary => ({
  artistId: artist.artistId,
  name: artist.name,
  imageUrl: artist.imageUrl,
});

const toGraphqlAlbumSummary = (album: AlbumSummary): GraphqlAlbumSummary => ({
  albumId: album.albumId,
  title: album.title,
  imageUrl: album.imageUrl,
  type: album.type,
});

const toGraphqlTrack = (track: Track): GraphqlTrack => ({
  trackId: track.trackId,
  title: track.title,
  imageUrl: track.imageUrl,
  audioSrc: track.audioSrc,
  durationSeconds: track.durationSeconds,
  trackNumber: track.trackNumber,
  discNumber: track.discNumber,
  isExplicit: track.isExplicit,
  isInstrumental: track.isInstrumental,
  listens: track.listens,
  favorites: track.favorites,
  comments: track.comments,
  album: track.album ? toGraphqlAlbumSummary(track.album) : null,
  mainArtists: track.mainArtists.map(toGraphqlArtistSummary),
  featArtists: track.featArtists.map(toGraphqlArtistSummary),
  isLiked: track.isLiked,
});

const toGraphqlPlaylist = (playlist: Playlist): GraphqlPlaylist => ({
  playlistId: playlist.playlistId,
  name: playlist.name,
  ownerDisplayName: playlist.ownerDisplayName,
  isEditable: playlist.isEditable,
  trackCount: playlist.trackCount,
  tracks: playlist.tracks.map(toGraphqlTrack),
});

const getOptionalAuthenticatedAccountId = async (
  context: GraphqlContext,
): Promise<string | null> => {
  if (!context.authToken) {
    return null;
  }

  return context.services.authTokenService.verify(context.authToken);
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

    type ArtistSummary {
      artistId: ID!
      name: String
      imageUrl: String
    }

    type AlbumSummary {
      albumId: ID!
      title: String
      imageUrl: String
      type: String
    }

    type Track {
      trackId: ID!
      title: String
      imageUrl: String
      audioSrc: String
      durationSeconds: Int
      trackNumber: Int
      discNumber: Int
      isExplicit: Boolean!
      isInstrumental: Boolean!
      listens: Float
      favorites: Float
      comments: Float
      album: AlbumSummary
      mainArtists: [ArtistSummary!]!
      featArtists: [ArtistSummary!]!
      isLiked: Boolean!
    }

    type Playlist {
      playlistId: ID!
      name: String
      ownerDisplayName: String
      isEditable: Boolean!
      trackCount: Int!
      tracks: [Track!]!
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

    input CreatePlaylistInput {
      name: String!
    }

    input UpdatePlaylistInput {
      name: String
    }

    input LoginInput {
      email: String!
      password: String!
    }

    type Query {
      hello: String!
      account(accountId: String!): Account
      track(trackId: String!): Track
      albumTracks(albumId: String!): [Track!]!
      artistTopTracks(artistId: String!, limit: Int): [Track!]!
      likedTracks: [Track!]!
      playlist(playlistId: String!): Playlist
      myPlaylists: [Playlist!]!
    }

    type Mutation {
      createAccount(input: CreateAccountInput!): Account!
      updateAccount(accountId: String!, input: UpdateAccountInput!): Account
      updateArtist(accountId: String!, input: UpdateArtistInput!): Artist
      deleteAccount(accountId: String!): Boolean!
      login(input: LoginInput!): AuthPayload
      logout: Boolean!
      likeTrack(trackId: String!): Track
      unlikeTrack(trackId: String!): Track
      createPlaylist(input: CreatePlaylistInput!): Playlist!
      updatePlaylist(playlistId: String!, input: UpdatePlaylistInput!): Playlist
      deletePlaylist(playlistId: String!): Boolean!
      addTrackToPlaylist(playlistId: String!, trackId: String!): Playlist
      removeTrackFromPlaylist(playlistId: String!, trackId: String!): Playlist
      recordTrackListen(trackId: String!): Boolean!
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
      track: async (_parent: unknown, args: { trackId: string }, context: GraphqlContext) => {
        const currentAccountId = await getOptionalAuthenticatedAccountId(context);
        const track = await getTrackById(
          context.services.trackCatalogRepository,
          args.trackId,
          currentAccountId,
        );

        return track ? toGraphqlTrack(track) : null;
      },
      albumTracks: async (_parent: unknown, args: { albumId: string }, context: GraphqlContext) => {
        const currentAccountId = await getOptionalAuthenticatedAccountId(context);
        const tracks = await listTracksByAlbum(
          context.services.trackCatalogRepository,
          args.albumId,
          currentAccountId,
        );

        return tracks.map(toGraphqlTrack);
      },
      artistTopTracks: async (
        _parent: unknown,
        args: { artistId: string; limit?: number | null },
        context: GraphqlContext,
      ) => {
        const currentAccountId = await getOptionalAuthenticatedAccountId(context);
        const tracks = await listArtistTopTracks(
          context.services.trackCatalogRepository,
          args.artistId,
          currentAccountId,
          args.limit ?? undefined,
        );

        return tracks.map(toGraphqlTrack);
      },
      likedTracks: async (_parent: unknown, _args: unknown, context: GraphqlContext) => {
        const currentAccountId = await getAuthenticatedAccountId(
          context.services.authTokenService,
          context.authToken,
        );

        const tracks = await listLikedTracks(context.services.trackLibraryRepository, currentAccountId);

        return tracks.map(toGraphqlTrack);
      },
      playlist: async (
        _parent: unknown,
        args: { playlistId: string },
        context: GraphqlContext,
      ) => {
        const currentAccountId = await getOptionalAuthenticatedAccountId(context);
        const playlist = await getPlaylistById(
          context.services.playlistRepository,
          args.playlistId,
          currentAccountId,
        );

        return playlist ? toGraphqlPlaylist(playlist) : null;
      },
      myPlaylists: async (_parent: unknown, _args: unknown, context: GraphqlContext) => {
        const currentAccountId = await getAuthenticatedAccountId(
          context.services.authTokenService,
          context.authToken,
        );

        const playlists = await listMyPlaylists(context.services.playlistRepository, currentAccountId);

        return playlists.map(toGraphqlPlaylist);
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
        const token = context.authToken;
        if (!token) {
          return false;
        }

        return logoutAccount(context.services.authTokenService, token);
      },
      likeTrack: async (_parent: unknown, args: { trackId: string }, context: GraphqlContext) => {
        const currentAccountId = await getAuthenticatedAccountId(
          context.services.authTokenService,
          context.authToken,
        );

        const track = await likeTrack(
          context.services.trackLibraryRepository,
          currentAccountId,
          args.trackId,
        );

        return track ? toGraphqlTrack(track) : null;
      },
      unlikeTrack: async (
        _parent: unknown,
        args: { trackId: string },
        context: GraphqlContext,
      ) => {
        const currentAccountId = await getAuthenticatedAccountId(
          context.services.authTokenService,
          context.authToken,
        );

        const track = await unlikeTrack(
          context.services.trackLibraryRepository,
          currentAccountId,
          args.trackId,
        );

        return track ? toGraphqlTrack(track) : null;
      },
      createPlaylist: async (
        _parent: unknown,
        args: { input: CreatePlaylistInput },
        context: GraphqlContext,
      ) => {
        const currentAccountId = await getAuthenticatedAccountId(
          context.services.authTokenService,
          context.authToken,
        );

        const playlist = await createPlaylist(
          context.services.playlistRepository,
          currentAccountId,
          args.input,
        );

        return toGraphqlPlaylist(playlist);
      },
      updatePlaylist: async (
        _parent: unknown,
        args: { playlistId: string; input: UpdatePlaylistInput },
        context: GraphqlContext,
      ) => {
        const currentAccountId = await getAuthenticatedAccountId(
          context.services.authTokenService,
          context.authToken,
        );

        const playlist = await updatePlaylist(
          context.services.playlistRepository,
          currentAccountId,
          args.playlistId,
          args.input,
        );

        return playlist ? toGraphqlPlaylist(playlist) : null;
      },
      deletePlaylist: async (
        _parent: unknown,
        args: { playlistId: string },
        context: GraphqlContext,
      ) => {
        const currentAccountId = await getAuthenticatedAccountId(
          context.services.authTokenService,
          context.authToken,
        );

        return deletePlaylist(
          context.services.playlistRepository,
          currentAccountId,
          args.playlistId,
        );
      },
      addTrackToPlaylist: async (
        _parent: unknown,
        args: { playlistId: string; trackId: string },
        context: GraphqlContext,
      ) => {
        const currentAccountId = await getAuthenticatedAccountId(
          context.services.authTokenService,
          context.authToken,
        );

        const playlist = await addTrackToPlaylist(
          context.services.playlistRepository,
          currentAccountId,
          args.playlistId,
          args.trackId,
        );

        return playlist ? toGraphqlPlaylist(playlist) : null;
      },
      removeTrackFromPlaylist: async (
        _parent: unknown,
        args: { playlistId: string; trackId: string },
        context: GraphqlContext,
      ) => {
        const currentAccountId = await getAuthenticatedAccountId(
          context.services.authTokenService,
          context.authToken,
        );

        const playlist = await removeTrackFromPlaylist(
          context.services.playlistRepository,
          currentAccountId,
          args.playlistId,
          args.trackId,
        );

        return playlist ? toGraphqlPlaylist(playlist) : null;
      },
      recordTrackListen: async (
        _parent: unknown,
        args: { trackId: string },
        context: GraphqlContext,
      ) => {
        const currentAccountId = await getAuthenticatedAccountId(
          context.services.authTokenService,
          context.authToken,
        );

        return recordTrackListen(
          context.services.trackLibraryRepository,
          currentAccountId,
          args.trackId,
        );
      },
    },
  },
});
