"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { Album, Music } from "@/types/music";
import { useAuth } from "@/context/AuthContext";
import {
  getMyBlindtestsQuery,
  createBlindtestMutation,
  deleteBlindtestMutation,
  updateBlindtestMutation,
  addTrackToBlindtestMutation,
  removeTrackFromBlindtestMutation,
  toMusic,
  formatImageUrl,
} from "@/lib/api-client";

interface BlindtestContextType {
  blindtests: Album[];
  createBlindtest: (name: string) => Promise<void>;
  updateBlindtest: (id: string, name: string) => Promise<void>;
  deleteBlindtest: (id: string) => Promise<void>;
  addTrackToBlindtest: (blindtestId: string, track: Music) => Promise<void>;
  removeTrackFromBlindtest: (blindtestId: string, trackId: string) => Promise<void>;
  isOwnedBindtest: (id: string) => boolean;
}

const BlindtestContext = createContext<BlindtestContextType | undefined>(undefined);

export const BlindtestProvider = ({ children }: { children: ReactNode }) => {
  const [blindtests, setBlindtests] = useState<Album[]>([]);
  const { token } = useAuth();

  useEffect(() => {
    const load = async () => {
      if (token) {
        try {
          const data = await getMyBlindtestsQuery(token);
          const mapped: Album[] = data.map((p: any) => ({
            id: p.blindtestId,
            name: p.name || "Mon blindtest",
            artist: p.ownerDisplayName || "User",
            image: p.tracks?.[0]?.imageUrl
              ? formatImageUrl(p.tracks[0].imageUrl)
              : "/placeholder-album.jpg",
            type: "Blindtest",
            tracks: p.tracks ? p.tracks.map(toMusic) : [],
          }));
  
          setBlindtests(mapped);
        } catch (err) {
          console.error("Failed to load blindtests", err);
        }
      } else {
        setBlindtests([]);
      }
    };
  
    load();
  }, [token]);

  const createBlindtest = async (name: string) => {
    if (!token) return;
    try {
      await createBlindtestMutation(name, token);
    } catch (err) {
      console.error(err);
    }
  };

  const updateBlindtest = async (id: string, name: string) => {
    if (!token) return;
    try {
      await updateBlindtestMutation(id, name, token);
      // await loadBlindtests();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteBlindtest = async (id: string) => {
    if (!token) return;
    try {
      await deleteBlindtestMutation(id, token);
      // await loadBlindtests();
    } catch (err) {
      console.error(err);
    }
  };

  const addTrackToBlindtest = async (blindtestId: string, track: Music) => {
    if (!token) return;
    try {
      await addTrackToBlindtestMutation(blindtestId, track.id, token);
      // await loadBlindtests();
    } catch (err) {
      console.error(err);
    }
  };

  const removeTrackFromBlindtest = async (blindtestId: string, trackId: string) => {
    if (!token) return;
    try {
      await removeTrackFromBlindtestMutation(blindtestId, trackId, token);
      // await loadBlindtests();
    } catch (err) {
      console.error(err);
    }
  };

  const isOwnedBlindtest = (id: string) => {
    return blindtests.some((p) => p.id === id);
  };

  return (
    <BlindtestContext.Provider
      value={{
        blindtests,
        createBlindtest,
        updateBlindtest,
        deleteBlindtest,
        addTrackToBlindtest,
        removeTrackFromBlindtest,
        isOwnedBlindtest,
      }}
    >
      {children}
    </BlindtestContext.Provider>
  );
};

export const useBlindtest = () => {
  const context = useContext(BlindtestContext);
  if (context === undefined) {
    throw new Error("useBlindtest must be used within a BlindtestProvider");
  }
  return context;
};
