"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { Album, Music } from "@/types/music";
import { useAuth } from "@/context/AuthContext";
import {
  getMyPlaylistsQuery,
  createPlaylistMutation,
  deletePlaylistMutation,
  updatePlaylistMutation,
  addTrackToPlaylistMutation,
  removeTrackFromPlaylistMutation,
  toMusic,
  formatImageUrl,
} from "@/lib/api-client";

interface PlaylistContextType {
  playlists: Album[];
  createPlaylist: (name: string) => Promise<void>;
  updatePlaylist: (id: string, name: string) => Promise<void>;
  deletePlaylist: (id: string) => Promise<void>;
  addTrackToPlaylist: (playlistId: string, track: Music) => Promise<void>;
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => Promise<void>;
  isOwnedPlaylist: (id: string) => boolean;
}

const PlaylistContext = createContext<PlaylistContextType | undefined>(undefined);

export const PlaylistProvider = ({ children }: { children: ReactNode }) => {
  const [playlists, setPlaylists] = useState<Album[]>([]);
  const { token } = useAuth();

  useEffect(() => {
    const load = async () => {
      if (token) {
        try {
          const data = await getMyPlaylistsQuery(token);
          const mapped: Album[] = data.map((p) => ({
            id: p.playlistId,
            name: p.name || "Ma Playlist",
            artist: p.ownerDisplayName || "User",
            image: p.tracks?.[0]?.imageUrl
              ? formatImageUrl(p.tracks[0].imageUrl)
              : "/placeholder-album.jpg",
            type: "Playlist",
            tracks: p.tracks ? p.tracks.map(toMusic) : [],
          }));
  
          setPlaylists(mapped);
        } catch (err) {
          console.error("Failed to load playlists", err);
        }
      } else {
        setPlaylists([]);
      }
    };
  
    load();
  }, [token]);

  const createPlaylist = async (name: string) => {
    if (!token) return;
    try {
      await createPlaylistMutation(name, token);
      // await loadPlaylists();
    } catch (err) {
      console.error(err);
    }
  };

  const updatePlaylist = async (id: string, name: string) => {
    if (!token) return;
    try {
      await updatePlaylistMutation(id, name, token);
      // await loadPlaylists();
    } catch (err) {
      console.error(err);
    }
  };

  const deletePlaylist = async (id: string) => {
    if (!token) return;
    try {
      await deletePlaylistMutation(id, token);
      // await loadPlaylists();
    } catch (err) {
      console.error(err);
    }
  };

  const addTrackToPlaylist = async (playlistId: string, track: Music) => {
    if (!token) return;
    try {
      await addTrackToPlaylistMutation(playlistId, track.id, token);
      // await loadPlaylists();
    } catch (err) {
      console.error(err);
    }
  };

  const removeTrackFromPlaylist = async (playlistId: string, trackId: string) => {
    if (!token) return;
    try {
      await removeTrackFromPlaylistMutation(playlistId, trackId, token);
      // await loadPlaylists();
    } catch (err) {
      console.error(err);
    }
  };

  const isOwnedPlaylist = (id: string) => {
    return playlists.some((p) => p.id === id);
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
