import { createSchema } from "graphql-yoga";
import { getArtistById } from "packages/application/src/use-cases/artist/get-artist-by-id";
import { listArtistAlbums } from "packages/application/src/use-cases/artist/list-artist-albums";
import { createPlaylist } from "packages/application/src/use-cases/playlist/create-playlist";
import { deletePlaylist } from "packages/application/src/use-cases/playlist/delete-playlist";
import { getPlaylistById } from "packages/application/src/use-cases/playlist/get-playlist-by-id";
import { listMyPlaylists } from "packages/application/src/use-cases/playlist/list-my-playlists";
import { updatePlaylist } from "packages/application/src/use-cases/playlist/update-playlist";
import { addTrackToPlaylist } from "packages/application/src/use-cases/playlist/add-track-to-playlist";
import { removeTrackFromPlaylist } from "packages/application/src/use-cases/playlist/remove-track-from-playlist";
import { listPinnedItems } from "packages/application/src/use-cases/pin/list-pinned-items";
import { pinAlbum } from "packages/application/src/use-cases/pin/pin-album";
import { pinArtist } from "packages/application/src/use-cases/pin/pin-artist";
import { pinPlaylist } from "packages/application/src/use-cases/pin/pin-playlist";
import { pinTrack } from "packages/application/src/use-cases/pin/pin-track";
import { unpinItem } from "packages/application/src/use-cases/pin/unpin-item";
import { createAccount } from "packages/application/src/use-cases/account/create-account";
import { deleteAccount } from "packages/application/src/use-cases/account/delete-account";
import { getAccountById } from "packages/application/src/use-cases/account/get-account-by-id";
import { getAuthenticatedAccountId } from "packages/application/src/use-cases/account/get-authenticated-account-id";
import { loginAccount } from "packages/application/src/use-cases/account/login-account";
import { logoutAccount } from "packages/application/src/use-cases/account/logout-account";
import { updateAccount } from "packages/application/src/use-cases/account/update-account";
import { updateArtistProfile } from "packages/application/src/use-cases/account/update-artist-profile";
import { dislikeTrack } from "packages/application/src/use-cases/track/dislike-track";
import { getTrackById } from "packages/application/src/use-cases/track/get-track-by-id";
import { likeTrack } from "packages/application/src/use-cases/track/like-track";
import { listArtistTopTracks } from "packages/application/src/use-cases/track/list-artist-top-tracks";
import { listLikedTracks } from "packages/application/src/use-cases/track/list-liked-tracks";
import { listDislikedTracks } from "packages/application/src/use-cases/track/list-disliked-tracks";
import { listTrackListenHistory } from "packages/application/src/use-cases/track/list-track-listen-history";
import { listTracksByAlbum } from "packages/application/src/use-cases/track/list-tracks-by-album";
import { recordTrackListen } from "packages/application/src/use-cases/track/record-track-listen";
import { undislikeTrack } from "packages/application/src/use-cases/track/undislike-track";
import { unlikeTrack } from "packages/application/src/use-cases/track/unlike-track";
import { searchGlobal } from "packages/application/src/use-cases/search/search-global";
import { createGetRecommendations } from "packages/application/src/use-cases/recommendation/get-recommendations";
import type { AuthTokenServicePort } from "packages/application/src/ports/security/auth-token-service-port";
import type { PasswordHasherPort } from "packages/application/src/ports/security/password-hasher-port";
import type { Album } from "packages/domain/src/entities/album";
import type { Account } from "packages/domain/src/entities/account";
import type { Artist as ArtistEntity } from "packages/domain/src/entities/artist";
import type { ArtistProfile } from "packages/domain/src/entities/artist-profile";
import type { Playlist } from "packages/domain/src/entities/playlist";
import type { PlaylistSummary } from "packages/domain/src/entities/playlist-summary";
import type { PinnedItem } from "packages/domain/src/entities/pinned-item";
import type { TrackListenHistoryItem } from "packages/domain/src/entities/track-listen-history-item";
import type { AlbumSummary, ArtistSummary, Track } from "packages/domain/src/entities/track";
import type { ArtistCatalogRepository } from "packages/domain/src/repositories/artist-catalog-repository";
import type { PlaylistRepository } from "packages/domain/src/repositories/playlist-repository";
import type { AccountRepository } from "packages/domain/src/repositories/account-repository";
import type { PinnedItemRepository } from "packages/domain/src/repositories/pinned-item-repository";
import type { TrackCatalogRepository } from "packages/domain/src/repositories/track-catalog-repository";
import type { TrackLibraryRepository } from "packages/domain/src/repositories/track-library-repository";

type GraphqlArtist = {
  artistId: string;
  name: string | null;
  imageUrl: string | null;
  imageUrls: string[];
  artistBio?: string | null;
  artistMembers?: string | null;
  artistLocation?: string | null;
  artistLatitude?: number | null;
  artistLongitude?: number | null;
  artistActiveYearBegin?: number | null;
  artistActiveYearEnd?: number | null;
  artistFavorites?: number | null;
  artistComments?: number | null;
  tags: string[];
  albumCount: number | null;
  trackCount: number | null;
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

type GraphqlAlbum = {
  albumId: string;
  title: string | null;
  imageUrl: string | null;
  type: string | null;
  dateReleased: string | null;
  tracksCount: number | null;
  listens: number | null;
  favorites: number | null;
  comments: number | null;
  producer: string | null;
  artists: GraphqlArtistSummary[];
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
  isDisliked: boolean;
};

type GraphqlPlaylist = {
  playlistId: string;
  name: string | null;
  ownerDisplayName: string | null;
  isEditable: boolean;
  trackCount: number;
  tracks: GraphqlTrack[];
};

type GraphqlPlaylistSummary = {
  playlistId: string;
  name: string | null;
  ownerDisplayName: string | null;
  isEditable: boolean;
  trackCount: number;
};

type GraphqlPinnedItem = {
  slot: number;
  itemType: string;
  pinnedAt: string;
  track: GraphqlTrack | null;
  album: GraphqlAlbum | null;
  artist: GraphqlArtistSummary | null;
  playlist: GraphqlPlaylistSummary | null;
};

type GraphqlTrackListenHistoryItem = {
  listenHistoryItemId: string;
  listenedAt: string;
  track: GraphqlTrack;
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
  artistCatalogRepository: ArtistCatalogRepository;
  pinnedItemRepository: PinnedItemRepository;
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

const toGraphqlArtistProfile = (account: Account, artist: ArtistProfile): GraphqlArtist => ({
  artistId: artist.artistId,
  name: account.name ?? account.login ?? null,
  imageUrl: null,
  imageUrls: [],
  artistBio: artist.artistBio,
  artistMembers: null,
  artistLocation: artist.artistLocation,
  artistLatitude: artist.artistLatitude,
  artistLongitude: artist.artistLongitude,
  artistActiveYearBegin: artist.artistActiveYearBegin,
  artistActiveYearEnd: artist.artistActiveYearEnd,
  artistFavorites: artist.artistFavorites,
  artistComments: artist.artistComments,
  tags: [],
  albumCount: null,
  trackCount: null,
});

const toGraphqlArtist = (artist: ArtistEntity): GraphqlArtist => ({
  artistId: artist.artistId,
  name: artist.name,
  imageUrl: artist.imageUrl,
  imageUrls: artist.images,
  artistBio: artist.bio,
  artistMembers: artist.members,
  artistLocation: artist.location,
  artistLatitude: artist.latitude,
  artistLongitude: artist.longitude,
  artistActiveYearBegin: artist.activeYearBegin,
  artistActiveYearEnd: artist.activeYearEnd,
  artistFavorites: artist.favorites,
  artistComments: artist.comments,
  tags: artist.tags,
  albumCount: artist.albumCount,
  trackCount: artist.trackCount,
});

const toGraphqlAccount = (account: Account): GraphqlAccount => ({
  accountId: account.accountId,
  login: account.login ?? null,
  email: account.email ?? null,
  name: account.name ?? null,
  isArtist: account.isArtist,
  artist: account.artist ? toGraphqlArtistProfile(account, account.artist) : null,
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

const toGraphqlAlbum = (album: Album): GraphqlAlbum => ({
  albumId: album.albumId,
  title: album.title,
  imageUrl: album.imageUrl,
  type: album.type,
  dateReleased: album.dateReleased ? album.dateReleased.toISOString() : null,
  tracksCount: album.tracksCount,
  listens: album.listens,
  favorites: album.favorites,
  comments: album.comments,
  producer: album.producer,
  artists: album.artists.map(toGraphqlArtistSummary),
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
  isDisliked: track.isDisliked,
});

const toGraphqlPlaylist = (playlist: Playlist): GraphqlPlaylist => ({
  playlistId: playlist.playlistId,
  name: playlist.name,
  ownerDisplayName: playlist.ownerDisplayName,
  isEditable: playlist.isEditable,
  trackCount: playlist.trackCount,
  tracks: playlist.tracks.map(toGraphqlTrack),
});

const toGraphqlPlaylistSummary = (playlist: PlaylistSummary): GraphqlPlaylistSummary => ({
  playlistId: playlist.playlistId,
  name: playlist.name,
  ownerDisplayName: playlist.ownerDisplayName,
  isEditable: playlist.isEditable,
  trackCount: playlist.trackCount,
});

const toGraphqlPinnedItem = (pinnedItem: PinnedItem): GraphqlPinnedItem => ({
  slot: pinnedItem.slot,
  itemType: pinnedItem.itemType,
  pinnedAt: pinnedItem.pinnedAt.toISOString(),
  track: pinnedItem.track ? toGraphqlTrack(pinnedItem.track) : null,
  album: pinnedItem.album ? toGraphqlAlbum(pinnedItem.album) : null,
  artist: pinnedItem.artist ? toGraphqlArtistSummary(pinnedItem.artist) : null,
  playlist: pinnedItem.playlist ? toGraphqlPlaylistSummary(pinnedItem.playlist) : null,
});

const toGraphqlTrackListenHistoryItem = (
  historyItem: TrackListenHistoryItem,
): GraphqlTrackListenHistoryItem => ({
  listenHistoryItemId: historyItem.listenHistoryItemId,
  listenedAt: historyItem.listenedAt.toISOString(),
  track: toGraphqlTrack(historyItem.track),
});

const getOptionalAuthenticatedAccountId = async (
  context: GraphqlContext,
): Promise<string | null> => {
  if (!context.authToken) {
    return null;
  }

  return context.services.authTokenService.verify(context.authToken);
};

const resolveTrackLibraryMutation = async (
  context: GraphqlContext,
  trackId: string,
  action: (
    repository: TrackLibraryRepository,
    accountId: string,
    targetTrackId: string,
  ) => Promise<Track | null>,
): Promise<GraphqlTrack | null> => {
  const currentAccountId = await getAuthenticatedAccountId(
    context.services.authTokenService,
    context.authToken,
  );

  const track = await action(context.services.trackLibraryRepository, currentAccountId, trackId);

  return track ? toGraphqlTrack(track) : null;
};

export const schema = createSchema({
  typeDefs: /* GraphQL */ `
    type Artist {
      artistId: ID!
      name: String
      imageUrl: String
      imageUrls: [String!]!
      artistBio: String
      artistMembers: String
      artistLocation: String
      artistLatitude: Float
      artistLongitude: Float
      artistActiveYearBegin: Int
      artistActiveYearEnd: Int
      artistFavorites: Float
      artistComments: Float
      tags: [String!]!
      albumCount: Int
      trackCount: Int
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

    type Album {
      albumId: ID!
      title: String
      imageUrl: String
      type: String
      dateReleased: String
      tracksCount: Int
      listens: Float
      favorites: Float
      comments: Float
      producer: String
      artists: [ArtistSummary!]!
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
      isDisliked: Boolean!
    }

    type Playlist {
      playlistId: ID!
      name: String
      ownerDisplayName: String
      isEditable: Boolean!
      trackCount: Int!
      tracks: [Track!]!
    }

    type PlaylistSummary {
      playlistId: ID!
      name: String
      ownerDisplayName: String
      isEditable: Boolean!
      trackCount: Int!
    }

    enum PinnedItemType {
      TRACK
      ALBUM
      ARTIST
      PLAYLIST
    }

    type PinnedItem {
      slot: Int!
      itemType: PinnedItemType!
      pinnedAt: String!
      track: Track
      album: Album
      artist: ArtistSummary
      playlist: PlaylistSummary
    }

    type TrackListenHistoryItem {
      listenHistoryItemId: ID!
      listenedAt: String!
      track: Track!
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
      artist(artistId: String!): Artist
      artistAlbums(artistId: String!): [Album!]!
      track(trackId: String!): Track
      albumTracks(albumId: String!): [Track!]!
      artistTopTracks(artistId: String!, limit: Int): [Track!]!
      likedTracks: [Track!]!
      dislikedTracks: [Track!]!
      myTrackHistory(limit: Int): [TrackListenHistoryItem!]!
      playlist(playlistId: String!): Playlist
      myPlaylists: [Playlist!]!
      myPinnedItems: [PinnedItem!]!
      search(query: String!, limit: Int): SearchResults!
      recommendations(
        seedTrackIds: [String!]!
        blacklistedTrackIds: [String!]!
        limit: Int!
        randomness: Int!
      ): [Track!]!
    }

    type SearchResults {
      tracks: [Track!]!
      albums: [Album!]!
      artists: [Artist!]!
      playlists: [Playlist!]!
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
      dislikeTrack(trackId: String!): Track
      undislikeTrack(trackId: String!): Track
      pinTrack(slot: Int!, trackId: String!): PinnedItem
      pinAlbum(slot: Int!, albumId: String!): PinnedItem
      pinArtist(slot: Int!, artistId: String!): PinnedItem
      pinPlaylist(slot: Int!, playlistId: String!): PinnedItem
      unpinItem(slot: Int!): Boolean!
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
      artist: async (_parent: unknown, args: { artistId: string }, context: GraphqlContext) => {
        const artist = await getArtistById(context.services.artistCatalogRepository, args.artistId);

        return artist ? toGraphqlArtist(artist) : null;
      },
      artistAlbums: async (
        _parent: unknown,
        args: { artistId: string },
        context: GraphqlContext,
      ) => {
        const albums = await listArtistAlbums(
          context.services.artistCatalogRepository,
          args.artistId,
        );

        return albums.map(toGraphqlAlbum);
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

        const tracks = await listLikedTracks(
          context.services.trackLibraryRepository,
          currentAccountId,
        );

        return tracks.map(toGraphqlTrack);
      },
      dislikedTracks: async (_parent: unknown, _args: unknown, context: GraphqlContext) => {
        const currentAccountId = await getAuthenticatedAccountId(
          context.services.authTokenService,
          context.authToken,
        );

        const tracks = await listDislikedTracks(
          context.services.trackLibraryRepository,
          currentAccountId,
        );

        return tracks.map(toGraphqlTrack);
      },
      myTrackHistory: async (
        _parent: unknown,
        args: { limit?: number | null },
        context: GraphqlContext,
      ) => {
        const currentAccountId = await getAuthenticatedAccountId(
          context.services.authTokenService,
          context.authToken,
        );

        const historyItems = await listTrackListenHistory(
          context.services.trackLibraryRepository,
          currentAccountId,
          args.limit ?? undefined,
        );

        return historyItems.map(toGraphqlTrackListenHistoryItem);
      },
      playlist: async (_parent: unknown, args: { playlistId: string }, context: GraphqlContext) => {
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

        const playlists = await listMyPlaylists(
          context.services.playlistRepository,
          currentAccountId,
        );

        return playlists.map(toGraphqlPlaylist);
      },
      myPinnedItems: async (_parent: unknown, _args: unknown, context: GraphqlContext) => {
        const currentAccountId = await getAuthenticatedAccountId(
          context.services.authTokenService,
          context.authToken,
        );

        const pinnedItems = await listPinnedItems(
          context.services.pinnedItemRepository,
          currentAccountId,
        );

        return pinnedItems.map(toGraphqlPinnedItem);
      },
      search: async (
        _parent: unknown,
        args: { query: string; limit?: number | null },
        context: GraphqlContext,
      ) => {
        const currentAccountId = await getOptionalAuthenticatedAccountId(context);
        const limit = args.limit && args.limit > 0 ? args.limit : 10;

        const results = await searchGlobal(
          context.services.artistCatalogRepository,
          context.services.trackCatalogRepository,
          context.services.playlistRepository,
          args.query,
          limit,
          currentAccountId,
        );

        return {
          tracks: results.tracks.map(toGraphqlTrack),
          albums: results.albums.map(toGraphqlAlbum),
          artists: results.artists.map(toGraphqlArtist),
          playlists: results.playlists.map(toGraphqlPlaylist),
        };
      },
      recommendations: async (
        _parent: unknown,
        args: {
          seedTrackIds: string[];
          blacklistedTrackIds: string[];
          limit: number;
          randomness: number;
        },
        context: GraphqlContext,
      ) => {
        const currentAccountId = await getOptionalAuthenticatedAccountId(context);
        const getRecommendations = createGetRecommendations(
          context.services.trackCatalogRepository,
        );

        const recommendedTracks = await getRecommendations({
          seedTrackIds: args.seedTrackIds,
          blacklistedTrackIds: args.blacklistedTrackIds,
          limit: args.limit,
          randomness: args.randomness,
          currentAccountId,
        });

        return recommendedTracks.map(toGraphqlTrack);
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

        if (!artist) {
          return null;
        }

        const account = await context.services.accountRepository.findById(args.accountId);

        return account ? toGraphqlArtistProfile(account, artist) : null;
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
      likeTrack: async (_parent: unknown, args: { trackId: string }, context: GraphqlContext) =>
        resolveTrackLibraryMutation(context, args.trackId, likeTrack),
      unlikeTrack: async (_parent: unknown, args: { trackId: string }, context: GraphqlContext) =>
        resolveTrackLibraryMutation(context, args.trackId, unlikeTrack),
      dislikeTrack: async (_parent: unknown, args: { trackId: string }, context: GraphqlContext) =>
        resolveTrackLibraryMutation(context, args.trackId, dislikeTrack),
      undislikeTrack: async (
        _parent: unknown,
        args: { trackId: string },
        context: GraphqlContext,
      ) => resolveTrackLibraryMutation(context, args.trackId, undislikeTrack),
      pinTrack: async (
        _parent: unknown,
        args: { slot: number; trackId: string },
        context: GraphqlContext,
      ) => {
        const currentAccountId = await getAuthenticatedAccountId(
          context.services.authTokenService,
          context.authToken,
        );

        const pinnedItem = await pinTrack(
          context.services.pinnedItemRepository,
          currentAccountId,
          args.slot,
          args.trackId,
        );

        return pinnedItem ? toGraphqlPinnedItem(pinnedItem) : null;
      },
      pinAlbum: async (
        _parent: unknown,
        args: { slot: number; albumId: string },
        context: GraphqlContext,
      ) => {
        const currentAccountId = await getAuthenticatedAccountId(
          context.services.authTokenService,
          context.authToken,
        );

        const pinnedItem = await pinAlbum(
          context.services.pinnedItemRepository,
          currentAccountId,
          args.slot,
          args.albumId,
        );

        return pinnedItem ? toGraphqlPinnedItem(pinnedItem) : null;
      },
      pinArtist: async (
        _parent: unknown,
        args: { slot: number; artistId: string },
        context: GraphqlContext,
      ) => {
        const currentAccountId = await getAuthenticatedAccountId(
          context.services.authTokenService,
          context.authToken,
        );

        const pinnedItem = await pinArtist(
          context.services.pinnedItemRepository,
          currentAccountId,
          args.slot,
          args.artistId,
        );

        return pinnedItem ? toGraphqlPinnedItem(pinnedItem) : null;
      },
      pinPlaylist: async (
        _parent: unknown,
        args: { slot: number; playlistId: string },
        context: GraphqlContext,
      ) => {
        const currentAccountId = await getAuthenticatedAccountId(
          context.services.authTokenService,
          context.authToken,
        );

        const pinnedItem = await pinPlaylist(
          context.services.pinnedItemRepository,
          currentAccountId,
          args.slot,
          args.playlistId,
        );

        return pinnedItem ? toGraphqlPinnedItem(pinnedItem) : null;
      },
      unpinItem: async (_parent: unknown, args: { slot: number }, context: GraphqlContext) => {
        const currentAccountId = await getAuthenticatedAccountId(
          context.services.authTokenService,
          context.authToken,
        );

        return unpinItem(context.services.pinnedItemRepository, currentAccountId, args.slot);
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
