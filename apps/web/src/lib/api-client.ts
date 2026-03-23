import { Music } from "@/types/music";

const API_URL = "http://localhost:4000/graphql";

type GraphqlResponse<T> = {
  data?: T;
  errors?: { message: string }[];
};

async function gql<T>(
  query: string,
  variables: Record<string, unknown> = {},
  token?: string | null,
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(API_URL, {
    method: "POST",
    headers,
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Erreur API (${response.status}): ${text || response.statusText}`);
  }

  let json: GraphqlResponse<T>;
  try {
    json = await response.json();
  } catch {
    throw new Error("L'API n'a pas renvoyé de JSON valide");
  }

  if (json.errors && json.errors.length > 0) {
    const errorMsg = json.errors[0].message;
    console.error("GraphQL Errors:", json.errors, "in query:", query.substring(0, 100)); // Log part of the query
    throw new Error(`${errorMsg} (Query: ${query.trim().split('{')[0].trim()})`);
  }

  if (!json.data) {
    throw new Error(`Aucune donnée reçue de l'API (Query: ${query.trim().split('{')[0].trim()})`);
  }

  return json.data;
}

// --- Types ---

export type ApiAccount = {
  accountId: string;
  login: string | null;
  email: string | null;
  role: string | null;
  name: string | null;
  isArtist: boolean;
};

export type AuthPayload = {
  token: string;
  account: ApiAccount;
};

export type ApiArtistSummary = {
  artistId: string;
  name: string | null;
  imageUrl: string | null;
};

export type ApiAlbumSummary = {
  albumId: string;
  title: string | null;
  imageUrl: string | null;
  type: string | null;
  artists?: { name: string }[];
};

export type ApiTrack = {
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
  album: ApiAlbumSummary | null;
  mainArtists: ApiArtistSummary[];
  featArtists: ApiArtistSummary[];
  isLiked: boolean;
};

export type ApiPlaylistSummary = {
  playlistId: string;
  name: string | null;
  ownerDisplayName: string | null;
  isEditable: boolean;
  trackCount: number;
};

export type ApiPlaylist = ApiPlaylistSummary & {
  tracks: ApiTrack[];
};

export type ApiAlbum = ApiAlbumSummary & {
  dateReleased: string | null;
  tracksCount: number | null;
  listens: number | null;
  favorites: number | null;
  comments: number | null;
  producer: string | null;
  artists: ApiArtistSummary[];
};

export type ApiPinnedItem = {
  slot: number;
  itemType: "TRACK" | "ALBUM" | "ARTIST" | "PLAYLIST" | "BLINDTEST";
  pinnedAt: string;
  track: ApiTrack | null;
  album: ApiAlbum | null;
  artist: ApiArtistSummary | null;
  playlist: ApiPlaylistSummary | null;
};

export type ApiTrackListenHistoryItem = {
  listenHistoryItemId: string;
  listenedAt: string;
  track: ApiTrack;
};

export type ApiArtist = {
  artistId: string;
  name: string | null;
  imageUrl: string | null;
  artistBio: string | null;
  artistLocation: string | null;
  artistLatitude: number | null;
  artistLongitude: number | null;
  artistActiveYearBegin: number | null;
  artistActiveYearEnd: number | null;
  artistFavorites: number | null;
  artistComments: number | null;
};

// --- Formatters ---
export function formatAudioUrl(url?: string | null): string {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `https://files.freemusicarchive.org/storage-freemusicarchive-org/${url}`;
}

export function formatImageUrl(url?: string | null): string {
  if (!url) return "/placeholder-music.jpg";
  if (url.startsWith("http")) return url;
  if (url.length > 34) {
    return `https://files.freemusicarchive.org/storage-freemusicarchive-org/${url.slice(34)}`;
  }
  return `https://files.freemusicarchive.org/storage-freemusicarchive-org/${url}`;
}

export function toMusic(apiTrack: ApiTrack): Music {
  const mins = Math.floor((apiTrack.durationSeconds || 0) / 60);
  const secs = (apiTrack.durationSeconds || 0) % 60;
  const duration = `${mins}:${secs.toString().padStart(2, '0')}`;
  
  return {
    id: apiTrack.trackId,
    title: apiTrack.title || "Unknown",
    artist: apiTrack.mainArtists.map(a => a.name || "Unknown"),
    artistIds: apiTrack.mainArtists.map(a => a.artistId),
    album: apiTrack.album?.title || "Unknown Album",
    albumId: apiTrack.album?.albumId,
    image: formatImageUrl(apiTrack.imageUrl),
    duration,
    isLiked: apiTrack.isLiked,
    audioSrc: formatAudioUrl(apiTrack.audioSrc),
  };
}

// --- Mutations & Queries ---

export async function loginMutation(
  email: string,
  password: string,
): Promise<AuthPayload> {
  const query = /* GraphQL */ `
    mutation Login($input: LoginInput!) {
      login(input: $input) {
        token
        account {
          accountId
          login
          role
          email
          name
          isArtist
        }
      }
    }
  `;

  const data = await gql<{ login: AuthPayload | null }>(query, {
    input: { email, password },
  });

  if (!data.login) {
    throw new Error("Email ou mot de passe incorrect");
  }

  return data.login;
}

export async function registerMutation(
  login: string,
  email: string,
  password: string,
  name: string,
): Promise<ApiAccount> {
  const query = /* GraphQL */ `
    mutation CreateAccount($input: CreateAccountInput!) {
      createAccount(input: $input) {
        accountId
        login
        email
        name
        isArtist
      }
    }
  `;

  const data = await gql<{ createAccount: ApiAccount }>(query, {
    input: { login, email, password, name, isArtist: false },
  });

  return data.createAccount;
}

export async function logoutMutation(token: string): Promise<boolean> {
  const query = /* GraphQL */ `
    mutation Logout {
      logout
    }
  `;

  try {
    const data = await gql<{ logout: boolean }>(query, {}, token);
    return data.logout;
  } catch {
    // Best-effort — on considère que c'est OK côté client
    return true;
  }
}

export async function getAccountQuery(
  accountId: string,
  token: string,
): Promise<ApiAccount | null> {
  const query = /* GraphQL */ `
    query GetAccount($accountId: String!) {
      account(accountId: $accountId) {
        accountId
        login
        email
        role
        name
        isArtist
      }
    }
  `;

  const data = await gql<{ account: ApiAccount | null }>(
    query,
    { accountId },
    token,
  );

  return data.account;
}

export async function updateAccountMutation(
  accountId: string,
  input: {
    login?: string;
    email?: string;
    role?: string;
    password?: string;
    name?: string;
  },
  token: string,
): Promise<ApiAccount | null> {
  const query = /* GraphQL */ `
    mutation UpdateAccount($accountId: String!, $input: UpdateAccountInput!) {
      updateAccount(accountId: $accountId, input: $input) {
        accountId
        login
        email
        role
        name
        isArtist
      }
    }
  `;

  const data = await gql<{ updateAccount: ApiAccount | null }>(
    query,
    { accountId, input },
    token,
  );

  return data.updateAccount;
}

export async function deleteAccountMutation(
  accountId: string,
  token: string,
): Promise<boolean> {
  const query = /* GraphQL */ `
    mutation DeleteAccount($accountId: String!) {
      deleteAccount(accountId: $accountId)
    }
  `;

  const data = await gql<{ deleteAccount: boolean }>(
    query,
    { accountId },
    token,
  );

  return data.deleteAccount;
}

const TRACK_FRAGMENT = /* GraphQL */ `
  fragment TrackDetails on Track {
    trackId
    title
    imageUrl
    audioSrc
    durationSeconds
    trackNumber
    discNumber
    isExplicit
    isInstrumental
    listens
    favorites
    comments
    isLiked
    album {
      albumId
      title
      imageUrl
      type
    }
    mainArtists {
      artistId
      name
      imageUrl
    }
    featArtists {
      artistId
      name
      imageUrl
    }
  }
`;

const PLAYLIST_SUMMARY_FRAGMENT = /* GraphQL */ `
  fragment PlaylistSummary on Playlist {
    playlistId
    name
    ownerDisplayName
    isEditable
    trackCount
  }
`;

const PLAYLIST_FRAGMENT = /* GraphQL */ `
  fragment PlaylistDetails on Playlist {
    ...PlaylistSummary
    tracks {
      ...TrackDetails
    }
  }
  ${PLAYLIST_SUMMARY_FRAGMENT}
  ${TRACK_FRAGMENT}
`;

export async function getTrackQuery(trackId: string, token?: string | null): Promise<ApiTrack | null> {
  const query = /* GraphQL */ `
    query GetTrack($trackId: String!) {
      track(trackId: $trackId) {
        ...TrackDetails
      }
    }
    ${TRACK_FRAGMENT}
  `;
  const data = await gql<{ track: ApiTrack | null }>(query, { trackId }, token);
  return data.track;
}

export async function getAlbumTracksQuery(albumId: string, token?: string | null): Promise<ApiTrack[]> {
  const query = /* GraphQL */ `
    query GetAlbumTracks($albumId: String!) {
      albumTracks(albumId: $albumId) {
        ...TrackDetails
      }
    }
    ${TRACK_FRAGMENT}
  `;
  const data = await gql<{ albumTracks: ApiTrack[] }>(query, { albumId }, token);
  return data.albumTracks;
}

export async function getArtistTopTracksQuery(artistId: string, limit?: number, token?: string | null): Promise<ApiTrack[]> {
  const query = /* GraphQL */ `
    query GetArtistTopTracks($artistId: String!, $limit: Int) {
      artistTopTracks(artistId: $artistId, limit: $limit) {
        ...TrackDetails
      }
    }
    ${TRACK_FRAGMENT}
  `;
  const data = await gql<{ artistTopTracks: ApiTrack[] }>(query, { artistId, limit }, token);
  return data.artistTopTracks;
}

export async function getArtistQuery(artistId: string, token?: string | null): Promise<ApiArtist | null> {
  const query = /* GraphQL */ `
    query GetArtist($artistId: String!) {
      artist(artistId: $artistId) {
        artistId
        name
        imageUrl
        artistBio
        artistLocation
        artistLatitude
        artistLongitude
        artistActiveYearBegin
        artistActiveYearEnd
        artistFavorites
        artistComments
      }
    }
  `;
  const data = await gql<{ artist: ApiArtist | null }>(query, { artistId }, token);
  return data.artist;
}

export async function getLikedTracksQuery(token: string): Promise<ApiTrack[]> {
  const query = /* GraphQL */ `
    query GetLikedTracks {
      likedTracks {
        ...TrackDetails
      }
    }
    ${TRACK_FRAGMENT}
  `;
  const data = await gql<{ likedTracks: ApiTrack[] }>(query, {}, token);
  return data.likedTracks;
}



export async function getPlaylistQuery(playlistId: string, token?: string | null): Promise<ApiPlaylist | null> {
  const query = /* GraphQL */ `
    query GetPlaylist($playlistId: String!) {
      playlist(playlistId: $playlistId) {
        ...PlaylistDetails
      }
    }
    ${PLAYLIST_FRAGMENT}
  `;
  const data = await gql<{ playlist: ApiPlaylist | null }>(query, { playlistId }, token);
  return data.playlist;
}

export async function getMyPlaylistsQuery(token: string): Promise<ApiPlaylist[]> {
  const query = /* GraphQL */ `
    query GetMyPlaylists {
      myPlaylists {
        playlistId
        name
        ownerDisplayName
        isEditable
        trackCount
      }
    }
  `;
  const data = await gql<{ myPlaylists: ApiPlaylist[] }>(query, {}, token);
  return data.myPlaylists;
}

export async function likeTrackMutation(trackId: string, token: string): Promise<ApiTrack | null> {
  const query = /* GraphQL */ `
    mutation LikeTrack($trackId: String!) {
      likeTrack(trackId: $trackId) {
        ...TrackDetails
      }
    }
    ${TRACK_FRAGMENT}
  `;
  const data = await gql<{ likeTrack: ApiTrack | null }>(query, { trackId }, token);
  return data.likeTrack;
}

export async function unlikeTrackMutation(trackId: string, token: string): Promise<ApiTrack | null> {
  const query = /* GraphQL */ `
    mutation UnlikeTrack($trackId: String!) {
      unlikeTrack(trackId: $trackId) {
        ...TrackDetails
      }
    }
    ${TRACK_FRAGMENT}
  `;
  const data = await gql<{ unlikeTrack: ApiTrack | null }>(query, { trackId }, token);
  return data.unlikeTrack;
}

export async function createPlaylistMutation(name: string, token: string): Promise<ApiPlaylist> {
  const query = /* GraphQL */ `
    mutation CreatePlaylist($input: CreatePlaylistInput!) {
      createPlaylist(input: $input) {
        ...PlaylistDetails
      }
    }
    ${PLAYLIST_FRAGMENT}
  `;
  const data = await gql<{ createPlaylist: ApiPlaylist }>(query, { input: { name } }, token);
  return data.createPlaylist;
}

export async function addTrackToPlaylistMutation(playlistId: string, trackId: string, token: string): Promise<ApiPlaylist | null> {
  const query = /* GraphQL */ `
    mutation AddTrackToPlaylist($playlistId: String!, $trackId: String!) {
      addTrackToPlaylist(playlistId: $playlistId, trackId: $trackId) {
        ...PlaylistDetails
      }
    }
    ${PLAYLIST_FRAGMENT}
  `;
  const data = await gql<{ addTrackToPlaylist: ApiPlaylist | null }>(query, { playlistId, trackId }, token);
  return data.addTrackToPlaylist;
}

export async function removeTrackFromPlaylistMutation(playlistId: string, trackId: string, token: string): Promise<ApiPlaylist | null> {
  const query = /* GraphQL */ `
    mutation RemoveTrackFromPlaylist($playlistId: String!, $trackId: String!) {
      removeTrackFromPlaylist(playlistId: $playlistId, trackId: $trackId) {
        ...PlaylistDetails
      }
    }
    ${PLAYLIST_FRAGMENT}
  `;
  const data = await gql<{ removeTrackFromPlaylist: ApiPlaylist | null }>(query, { playlistId, trackId }, token);
  return data.removeTrackFromPlaylist;
}

export async function recordTrackListenMutation(trackId: string, token: string): Promise<boolean> {
  const query = /* GraphQL */ `
    mutation RecordTrackListen($trackId: String!) {
      recordTrackListen(trackId: $trackId)
    }
  `;
  const data = await gql<{ recordTrackListen: boolean }>(query, { trackId }, token);
  return data.recordTrackListen;
}

export async function deletePlaylistMutation(playlistId: string, token: string): Promise<boolean> {
  const query = /* GraphQL */ `
    mutation DeletePlaylist($playlistId: String!) {
      deletePlaylist(playlistId: $playlistId)
    }
  `;
  const data = await gql<{ deletePlaylist: boolean }>(query, { playlistId }, token);
  return data.deletePlaylist;
}

export async function updatePlaylistMutation(playlistId: string, name: string, token: string): Promise<ApiPlaylist | null> {
  const query = /* GraphQL */ `
    mutation UpdatePlaylist($playlistId: String!, $input: UpdatePlaylistInput!) {
      updatePlaylist(playlistId: $playlistId, input: $input) {
        ...PlaylistDetails
      }
    }
    ${PLAYLIST_FRAGMENT}
  `;
  const data = await gql<{ updatePlaylist: ApiPlaylist | null }>(query, { playlistId, input: { name } }, token);
  return data.updatePlaylist;
}

// --- PHASE 2 QUERIES AND MUTATIONS ---

const ALBUM_FRAGMENT = /* GraphQL */ `
  fragment AlbumDetails on Album {
    albumId
    title
    imageUrl
    type
    dateReleased
    tracksCount
    listens
    favorites
    comments
    producer
    artists {
      artistId
      name
      imageUrl
    }
  }
`;

const PINNED_ITEM_FRAGMENT = /* GraphQL */ `
  fragment PinnedItemDetails on PinnedItem {
    slot
    itemType
    pinnedAt
    track {
      trackId
      title
      imageUrl
      audioSrc
      durationSeconds
      isLiked
      trackNumber
      discNumber
      isExplicit
      isInstrumental
      listens
      favorites
      comments
      album {
        albumId
        title
        imageUrl
        type
      }
      mainArtists {
        artistId
        name
        imageUrl
      }
      featArtists {
        artistId
        name
        imageUrl
      }
    }
    album {
      albumId
      title
      imageUrl
      type
      dateReleased
      tracksCount
      listens
      favorites
      comments
      producer
      artists {
        artistId
        name
        imageUrl
      }
    }
    artist {
      artistId
      name
      imageUrl
    }
    playlist {
      playlistId
      name
      ownerDisplayName
      isEditable
      trackCount
    }
  }
`;

export async function getArtistAlbumsQuery(artistId: string, token?: string | null): Promise<ApiAlbum[]> {
  const query = /* GraphQL */ `
    query GetArtistAlbums($artistId: String!) {
      artistAlbums(artistId: $artistId) {
        ...AlbumDetails
      }
    }
    ${ALBUM_FRAGMENT}
  `;
  const data = await gql<{ artistAlbums: ApiAlbum[] }>(query, { artistId }, token);
  return data.artistAlbums;
}

export async function getMyTrackHistoryQuery(limit: number, token: string): Promise<ApiTrackListenHistoryItem[]> {
  const query = /* GraphQL */ `
    query GetMyTrackHistory($limit: Int) {
      myTrackHistory(limit: $limit) {
        listenHistoryItemId
        listenedAt
        track {
          ...TrackDetails
        }
      }
    }
    ${TRACK_FRAGMENT}
  `;
  const data = await gql<{ myTrackHistory: ApiTrackListenHistoryItem[] }>(query, { limit }, token);
  return data.myTrackHistory;
}

export async function getMyPinnedItemsQuery(token: string): Promise<ApiPinnedItem[]> {
  const query = /* GraphQL */ `
    query GetMyPinnedItems {
      myPinnedItems {
        slot
        itemType
        pinnedAt
        track {
          trackId
          title
          imageUrl
          audioSrc
          durationSeconds
          isLiked
          album {
            title
          }
          mainArtists {
            name
          }
          featArtists {
            name
          }
        }
        album {
          albumId
          title
          imageUrl
          artists {
            name
          }
        }
        artist {
          artistId
          name
          imageUrl
        }
        playlist {
          playlistId
          name
        }
      }
    }
  `;
  const data = await gql<{ myPinnedItems: ApiPinnedItem[] }>(query, undefined, token);
  return data.myPinnedItems;
}

export async function pinTrackMutation(slot: number, trackId: string, token: string): Promise<ApiPinnedItem | null> {
  const query = /* GraphQL */ `
    mutation PinTrack($slot: Int!, $trackId: String!) {
      pinTrack(slot: $slot, trackId: $trackId) {
        ...PinnedItemDetails
      }
    }
    ${PINNED_ITEM_FRAGMENT}
  `;
  const data = await gql<{ pinTrack: ApiPinnedItem | null }>(query, { slot, trackId }, token);
  return data.pinTrack;
}

export async function pinAlbumMutation(slot: number, albumId: string, token: string): Promise<ApiPinnedItem | null> {
  const query = /* GraphQL */ `
    mutation PinAlbum($slot: Int!, $albumId: String!) {
      pinAlbum(slot: $slot, albumId: $albumId) {
        ...PinnedItemDetails
      }
    }
    ${PINNED_ITEM_FRAGMENT}
  `;
  const data = await gql<{ pinAlbum: ApiPinnedItem | null }>(query, { slot, albumId }, token);
  return data.pinAlbum;
}

export async function pinArtistMutation(slot: number, artistId: string, token: string): Promise<ApiPinnedItem | null> {
  const query = /* GraphQL */ `
    mutation PinArtist($slot: Int!, $artistId: String!) {
      pinArtist(slot: $slot, artistId: $artistId) {
        ...PinnedItemDetails
      }
    }
    ${PINNED_ITEM_FRAGMENT}
  `;
  const data = await gql<{ pinArtist: ApiPinnedItem | null }>(query, { slot, artistId }, token);
  return data.pinArtist;
}

export async function pinPlaylistMutation(slot: number, playlistId: string, token: string): Promise<ApiPinnedItem | null> {
  const query = /* GraphQL */ `
    mutation PinPlaylist($slot: Int!, $playlistId: String!) {
      pinPlaylist(slot: $slot, playlistId: $playlistId) {
        ...PinnedItemDetails
      }
    }
    ${PINNED_ITEM_FRAGMENT}
  `;
  const data = await gql<{ pinPlaylist: ApiPinnedItem | null }>(query, { slot, playlistId }, token);
  return data.pinPlaylist;
}

export async function unpinItemMutation(slot: number, token: string): Promise<boolean> {
  const query = /* GraphQL */ `
    mutation UnpinItem($slot: Int!) {
      unpinItem(slot: $slot)
    }
  `;
  const data = await gql<{ unpinItem: boolean }>(query, { slot }, token);
  return data.unpinItem;
}

export type ApiSearchResults = {
  tracks: ApiTrack[];
  albums: ApiAlbumSummary[];
  artists: ApiArtistSummary[];
  playlists: ApiPlaylistSummary[];
};

export async function globalSearchQuery(queryText: string, limit: number = 5, token?: string | null): Promise<ApiSearchResults> {
  const query = /* GraphQL */ `
    query SearchGlobal($queryText: String!, $limit: Int) {
      search(query: $queryText, limit: $limit) {
        tracks {
          trackId
          title
          imageUrl
          audioSrc
          durationSeconds
          isLiked
          mainArtists {
            artistId
            name
          }
          album {
            title
            albumId
          }
        }
        albums {
          albumId
          title
          imageUrl
          type
          artists {
            name
          }
        }
        artists {
          artistId
          name
          imageUrl
        }
        playlists {
          playlistId
          name
        }
      }
    }
  `;
  const data = await gql<{ search: ApiSearchResults }>(query, { queryText, limit }, token);
  return data.search;
}

export async function getRecommendationsQuery(
  seedTrackIds: string[],
  blacklistedTrackIds: string[],
  limit: number,
  randomness: number,
  token?: string | null
): Promise<ApiTrack[]> {
  const query = /* GraphQL */ `
    query GetRecommendations($seedTrackIds: [String!]!, $blacklistedTrackIds: [String!]!, $limit: Int!, $randomness: Int!) {
      recommendations(seedTrackIds: $seedTrackIds, blacklistedTrackIds: $blacklistedTrackIds, limit: $limit, randomness: $randomness) {
        trackId
        title
        imageUrl
        audioSrc
        durationSeconds
        isLiked
        mainArtists {
          artistId
          name
        }
        album {
          title
          albumId
        }
      }
    }
  `;
  const data = await gql<{ recommendations: ApiTrack[] }>(query, { seedTrackIds, blacklistedTrackIds, limit, randomness }, token);
  return data.recommendations;
}
