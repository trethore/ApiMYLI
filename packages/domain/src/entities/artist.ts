export type Artist = {
  artistId: string;
  name: string | null;
  imageUrl: string | null;
  images: string[];
  bio: string | null;
  members: string | null;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  activeYearBegin: number | null;
  activeYearEnd: number | null;
  favorites: number | null;
  comments: number | null;
  tags: string[];
  albumCount: number | null;
  trackCount: number | null;
  isFavorited: boolean;
};
