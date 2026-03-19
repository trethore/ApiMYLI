"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Ban } from "lucide-react";
import { cn } from "@/lib/utils";
import { dislikeTrackMutation, undislikeTrackMutation } from "@/lib/api-client";
import { useAuth } from "@/context/AuthContext";
import { usePlayer } from "@/context/PlayerContext";

interface DislikeButtonProps {
  initialIsDisliked?: boolean;
  size?: number;
  className?: string;
  iconClassName?: string;
  itemId: string;
  itemType: "track" | "album" | "artist" | "playlist";
  onDisliked?: (newState: boolean) => void;
}

export default function DislikeButton({
  initialIsDisliked = false,
  size = 20,
  className,
  iconClassName,
  itemId,
  itemType,
  onDisliked,
}: DislikeButtonProps) {
  const { token, requireAuth } = useAuth();
  const { addDislikedId, removeDislikedId } = usePlayer();
  const [isDisliked, setIsDisliked] = useState(initialIsDisliked);

  useEffect(() => {
    setIsDisliked(initialIsDisliked ?? false);
  }, [itemId, initialIsDisliked]);

  const toggleDislike = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (itemType !== "track") {
      console.warn("Disliking is ONLY supported for music tracks currently.");
      return;
    }

    requireAuth(async () => {
      const newState = !isDisliked;
      setIsDisliked(newState);
      onDisliked?.(newState);

      try {
        if (newState) {
          await dislikeTrackMutation(itemId, token!);
          addDislikedId(itemId);
        } else {
          await undislikeTrackMutation(itemId, token!);
          removeDislikedId(itemId);
        }
      } catch (err) {
        console.error("Failed to dislike/undislike track", err);
        setIsDisliked(!newState);
        onDisliked?.(!newState);
        if (newState) {
          removeDislikedId(itemId);
        } else {
          addDislikedId(itemId);
        }
      }
    });
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleDislike}
      className={cn(
        "text-muted-foreground hover:text-destructive hover:bg-transparent transition-colors cursor-pointer",
        className,
      )}
    >
      <Ban
        size={size}
        className={cn(
          "transition-colors",
          isDisliked && "fill-destructive/20 text-destructive",
          iconClassName,
        )}
      />
    </Button>
  );
}
