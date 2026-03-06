export interface Music {
  id: string;
  title: string;
  artist: string[];
  artistIds?: string[];
  album: string;
  albumId?: string;
  image?: string;
  duration: string;
  isLiked: boolean;
  audioSrc?: string;
}

export interface Album {
  id: string;
  name: string;
  artist: string;
  image: string;
  type: "Album" | "Single" | "Playlist"; // Added Playlist here to fix type errors
  tracks: Music[];
}

export interface Artist {
  id: string;
  name: string;
  image: string;
  stats: {
    totalListeners: string;
  };
  popularTracks: Music[];
  albums: Album[];
  singles: Album[];
}
