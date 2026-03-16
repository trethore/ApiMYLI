"use client";

import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from "react";
import { Music } from "@/types/music";
import { useAuth } from "@/context/AuthContext";
import { recordTrackListenMutation, getRecommendationsQuery, toMusic } from "@/lib/api-client";

interface PlayerContextType {
  currentTrack: Music | null;
  isPlaying: boolean;
  playTrack: (track: Music) => void;
  togglePlay: () => void;
  volume: number;
  setVolume: (volume: number) => void;
  currentTime: number;
  duration: number;
  seek: (time: number) => void;
  queue: Music[];
  history: Music[];
  addToQueue: (track: Music) => void;
  removeFromQueue: (trackId: string) => void;
  clearQueue: () => void;
  playNext: () => void;
  playPrevious: () => void;
  clearPlayer: () => void;
  setQueueList: (tracks: Music[]) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Music | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1); // 0 to 1
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [queue, setQueue] = useState<Music[]>([]);
  const [history, setHistory] = useState<Music[]>([]);

  const { token, isAuthenticated } = useAuth();

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initialize audio element
    audioRef.current = new Audio();

    // Cleanup
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);


  const togglePlay = useCallback(() => {
    if (!audioRef.current || !currentTrack) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  }, [currentTrack, isPlaying, audioRef])

  const playTrack = useCallback((track: Music, addToHistory = true) => {
    if (!audioRef.current) return;

    // If we are changing tracks (and not just toggling same track), add current to history
    if (currentTrack?.id !== track.id) {
      if (addToHistory && currentTrack) {
        setHistory((prev) => [...prev, currentTrack]);
      }

      if (track.audioSrc) {
        let src = track.audioSrc;
        if (!src.startsWith("http")) {
          src = `https://files.freemusicarchive.org/storage-freemusicarchive-org/${src}`;
        }

        audioRef.current.src = src;
        setCurrentTrack(track);
        audioRef.current.play();
        setIsPlaying(true);

        if (isAuthenticated && token) {
          recordTrackListenMutation(track.id, token).catch(console.error);
        }
      } else {
        console.warn("No audio source available for this track");
      }
    } else {
      togglePlay();
    }
  }, [currentTrack, isAuthenticated, token, togglePlay]);

  const seek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const addToQueue = (track: Music) => {
    setQueue((prev) => [...prev, track]);
  };

  const removeFromQueue = (trackId: string) => {
    setQueue((prev) => prev.filter((t) => t.id !== trackId));
  };

  const clearQueue = () => {
    setQueue([]);
  };

  const setQueueList = (tracks: Music[]) => {
    setQueue(tracks);
  };

  const playNext = useCallback(async () => {
    if (queue.length > 0) {
      const nextTrack = queue[0];
      setQueue((prev) => prev.slice(1));
      playTrack(nextTrack, true);
    } else if (currentTrack) {
      // Autoplay: Fetch recommendations if queue is empty
      try {
        const recentHistoryIds = history.slice(-5).map(t => t.id);
        const seedIds = [currentTrack.id, ...recentHistoryIds];
        const blacklistedIds = [currentTrack.id, ...history.map(t => t.id)];

        const recommendations = await getRecommendationsQuery(
          seedIds,
          blacklistedIds,
          5, // Fetch 5 tracks ahead
          5, // 5% randomness to stay very close to the current vibe
          token
        );

        if (recommendations.length > 0) {
          const musicRecs = recommendations.map(toMusic);
          const nextTrack = musicRecs[0];
          setQueue(musicRecs.slice(1));
          playTrack(nextTrack, true);
          return; // Prevent setting isPlaying(false) below
        }
      } catch (error) {
        console.error("Autoplay failed to get recommendations:", error);
      }

      setIsPlaying(false);
    } else {
      setIsPlaying(false);
    }
  }, [queue, currentTrack, history, token, playTrack])

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleEnded = () => {
      playNext();
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [queue, currentTrack, playNext]); // Re-bind when queue changes to ensure playNext has fresh state

  const playPrevious = () => {
    if (history.length > 0) {
      const previousTrack = history[history.length - 1];
      setHistory((prev) => prev.slice(0, -1));

      // Put current track back to start of queue if we go back
      if (currentTrack) {
        setQueue((prev) => [currentTrack, ...prev]);
      }

      // Special call to play without adding *previous* to history again (handled by slice)
      // But wait, playTrack adds `currentTrack` to history.
      // If we go back, `previousTrack` becomes current. `currentTrack` (old) goes to queue.
      // We don't want `currentTrack` to go to history again?
      // Actually logic above: setHistory removes prev. setQueue adds current.
      // playTrack will take `previousTrack`. It will see `currentTrack` (old) !== `previousTrack`.
      // It will try to add `currentTrack` to history.
      // We should prevent that because we just moved it to queue.

      playTrack(previousTrack, false);
    } else {
      // Restart current track if no history?
      seek(0);
    }
  };

  const clearPlayer = () => {
    // Stop audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.src = "";
    }

    // Reset state
    setIsPlaying(false);
    setCurrentTrack(null);
    setCurrentTime(0);
    setDuration(0);
    setQueue([]);
    setHistory([]);
  };

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        playTrack,
        togglePlay,
        volume,
        setVolume,
        currentTime,
        duration,
        seek,
        queue,
        history,
        addToQueue,
        removeFromQueue,
        clearQueue,
        setQueueList,
        playNext,
        playPrevious,
        clearPlayer,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error("usePlayer must be used within a PlayerProvider");
  }
  return context;
}
