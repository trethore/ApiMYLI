import { usePlayer } from "@/context/PlayerContext";
import { Button } from "@/components/ui/button";
import { Music } from "@/types/music";
import { X, Play } from "lucide-react";
import Image from "@/components/ImageWithFallback";
import { GripVertical } from "lucide-react";
import {
  DndContext,
  closestCenter,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import SortableItem from "@/components/SortableItem";

interface QueueListProps {
  className?: string;
}

export default function QueueList({ className }: QueueListProps) {
  const { queue, removeFromQueue, clearQueue, playTrack, reorderQueue } = usePlayer();

  if (queue.length === 0) {
    return (
      <div className={`p-4 text-center text-muted-foreground ${className}`}>
        File d&apos;attente vide
      </div>
    );
  }

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = queue.findIndex((t) => t.id === active.id);
    const newIndex = queue.findIndex((t) => t.id === over.id);

    reorderQueue(oldIndex, newIndex);
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="flex items-center justify-between p-2 border-b border-border/50">
        <h3 className="font-semibold text-sm">File d&apos;attente ({queue.length})</h3>
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
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext
            items={queue.map((t) => t.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex flex-col gap-1 p-2">
              {queue.map((track: Music) => (
                <SortableItem key={track.id} id={track.id}>
                  {({ listeners, attributes }) => (
                    <div className="flex items-center gap-3 p-2 rounded-md hover:bg-white/5 group">

                      {/* 🟣 DRAG HANDLE */}
                      <div
                        {...listeners}
                        {...attributes}
                        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
                      >
                        <GripVertical size={16} />
                      </div>

                      {/* IMAGE */}
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

                      {/* TEXT */}
                      <div className="flex-1 min-w-0 overflow-hidden">
                        <p className="text-sm font-medium truncate">{track.title}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {track.artist.join(", ")}
                        </p>
                      </div>

                      {/* REMOVE BUTTON */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeFromQueue(track.id)}
                      >
                        <X size={16} />
                      </Button>
                    </div>
                  )}
                </SortableItem>
              ))}
            </div>

          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}
