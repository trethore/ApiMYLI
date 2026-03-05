import { usePlayer } from "@/context/PlayerContext";
import { Button } from "@/components/ui/button";
import { Music } from "@/types/music";
import { Trash2, X, Play } from "lucide-react";
import Image from "next/image";

interface QueueListProps {
  className?: string;
}

export default function QueueList({ className }: QueueListProps) {
  const { queue, removeFromQueue, clearQueue, playTrack, currentTrack } = usePlayer();

  if (queue.length === 0) {
    return (
      <div className={`p-4 text-center text-muted-foreground ${className}`}>
        File d'attente vide
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="flex items-center justify-between p-2 border-b border-border/50">
        <h3 className="font-semibold text-sm">File d'attente ({queue.length})</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearQueue}
          className="text-xs text-muted-foreground hover:text-destructive h-8 px-2"
        >
          Tout effacer
        </Button>
      </div>

      <div className="h-[300px] w-full rounded-md overflow-y-auto custom-scrollbar">
        <div className="flex flex-col gap-1 p-2">
          {queue.map((track: Music, index) => (
            <div
              key={`${track.id}-${index}`}
              className="flex items-center gap-3 p-2 rounded-md hover:bg-white/5 group"
            >
              <div className="relative h-10 w-10 min-w-10 rounded overflow-hidden bg-muted">
                {track.image && (
                  <Image src={track.image} alt={track.title} fill className="object-cover" />
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-white"
                    onClick={() => playTrack(track)}
                  >
                    <Play size={16} fill="currentColor" />
                  </Button>
                </div>
              </div>

              <div className="flex-1 min-w-0 overflow-hidden">
                <p className="text-sm font-medium truncate">{track.title}</p>
                <p className="text-xs text-muted-foreground truncate">{track.artist.join(", ")}</p>
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeFromQueue(track.id)}
              >
                <X size={16} />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
