"use client";

import { useAuth } from "@/context/AuthContext";
import { pinTrackMutation, pinAlbumMutation, pinArtistMutation, pinPlaylistMutation, unpinItemMutation } from "@/lib/api-client";
import {
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSubContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner"; // Assuming sonner is used, or replace with console/alert

interface PinActionSubMenuProps {
  itemId: string;
  itemType: "track" | "album" | "artist" | "playlist";
}

export default function PinActionSubMenu({ itemId, itemType }: PinActionSubMenuProps) {
  const { token, requireAuth } = useAuth();

  const handlePin = async (slot: number) => {
    requireAuth(async () => {
      try {
        if (!token) return;
        
        switch (itemType) {
          case "track":
            await pinTrackMutation(slot, itemId, token);
            break;
          case "album":
            await pinAlbumMutation(slot, itemId, token);
            break;
          case "artist":
            await pinArtistMutation(slot, itemId, token);
            break;
          case "playlist":
            await pinPlaylistMutation(slot, itemId, token);
            break;
        }
        toast.success(`Épinglé à l'emplacement ${slot}`);
        // Optionally refresh the page or context if needed to update Home/Library immediately
      } catch (err: any) {
        console.error("Failed to pin item", err);
        toast.error(`Erreur: ${err.message || "Impossible d'épingler l'élément"}`);
      }
    });
  };

  const handleUnpin = async (slot: number) => {
    requireAuth(async () => {
      try {
        if (!token) return;
        await unpinItemMutation(slot, token);
        toast.success(`Emplacement ${slot} libéré`);
      } catch (err: any) {
        console.error("Failed to unpin item", err);
        toast.error(`Erreur: ${err.message || "Impossible de désépingler"}`);
      }
    });
  };

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger className="cursor-pointer">
        Épingler / Désépingler
      </DropdownMenuSubTrigger>
      <DropdownMenuPortal>
        <DropdownMenuSubContent>
          <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
            Épingler à...
          </div>
          {[1, 2, 3, 4].map((slot) => (
            <DropdownMenuItem key={`pin-${slot}`} onClick={() => handlePin(slot)} className="cursor-pointer">
              Emplacement {slot}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
            Libérer...
          </div>
          {[1, 2, 3, 4].map((slot) => (
            <DropdownMenuItem key={`unpin-${slot}`} onClick={() => handleUnpin(slot)} className="cursor-pointer text-destructive focus:text-destructive">
              Vider l'emplacement {slot}
            </DropdownMenuItem>
          ))}
        </DropdownMenuSubContent>
      </DropdownMenuPortal>
    </DropdownMenuSub>
  );
}
