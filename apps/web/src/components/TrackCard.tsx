"use client";

import Image from "@/components/ImageWithFallback";
import { Play } from "lucide-react";
import { usePlayer } from "@/context/PlayerContext";
import { Music } from "@/types/music";

interface TrackCardProps {
  track: Music;
  priority?: boolean;
}

export default function TrackCard({ track, priority = false }: TrackCardProps) {
  const { playTrack } = usePlayer();

  return (
    <div
      onClick={() => playTrack(track)}
      className="block w-full group hover:cursor-pointer transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-[var(--color-muse-sky-blue)] to-[var(--color-muse-pink)] rounded-lg"
    >
      <div className="group-hover:scale-[0.98] transition-all duration-300 flex flex-row lg:flex-col items-center lg:items-start bg-card text-card-foreground rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-border w-full">
        {/* Image Container */}
        <div className="relative w-1/3 lg:w-full aspect-square shrink-0">
          {(!track.image || track.image.includes("placeholder")) && (
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-muse-sky-blue)] to-[var(--color-muse-pink)] opacity-80" />
          )}
          {track.image && !track.image.includes("placeholder") && (
            <Image
              src={track.image}
              alt={track.title || "Track"}
              fill
              priority={priority}
              className="object-cover z-10 transition-opacity group-hover:opacity-70"
            />
          )}

          {/* Default Play Icon on hover */}
          <div className="absolute inset-0 z-30 hidden lg:flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
            <Play className="w-12 h-12 text-white fill-white shadow-lg drop-shadow-md" />
          </div>

          {/* Type Badge */}
          <div className="absolute hidden md:block top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur-sm z-20">
            Titre
          </div>
        </div>

        {/* Text Content */}
        <div className="p-1 lg:p-4 flex-1 w-full overflow-hidden">
          <h3 className="text-sm lg:text-base truncate opacity-90 font-bold">{track.title}</h3>
          <p className="text-xs lg:text-sm truncate opacity-70 mt-1">
            {track.artist ? (Array.isArray(track.artist) ? track.artist.join(", ") : track.artist) : "Unknown"}
          </p>
        </div>
      </div>
    </div>
  );
}
