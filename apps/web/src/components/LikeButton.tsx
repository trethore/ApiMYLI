"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const [isLiked, setIsLiked] = useState(initialIsLiked);

  const toggleLike = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering parent click
    const newState = !isLiked;
    setIsLiked(newState);
    console.log(`${newState ? "like" : "dislike"} ${itemType} ${itemId}`);
    // TODO: Call API to toggle like for itemId
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
