"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { Blindtest, Music } from "@/types/music";
import { useAuth } from "@/context/AuthContext";
import {
  getMyBlindtestsQuery,
  toMusic,
  formatImageUrl,
  createBlindtestMutation,
  updateBlindtestMutation,
  deleteBlindtestMutation,
  addCompulsoryTrackToBlindtestMutation,
  removeCompulsoryTrackFromBlindtestMutation,
  autocompleteBlindtestMutation,
} from "@/lib/api-client";

export type BlindtestCreateInput = {
  name: string,
  length: number,
  difficulty: number,
  yearBegin: number | null,
  yearEnd: number | null,
  instrumental: boolean | null;
  genreIds: string[],
  artistIds: string[],
  compulsoryTrackIds: string[]
}

interface BlindtestContextType {
  blindtests: Blindtest[];
  loadBlindtests: () => Promise<void>;
  createBlindtest: (input: BlindtestCreateInput) => Promise<void>;
  updateBlindtest: (id: string, name: string) => Promise<void>;
  deleteBlindtest: (id: string) => Promise<void>;
  autocompleteBlindtest: (id: string, seedTrackIds: string[], blacklistedTrackIds: string[], randomness: number) => Promise<void>;
  addCompulsoryTrackToBlindtest: (blindtestId: string, track: Music) => Promise<void>;
  removeCompulsoryTrackFromBlindtest: (blindtestId: string, trackId: string) => Promise<void>;
  isOwnedBlindtest: (id: string) => boolean;
}

const BlindtestContext = createContext<BlindtestContextType | undefined>(undefined);

export const BlindtestProvider = ({ children }: { children: ReactNode }) => {
  const [blindtests, setBlindtests] = useState<Blindtest[]>([]);
  const { token } = useAuth();

  const loadBlindtests = async () => {
    if (token) {
      try {
        const data = await getMyBlindtestsQuery(token);

        const mapped: Blindtest[] = data.map((p: any) => ({
          id: p.blindtestId,
          name: p.name || "Mon blindtest",
          artist: p.ownerDisplayName || "User",
          image: p.tracks?.[0]?.imageUrl
            ? formatImageUrl(p.tracks[0].imageUrl)
            : "/placeholder-album.jpg",
          type: "Blindtest",
          tracks: p.tracks ? p.tracks.map(toMusic) : [],
          trackCount: p.trackCount ? p.trackCount : null,
          compulsoryTrackCount: p.compulsoryTrackCount ? p.compulsoryTrackCount : null,
          totalTracksCount: p.totalTracksCount,
        }));

        setBlindtests(mapped);
      } catch (err) {
        console.error("Failed to load blindtests", err);
      }
    } else {
      setBlindtests([]);
    }
  };

  useEffect(() => {
    loadBlindtests();
  }, [token]);

  const createBlindtest = async (input: BlindtestCreateInput) => {
    if (!token) return;

    try {
      await createBlindtestMutation(input, token);
      await loadBlindtests();
    } catch (err) {
      console.error(err);
    }
  };

  const updateBlindtest = async (id: string, name: string) => {
    if (!token) return;
    try {
      await updateBlindtestMutation(id, name, token);
      await loadBlindtests();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteBlindtest = async (id: string) => {
    if (!token) return;
    try {
      await deleteBlindtestMutation(id, token);
      await loadBlindtests();
    } catch (err) {
      console.error(err);
    }
  };

  const autocompleteBlindtest = async (id: string, seedTrackIds: string[], blacklistedTrackIds: string[], randomness: number) => {
    if (!token) return;

    try {
      await autocompleteBlindtestMutation(id, seedTrackIds, blacklistedTrackIds, randomness, token);
      await loadBlindtests();
    } catch (err) {
      console.error(err);
    }
  };

  const addCompulsoryTrackToBlindtest = async (blindtestId: string, track: Music) => {
    if (!token) return;
    try {
      await addCompulsoryTrackToBlindtestMutation(blindtestId, track.id, token);
      // await loadBlindtests();
    } catch (err) {
      console.error(err);
    }
  };

  const removeCompulsoryTrackFromBlindtest = async (blindtestId: string, trackId: string) => {
    if (!token) return;
    try {
      await removeCompulsoryTrackFromBlindtestMutation(blindtestId, trackId, token);
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
        loadBlindtests,
        createBlindtest,
        updateBlindtest,
        deleteBlindtest,
        autocompleteBlindtest,
        addCompulsoryTrackToBlindtest,
        removeCompulsoryTrackFromBlindtest,
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
