"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { likeTrackMutation, unlikeTrackMutation } from "@/lib/api-client";
import { useAuth } from "@/context/AuthContext";

interface LikeButtonProps {
  initialIsLiked?: boolean;
  size?: number;
  className?: string;
  iconClassName?: string;
  itemId: string;
  itemType: "track" | "album" | "artist" | "playlist";
}

export default function LikeButton({
  initialIsLiked = false,
  size = 20,
  className,
  iconClassName,
  itemId,
  itemType,
}: LikeButtonProps) {
  const { token, requireAuth } = useAuth();
  const [isLiked, setIsLiked] = useState(initialIsLiked);

  const toggleLike = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering parent click
    
    // Pour l'instant on ne supporte en back-end QUE le like/unlike des tracks
    if (itemType !== "track") {
      console.warn("Liking is ONLY supported for music tracks currently.");
      return;
    }
    
    requireAuth(async () => {
      const newState = !isLiked;
      setIsLiked(newState); // Optimistic UI
      
      try {
        if (newState) {
          await likeTrackMutation(itemId, token!);
        } else {
          await unlikeTrackMutation(itemId, token!);
        }
      } catch (err) {
        console.error("Failed to like/unlike track", err);
        setIsLiked(!newState); // revert if failed
      }
    });
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleLike}
      className={cn(
        "text-muted-foreground hover:text-primary hover:bg-transparent transition-colors cursor-pointer",
        className,
      )}
    >
      <Heart
        size={size}
        className={cn("transition-colors", isLiked && "fill-primary text-primary", iconClassName)}
      />
    </Button>
  );
}
