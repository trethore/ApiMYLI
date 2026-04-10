"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { Blindtest } from "@/types/music";
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
  ApiBlindtest,
  getBlindtestQuery,
  addTrackToBlindtestMutation,
  removeTrackFromBlindtestMutation,
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

export type BlindtestUpdateInput = BlindtestCreateInput;

interface BlindtestContextType {
  blindtests: Blindtest[];
  blindtest: ApiBlindtest | null;
  error: string | null;
  loadBlindtests: () => Promise<void>;
  loadBlindtest: (blindtestId: string) => Promise<void>;
  createBlindtest: (input: BlindtestCreateInput) => Promise<ApiBlindtest | undefined>;
  updateBlindtest: (id: string, input: BlindtestUpdateInput) => Promise<void>;
  deleteBlindtest: (id: string) => Promise<void>;
  autocompleteBlindtest: (id: string, seedTrackIds: string[], blacklistedTrackIds: string[], randomness: number) => Promise<ApiBlindtest | undefined>;
  addCompulsoryTrackToBlindtest: (blindtestId: string, trackId: string) => Promise<void>;
  addCompulsoryTracksToBlindtest: (blindtestId: string, trackIds: string[]) => Promise<void>;
  removeCompulsoryTrackFromBlindtest: (blindtestId: string, trackId: string) => Promise<void>;
  addTrackToBlindtest: (blindtestId: string, trackId: string) => Promise<void>;
  addTracksToBlindtest: (blindtestId: string, trackIds: string[]) => Promise<void>;
  removeTrackFromBlindtest: (blindtestId: string, trackId: string) => Promise<void>;
  isOwnedBlindtest: (id: string) => boolean;
}

const BlindtestContext = createContext<BlindtestContextType | undefined>(undefined);

export const BlindtestProvider = ({ children }: { children: ReactNode }) => {
  const [blindtests, setBlindtests] = useState<Blindtest[]>([]);
  const [blindtest, setBlindtest] = useState<ApiBlindtest | null>(null);
  const { token } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const loadBlindtest = async (blindtestId: string) => {
    try {
      const data = await getBlindtestQuery(blindtestId, token);

      if (data) {
        setBlindtest(data);
      }
    } catch (err) {
      console.error("Error fetching blindtest", err);
    }
  };

  const loadBlindtests = async () => {
    if (token) {
      try {
        const data = await getMyBlindtestsQuery(token);

        const mapped: Blindtest[] = data.map((p: ApiBlindtest) => ({
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
      const blindtest = await createBlindtestMutation(input, token);
      await loadBlindtests();
      return blindtest
    } catch (err) {
      console.error(err);
    }
  };

  const updateBlindtest = async (id: string, input: BlindtestUpdateInput) => {
    if (!token) return;
    try {
      await updateBlindtestMutation(id, input, token);
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

  const autocompleteBlindtest = async (blindtestId: string, seedTrackIds: string[], blacklistedTrackIds: string[], randomness: number) => {
    if (!token) return;

    try {
      const updatedBlindtest = await autocompleteBlindtestMutation(
        blindtestId,
        seedTrackIds,
        blacklistedTrackIds,
        randomness,
        token
      );

      await loadBlindtests();

      if (updatedBlindtest) {
        setBlindtest(updatedBlindtest);
        return updatedBlindtest;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur d'autocompletion");
      console.error(err);
    }
  };

  const addCompulsoryTrackToBlindtest = async (blindtestId: string, trackId: string) => {
    if (!token) return;
    try {
      await addCompulsoryTrackToBlindtestMutation(blindtestId, trackId, token);
    } catch (err) {
      console.error(err);
    }
  };

  const addCompulsoryTracksToBlindtest = async (blindtestId: string, trackIds: string[]) => {
    for (const id of trackIds) {
      await addCompulsoryTrackToBlindtest(blindtestId, id);
    }
  };

  const removeCompulsoryTrackFromBlindtest = async (blindtestId: string, trackId: string) => {
    if (!token) return;
    try {
      await removeCompulsoryTrackFromBlindtestMutation(blindtestId, trackId, token);
    } catch (err) {
      console.error(err);
    }
  };

  const addTrackToBlindtest = async (blindtestId: string, trackId: string) => {
    if (!token) return;
    try {
      await addTrackToBlindtestMutation(blindtestId, trackId, token);
      await loadBlindtests();
    } catch (err) {
      console.error(err);
    }
  };

  const addTracksToBlindtest = async (blindtestId: string, trackIds: string[]) => {
    for (const id of trackIds) {
      await addTrackToBlindtest(blindtestId, id);
    }
  };

  const removeTrackFromBlindtest = async (blindtestId: string, trackId: string) => {
    if (!token) return;
    try {
      await removeTrackFromBlindtestMutation(blindtestId, trackId, token);
      await loadBlindtests();
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
        blindtest,
        error,
        loadBlindtests,
        loadBlindtest,
        createBlindtest,
        updateBlindtest,
        deleteBlindtest,
        autocompleteBlindtest,
        addCompulsoryTrackToBlindtest,
        addCompulsoryTracksToBlindtest,
        removeCompulsoryTrackFromBlindtest,
        addTrackToBlindtest,
        addTracksToBlindtest,
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
