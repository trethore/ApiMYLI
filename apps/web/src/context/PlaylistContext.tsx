"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { Album, Music } from "@/types/music";

interface PlaylistContextType {
  playlists: Album[];
  createPlaylist: (name: string, imageUrl?: string) => void;
  updatePlaylist: (id: string, name: string, imageUrl?: string) => void;
  deletePlaylist: (id: string) => void;
  addTrackToPlaylist: (playlistId: string, track: Music) => void;
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => void;
  isOwnedPlaylist: (id: string) => boolean;
}

const PlaylistContext = createContext<PlaylistContextType | undefined>(undefined);

// Initial mock data
const initialPlaylists: Album[] = [
  {
    id: "user-playlist-1",
    name: "My Favorite Mix",
    artist: "User",
    image: "/placeholder-album.jpg",
    type: "Playlist",
    tracks: [
      {
        id: "p1-t1",
        title: "Track 1",
        artist: ["Artist A"],
        album: "Album A",
        duration: "3:00",
        isLiked: true,
      },
      {
        id: "p1-t2",
        title: "Track 2",
        artist: ["Artist B"],
        album: "Album B",
        duration: "3:30",
        isLiked: false,
      },
    ],
  },
];

export const PlaylistProvider = ({ children }: { children: ReactNode }) => {
  const [playlists, setPlaylists] = useState<Album[]>(initialPlaylists);

  const createPlaylist = (name: string, imageUrl?: string) => {
    const newPlaylist: Album = {
      id: `user-playlist-${Date.now()}`,
      name,
      artist: "User", // Mock user ownership
      image: imageUrl || "/placeholder-album.jpg",
      type: "Playlist",
      tracks: [],
    };
    setPlaylists([...playlists, newPlaylist]);
  };

  const updatePlaylist = (id: string, name: string, imageUrl?: string) => {
    setPlaylists(
      playlists.map((p) => (p.id === id ? { ...p, name, image: imageUrl || p.image } : p)),
    );
  };

  const deletePlaylist = (id: string) => {
    setPlaylists(playlists.filter((p) => p.id !== id));
  };

  const addTrackToPlaylist = (playlistId: string, track: Music) => {
    setPlaylists(
      playlists.map((p) => {
        if (p.id === playlistId) {
          // Prevent duplicates
          if (!p.tracks.some((t) => t.id === track.id)) {
            return { ...p, tracks: [...p.tracks, track] };
          }
        }
        return p;
      }),
    );
  };

  const removeTrackFromPlaylist = (playlistId: string, trackId: string) => {
    setPlaylists(
      playlists.map((p) => {
        if (p.id === playlistId) {
          return { ...p, tracks: p.tracks.filter((t) => t.id !== trackId) };
        }
        return p;
      }),
    );
  };

  // Simple check for mock data
  const isOwnedPlaylist = (id: string) => {
    return id.startsWith("user-playlist");
  };

  return (
    <PlaylistContext.Provider
      value={{
        playlists,
        createPlaylist,
        updatePlaylist,
        deletePlaylist,
        addTrackToPlaylist,
        removeTrackFromPlaylist,
        isOwnedPlaylist,
      }}
    >
      {children}
    </PlaylistContext.Provider>
  );
};

export const usePlaylist = () => {
  const context = useContext(PlaylistContext);
  if (context === undefined) {
    throw new Error("usePlaylist must be used within a PlaylistProvider");
  }
  return context;
};
