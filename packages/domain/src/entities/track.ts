export type ArtistSummary = {
  artistId: string;
  name: string | null;
  imageUrl: string | null;
};

export type AlbumSummary = {
  albumId: string;
  title: string | null;
  imageUrl: string | null;
  type: string | null;
};

export type Track = {
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
  album: AlbumSummary | null;
  mainArtists: ArtistSummary[];
  featArtists: ArtistSummary[];
  isLiked: boolean;
  audioFeatures?: any; // Added for Recommendations
};
