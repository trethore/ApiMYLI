"use client";

import { usePlayer } from "@/context/PlayerContext";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Volume1,
  VolumeX,
  ListMusic,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import Link from "next/link";
import Image from "@/components/ImageWithFallback";
import { useState } from "react";
import QueueList from "@/components/QueueList";
import LikeButton from "@/components/LikeButton";
import DislikeButton from "@/components/DislikeButton";

export default function Player() {
  const {
    currentTrack,
    isPlaying,
    togglePlay,
    volume,
    setVolume,
    currentTime,
    duration,
    seek,
    playNext,
    playPrevious,
  } = usePlayer();
  const [showQueue, setShowQueue] = useState(false);

  if (!currentTrack) return null;

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <div className="fixed bottom-[54px] lg:bottom-0 left-0 right-0 bg-background/95 backdrop-blur-lg border-t border-border z-50 flex flex-col sm:flex-row h-auto sm:h-24">
      {/* Mobile Progress Bar (Full Width Top) */}
      <div className="w-full sm:hidden order-1">
        <Slider
          value={[currentTime]}
          max={duration || 100}
          step={1}
          onValueChange={(vals: number[]) => seek(vals[0])}
          className="w-full cursor-pointer h-1 rounded-none group"
        />
      </div>

      <div className="flex items-center justify-between p-4 w-full h-20 sm:h-auto order-2">
        {/* Track Info */}
        <div className="flex items-center gap-4 w-1/2 sm:w-1/3">
          <div className="relative h-12 w-12 sm:h-14 sm:w-14 rounded-md overflow-hidden bg-secondary/20 shrink-0">
            <Image
              src={currentTrack.image || "/placeholder-music.jpg"}
              alt={currentTrack.title}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="font-bold truncate text-sm sm:text-base">{currentTrack.title}</span>
            <span className="text-xs sm:text-sm text-muted-foreground truncate">
              {currentTrack.artist.map((artistName, index) => (
                <span key={index}>
                  <Link
                    href={`/artist/${currentTrack.artistIds?.[index] || artistName}`}
                    className="hover:underline"
                  >
                    {artistName}
                  </Link>
                  {index < currentTrack.artist.length - 1 ? ", " : ""}
                </span>
              ))}
              {currentTrack.album && currentTrack.albumId && (
                <>
                  {" "}
                  •{" "}
                  <Link href={`/album/${currentTrack.albumId}`} className="hover:underline">
                    {currentTrack.album}
                  </Link>
                </>
              )}
            </span>
          </div>
        </div>

        {/* Controls (Center on Desktop, Right on Mobile) */}
        <div className="flex flex-col items-center gap-2 w-auto sm:w-1/3 sm:max-w-md">
          <div className="flex items-center gap-2 sm:gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground hidden sm:inline-flex"
              onClick={playPrevious}
            >
              <SkipBack size={20} />
            </Button>
            <Button
              size="icon"
              className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-foreground text-background hover:scale-105 transition-transform"
              onClick={togglePlay}
            >
              {isPlaying ? (
                <Pause size={20} fill="currentColor" />
              ) : (
                <Play size={20} fill="currentColor" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground hidden sm:inline-flex"
              onClick={playNext}
            >
              <SkipForward size={20} />
            </Button>
          </div>

          {/* Desktop Progress Bar */}
          <div className="hidden sm:flex items-center gap-2 w-full">
            <span className="text-xs text-muted-foreground w-10 text-right">
              {formatTime(currentTime)}
            </span>
            <Slider
              value={[currentTime]}
              max={duration || 100}
              step={1}
              onValueChange={(vals: number[]) => seek(vals[0])}
              className="w-full cursor-pointer"
            />
            <span className="text-xs text-muted-foreground w-10">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Volume (Desktop Only) */}
        <div className="hidden sm:flex items-center justify-end gap-2 w-1/3">
          <LikeButton
            initialIsLiked={currentTrack.isLiked}
            size={20}
            itemId={currentTrack.id}
            itemType="track"
          />
          <DislikeButton
            initialIsDisliked={currentTrack.isDisliked}
            size={20}
            itemId={currentTrack.id}
            itemType="track"
          />
          <Button
            variant="ghost"
            size="icon"
            className={`text-muted-foreground hover:text-foreground ${showQueue ? "text-primary bg-secondary/20" : ""}`}
            onClick={() => setShowQueue(!showQueue)}
            title="File d'attente"
          >
            <ListMusic size={20} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground"
            onClick={() => setVolume(volume === 0 ? 1 : 0)}
          >
            {volume === 0 ? (
              <VolumeX size={20} />
            ) : volume < 0.5 ? (
              <Volume1 size={20} />
            ) : (
              <Volume2 size={20} />
            )}
          </Button>
          <Slider
            value={[volume]}
            max={1}
            step={0.01}
            onValueChange={(vals: number[]) => setVolume(vals[0])}
            className="w-24 cursor-pointer"
          />
        </div>
      </div>

      {/* Queue List Overlay */}
      {showQueue && (
        <div className="absolute bottom-24 right-4 z-50 w-80 bg-background/95 backdrop-blur-xl border border-border shadow-xl rounded-xl overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-200">
          <QueueList />
        </div>
      )}
    </div>
  );
}
