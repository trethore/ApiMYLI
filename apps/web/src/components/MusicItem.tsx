"use client";

import { Music } from "@/types/music";
import { MoreHorizontal, Play } from "lucide-react";
import Image from "@/components/ImageWithFallback";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import LikeButton from "@/components/LikeButton";
import DislikeButton from "@/components/DislikeButton";
import PinActionSubMenu from "@/components/PinActionSubMenu";
import { usePlayer } from "@/context/PlayerContext";
import { usePlaylist } from "@/context/PlaylistContext";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";

interface MusicItemProps {
  music: Music;
  index: number;
  showImage?: boolean; // Default true
}

export default function MusicItem({ music, index, showImage = true }: MusicItemProps) {
  const { playTrack, addToQueue } = usePlayer();
  const { playlists, isOwnedPlaylist, removeTrackFromPlaylist, addTrackToPlaylist } = usePlaylist();
  const pathname = usePathname();
  const router = useRouter();
  const [isLiked, setIsLiked] = useState(!!music.isLiked);
  const [isDisliked, setIsDisliked] = useState(!!music.isDisliked);

  useEffect(() => {
    setIsLiked(!!music.isLiked);
    setIsDisliked(!!music.isDisliked);
  }, [music.id, music.isLiked, music.isDisliked]);

  // Determine if we are currently inside an owned playlist
  const isPlaylistRoute = pathname.startsWith("/playlist/");
  const currentPlaylistId = isPlaylistRoute ? pathname.split("/").pop() : null;
  const isInsideOwnedPlaylist = currentPlaylistId ? isOwnedPlaylist(currentPlaylistId) : false;

  const handleRemoveFromPlaylist = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentPlaylistId) {
      removeTrackFromPlaylist(currentPlaylistId, music.id);
    }
  };

  const handleAddToPlaylist = (e: React.MouseEvent, playlistId: string) => {
    e.stopPropagation();
    addTrackToPlaylist(playlistId, music);
  };

  return (
    <div className="flex items-center justify-between p-3 hover:bg-white/5 rounded-lg transition-colors group relative">
      <div className="flex items-center gap-4">
        {/* Index / Play Button (When Image Hidden) */}
        <div
          className={`w-8 flex justify-center items-center ${!showImage ? "cursor-pointer" : ""}`}
          onClick={() => !showImage && playTrack(music)}
        >
          <span
            className={`text-muted-foreground text-sm font-medium ${!showImage ? "group-hover:hidden" : ""}`}
          >
            {index + 1}
          </span>
          {!showImage && (
            <Play className="fill-foreground text-foreground w-4 h-4 hidden group-hover:block" />
          )}
        </div>

        {/* Image (Conditional) */}
        {showImage && (
          <div
            className="relative w-12 h-12 rounded-md overflow-hidden flex-shrink-0 bg-secondary/20 cursor-pointer group/image"
            onClick={() => playTrack(music)}
          >
            {/* Fallback or actual image */}
            <Image
              src={music.image || "/placeholder-music.jpg"}
              alt={music.title}
              fill
              className="object-cover transition-opacity group-hover/image:opacity-70"
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/image:opacity-100 transition-opacity">
              <Play className="fill-white text-white w-6 h-6" />
            </div>
          </div>
        )}
        <div className="flex flex-col justify-center">
          <span
            className="font-bold text-foreground text-base truncate max-w-[150px] sm:max-w-[200px] cursor-pointer hover:underline"
            onClick={() => playTrack(music)}
          >
            {music.title}
          </span>
          <span className="text-sm text-muted-foreground truncate max-w-[150px] sm:max-w-[200px]">
            {music.artist.map((artist, i) => (
              <span key={i}>
                {/* Note: since music.artist is an array of strings currently, we simulate an ID link or simply link to the name as an ID for now until the API brings proper IDs */}
                <Link
                  href={`/artist/${music.artistIds?.[i] || artist.toLowerCase().replace(/ /g, "-")}`}
                  className="hover:text-foreground hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  {artist}
                </Link>
                {i < music.artist.length - 1 && ", "}
              </span>
            ))}
          </span>
        </div>
      </div>

      <span className="text-sm text-muted-foreground font-medium hidden lg:block absolute left-1/2 -translate-x-1/2">
        {music.duration}
      </span>

      <div className="flex items-center gap-1 sm:gap-3">
        <LikeButton
          initialIsLiked={isLiked}
          size={20}
          itemId={music.id}
          itemType="track"
          onLiked={(nextIsLiked: boolean) => {
            setIsLiked(nextIsLiked);
            if (nextIsLiked) {
              setIsDisliked(false);
            }
          }}
        />
        <DislikeButton
          initialIsDisliked={isDisliked}
          size={20}
          itemId={music.id}
          itemType="track"
          onDisliked={(nextIsDisliked: boolean) => {
            setIsDisliked(nextIsDisliked);
            if (nextIsDisliked) {
              setIsLiked(false);
            }
          }}
        />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground hover:bg-transparent cursor-pointer"
            >
              <MoreHorizontal size={20} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => addToQueue(music)} className="cursor-pointer">
              Ajouter à la file d'attente
            </DropdownMenuItem>

            {isInsideOwnedPlaylist && (
              <DropdownMenuItem
                onClick={handleRemoveFromPlaylist}
                className="cursor-pointer text-destructive focus:text-destructive"
              >
                Retirer de la playlist
              </DropdownMenuItem>
            )}

            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="cursor-pointer">
                Ajouter à une playlist
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  {playlists.length > 0 ? (
                    playlists.map((p) => (
                      <DropdownMenuItem
                        key={p.id}
                        onClick={(e) => handleAddToPlaylist(e, p.id)}
                        className="cursor-pointer"
                      >
                        {p.name}
                      </DropdownMenuItem>
                    ))
                  ) : (
                    <DropdownMenuItem disabled>Aucune playlist</DropdownMenuItem>
                  )}
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>

            <PinActionSubMenu itemId={music.id} itemType="track" />

            <DropdownMenuItem
              className="cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                if (music.artistIds && music.artistIds.length > 0) {
                  router.push(`/artist/${music.artistIds[0]}`);
                }
              }}
            >
              Voir l'artiste
            </DropdownMenuItem>
            {music.albumId && (
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/album/${music.albumId}`);
                }}
              >
                Voir l'album
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
