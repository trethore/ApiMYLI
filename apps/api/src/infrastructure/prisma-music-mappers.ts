import type { Album, Prisma, TrackArtistFeat, TrackArtistMain, User } from "@prisma/generated/prisma/client";
import type { Playlist as PlaylistEntity } from "packages/domain/src/entities/playlist";
import type { ArtistSummary, Track } from "packages/domain/src/entities/track";

const toNullableNumber = (value: bigint | number | null | undefined): number | null => {
  if (value === null || value === undefined) {
    return null;
  }

  return Number(value);
};

const trackUserLikesArgs = (currentAccountId?: string | null): Prisma.Track$userLikesArgs => {
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
    userLikes: trackUserLikesArgs(currentAccountId),
  }) satisfies Prisma.TrackInclude;

export const playlistInclude = (currentAccountId?: string | null) =>
  ({
    playlistUsers: {
      include: {
        user: {
          include: {
            account: true,
          },
        },
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

type PrismaTrackWithRelations = Prisma.TrackGetPayload<{
  include: ReturnType<typeof trackInclude>;
}>;

type PrismaPlaylistWithRelations = Prisma.PlaylistGetPayload<{
  include: ReturnType<typeof playlistInclude>;
}>;

type ArtistRelation =
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

const toArtistSummary = (artistRelation: ArtistRelation): ArtistSummary => ({
  artistId: artistRelation.artist.artistId,
  name: artistRelation.artist.account.name ?? artistRelation.artist.account.login,
  imageUrl: artistRelation.artist.artistImageFile,
});

const toAlbumSummary = (album: Album) => ({
  albumId: album.albumId,
  title: album.albumTitle,
  imageUrl: album.albumImageFile,
  type: album.albumType,
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
  isLiked: track.userLikes.length > 0,
});

const toOwnerDisplayName = (user: User & { account: { name: string | null; login: string | null } }) => {
  return user.pseudo ?? user.account.name ?? user.account.login;
};

export const toPlaylist = (
  playlist: PrismaPlaylistWithRelations,
  currentAccountId?: string | null,
): PlaylistEntity => ({
  playlistId: playlist.playlistId,
  name: playlist.playlistName,
  ownerDisplayName: playlist.playlistUsers[0]?.user
    ? toOwnerDisplayName(playlist.playlistUsers[0].user)
    : null,
  isEditable: currentAccountId
    ? playlist.playlistUsers.some((playlistUser) => playlistUser.accountId === currentAccountId)
    : false,
  trackCount: playlist.playlistTracks.length,
  tracks: playlist.playlistTracks.map((playlistTrack) => toTrack(playlistTrack.track)),
});
