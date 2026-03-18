import type {
  Account,
  AlbumArtist,
  Album as PrismaAlbum,
  Prisma,
  TrackArtistFeat,
  TrackArtistMain,
} from "@prisma/generated/prisma/client";
import type { Album } from "packages/domain/src/entities/album";
import type { Playlist as PlaylistEntity } from "packages/domain/src/entities/playlist";
import type { PlaylistSummary } from "packages/domain/src/entities/playlist-summary";
import type { ArtistSummary, Track } from "packages/domain/src/entities/track";

const toNullableNumber = (value: bigint | number | null | undefined): number | null => {
  if (value === null || value === undefined) {
    return null;
  }

  return Number(value);
};

const trackAccountLikesArgs = (currentAccountId?: string | null): Prisma.Track$accountLikesArgs => {
  if (!currentAccountId) {
    return { take: 0 };
  }

  return {
    where: { accountId: currentAccountId },
    take: 1,
  };
};

export const trackInclude = (currentAccountId?: string | null) =>
  ({
    album: true,
    mainArtists: {
      include: {
        artist: {
          include: {
            account: true,
          },
        },
      },
    },
    featArtists: {
      include: {
        artist: {
          include: {
            account: true,
          },
        },
      },
    },
    accountLikes: trackAccountLikesArgs(currentAccountId),
    audioFeature: true,
  }) satisfies Prisma.TrackInclude;

export const playlistInclude = (currentAccountId?: string | null) =>
  ({
    playlistAccounts: {
      include: {
        account: true,
      },
    },
    playlistTracks: {
      orderBy: {
        trackId: "asc",
      },
      include: {
        track: {
          include: trackInclude(currentAccountId),
        },
      },
    },
  }) satisfies Prisma.PlaylistInclude;

export const albumInclude = () =>
  ({
    albumArtists: {
      include: {
        artist: {
          include: {
            account: true,
          },
        },
      },
    },
  }) satisfies Prisma.AlbumInclude;

export const playlistSummaryInclude = () =>
  ({
    playlistAccounts: {
      include: {
        account: true,
      },
    },
    _count: {
      select: {
        playlistTracks: true,
      },
    },
  }) satisfies Prisma.PlaylistInclude;

type PrismaTrackWithRelations = Prisma.TrackGetPayload<{
  include: ReturnType<typeof trackInclude>;
}>;

type PrismaAlbumWithRelations = Prisma.AlbumGetPayload<{
  include: ReturnType<typeof albumInclude>;
}>;

type PrismaPlaylistWithRelations = Prisma.PlaylistGetPayload<{
  include: ReturnType<typeof playlistInclude>;
}>;

type PrismaPlaylistSummaryWithRelations = Prisma.PlaylistGetPayload<{
  include: ReturnType<typeof playlistSummaryInclude>;
}>;

type ArtistRelation =
  | (AlbumArtist & {
      artist: {
        artistId: string;
        artistImageFile: string | null;
        account: {
          name: string | null;
          login: string | null;
        };
      };
    })
  | (TrackArtistMain & {
      artist: {
        artistId: string;
        artistImageFile: string | null;
        account: {
          name: string | null;
          login: string | null;
        };
      };
    })
  | (TrackArtistFeat & {
      artist: {
        artistId: string;
        artistImageFile: string | null;
        account: {
          name: string | null;
          login: string | null;
        };
      };
    });

export const toArtistSummary = (artistRelation: ArtistRelation): ArtistSummary => ({
  artistId: artistRelation.artist.artistId,
  name: artistRelation.artist.account.name ?? artistRelation.artist.account.login,
  imageUrl: artistRelation.artist.artistImageFile,
});

export const toAlbumSummary = (album: PrismaAlbum) => ({
  albumId: album.albumId,
  title: album.albumTitle,
  imageUrl: album.albumImageFile,
  type: album.albumType,
});

export const toAlbum = (album: PrismaAlbumWithRelations, isFavorited = false): Album => ({
  albumId: album.albumId,
  title: album.albumTitle,
  imageUrl: album.albumImageFile,
  type: album.albumType,
  dateReleased: album.albumDateReleased,
  tracksCount: album.albumTracksCount,
  listens: toNullableNumber(album.albumListens),
  favorites: toNullableNumber(album.albumFavorites),
  comments: toNullableNumber(album.albumComments),
  producer: album.albumProducer,
  artists: album.albumArtists.map(toArtistSummary),
  isFavorited,
});

export const toTrack = (track: PrismaTrackWithRelations): Track => ({
  trackId: track.trackId,
  title: track.trackTitle,
  imageUrl: track.trackImageFile ?? track.album?.albumImageFile ?? null,
  audioSrc: track.trackFile ?? track.trackUrl ?? null,
  durationSeconds: toNullableNumber(track.trackDuration),
  trackNumber: track.trackNumber,
  discNumber: track.trackDiscNumber,
  isExplicit: track.trackExplicit ?? false,
  isInstrumental: track.trackInstrumental ?? false,
  listens: toNullableNumber(track.trackListens),
  favorites: toNullableNumber(track.trackFavorites),
  comments: toNullableNumber(track.trackComments),
  album: track.album ? toAlbumSummary(track.album) : null,
  mainArtists: track.mainArtists.map(toArtistSummary),
  featArtists: track.featArtists.map(toArtistSummary),
  isLiked: track.accountLikes.length > 0,
  audioFeatures: track.audioFeature || undefined,
});

const toOwnerDisplayName = (account: Account): string | null => {
  return account.pseudo ?? account.name ?? account.login;
};

export const toPlaylist = (
  playlist: PrismaPlaylistWithRelations,
  currentAccountId?: string | null,
): PlaylistEntity => ({
  playlistId: playlist.playlistId,
  name: playlist.playlistName,
  ownerDisplayName: playlist.playlistAccounts[0]?.account
    ? toOwnerDisplayName(playlist.playlistAccounts[0].account)
    : null,
  isEditable: currentAccountId
    ? playlist.playlistAccounts.some(
        (playlistAccount) => playlistAccount.accountId === currentAccountId,
      )
    : false,
  trackCount: playlist.playlistTracks.length,
  tracks: playlist.playlistTracks.map((playlistTrack) => toTrack(playlistTrack.track)),
});

export const toPlaylistSummary = (
  playlist: PrismaPlaylistSummaryWithRelations,
  currentAccountId?: string | null,
): PlaylistSummary => ({
  playlistId: playlist.playlistId,
  name: playlist.playlistName,
  ownerDisplayName: playlist.playlistAccounts[0]?.account
    ? toOwnerDisplayName(playlist.playlistAccounts[0].account)
    : null,
  isEditable: currentAccountId
    ? playlist.playlistAccounts.some(
        (playlistAccount) => playlistAccount.accountId === currentAccountId,
      )
    : false,
  trackCount: playlist._count.playlistTracks,
});
