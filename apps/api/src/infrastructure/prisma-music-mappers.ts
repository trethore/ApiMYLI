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
import type { Blindtest as BlindtestEntity } from "packages/domain/src/entities/blindtest";
import type { PlaylistSummary } from "packages/domain/src/entities/playlist-summary";
import type { ArtistSummary, Track } from "packages/domain/src/entities/track";
import { Genre } from "packages/domain/src/entities/genre";
import { Artist } from "packages/domain/src/entities/artist";
import { parseImages } from "./prisma-artist-catalog-repository";

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

export const genreInclude = (currentAccountId?: string | null) =>
  ({
    parent: true,
    children: true,
  }) satisfies Prisma.GenreInclude;

export const artistInclude = (currentAccountId?: string | null) =>
  ({
    account: true,
    artistTags: {
      include: {
        tag: true
      }
    },
    mainTracks: true,
    albumArtists: true,
  }) satisfies Prisma.ArtistInclude;


export const blindtestInclude = (currentAccountId?: string | null) =>
  ({
    accountBlindtests: {
      include: {
        account: true,
      },
    },
    blindtestTracks: {
      orderBy: {
        trackId: "asc",
      },
      include: {
        track: {
          include: trackInclude(currentAccountId),
        },
      },
    },
    blindtestCompulsoryTracks: {
      orderBy: {
        trackId: "asc",
      },
      include: {
        track: {
          include: trackInclude(currentAccountId),
        },
      },
    },
    blindtestGenres: {
      include: {
        genre: {
          include: {
            parent: true,
            children: true,
          }
        },
      },
    },
    artistBlindtests: {
      include: {
        artist: {
          include: {
            mainTracks: true,
            albumArtists: true,
            account: true,
            artistTags: {
              include: {
                tag: true,
              }
            },
          }
        },
      },
    },
  }) satisfies Prisma.BlindtestInclude;

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

type PrismaGenreWithRelations = Prisma.GenreGetPayload<{
  include: ReturnType<typeof genreInclude>
}>;

type PrismaArtistWithRelations = Prisma.ArtistGetPayload<{
  include: ReturnType<typeof artistInclude>
}>;

type PrismaAlbumWithRelations = Prisma.AlbumGetPayload<{
  include: ReturnType<typeof albumInclude>;
}>;

type PrismaPlaylistWithRelations = Prisma.PlaylistGetPayload<{
  include: ReturnType<typeof playlistInclude>;
}>;

type PrismaBlindtestWithRelations = Prisma.BlindtestGetPayload<{
  include: ReturnType<typeof blindtestInclude>;
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

export const toArtist = (
  artist: PrismaArtistWithRelations
): Artist => {
  return {
    artistId: artist.artistId,
    name: artist.account.name,
    imageUrl: artist.artistImageFile,
    images: parseImages(artist.artistImages),
    bio: artist.artistBio,
    members: artist.artistMembers,
    location: artist.artistLocation,
    latitude: artist.artistLatitude,
    longitude: artist.artistLongitude,
    activeYearBegin: artist.artistActiveYearBegin,
    activeYearEnd: artist.artistActiveYearEnd,
    favorites: toNullableNumber(artist.artistFavorites),
    comments: toNullableNumber(artist.artistComments),
    tags: artist.artistTags
      .map((artistTag) => artistTag.tag.tagName)
      .filter((tagName): tagName is string => Boolean(tagName))
      .sort((leftTag, rightTag) => leftTag.localeCompare(rightTag)),
    albumCount: null,
    trackCount: null,
  };
};

export const toAlbumSummary = (album: PrismaAlbum) => ({
  albumId: album.albumId,
  title: album.albumTitle,
  imageUrl: album.albumImageFile,
  type: album.albumType,
});

export const toAlbum = (album: PrismaAlbumWithRelations): Album => ({
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

export const toGenre = (genre: PrismaGenreWithRelations): Genre => ({
  genreId: genre.genreId,
  parentId: genre.parentId,
  title: genre.title,
  topLevel: genre.topLevel,
  tracksCount: genre.tracksCount,
  parent: genre.parent,
  children: genre.children,
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

export const toBlindtest = (
  blindtest: PrismaBlindtestWithRelations,
  currentAccountId?: string | null,
): BlindtestEntity => ({
  blindtestId: blindtest.blindtestId,
  name: blindtest.blindtestName,
  isEditable: currentAccountId
    ? blindtest.accountBlindtests.some(
      (account) => account.accountId === currentAccountId
    )
    : false,
  trackCount: blindtest.blindtestTracks.length,
  tracks: blindtest.blindtestTracks.map((blindtestTrack) => toTrack(blindtestTrack.track)),
  compulsoryTracks: blindtest.blindtestCompulsoryTracks.map((track) => toTrack(track.track)),
  genres: blindtest.blindtestGenres.map((genre) => toGenre(genre.genre)),
  artists: blindtest.artistBlindtests.map((artist) => toArtist(artist.artist)),
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
