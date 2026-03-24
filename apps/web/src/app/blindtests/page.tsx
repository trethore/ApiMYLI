"use client";
import Nav from "@/components/Nav";
import SectionTitle from "@/components/SectionTitle";
import ContentGrid from "@/components/ContentGrid";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { usePlaylist } from "@/context/PlaylistContext";
import { useAuth } from "@/context/AuthContext";
import { usePlayer } from "@/context/PlayerContext";
import { useRouter } from "next/navigation";
import { getLikedTracksQuery, getMyPinnedItemsQuery, getMyTrackHistoryQuery, toMusic } from "@/lib/api-client";
import { Music } from "@/types/music";

type ContentType = "Album" | "Single" | "Artiste" | "Playlist" | "Blindtest" | "Track";
type Content = {
  id: string;
  name?: string;
  title?: string;
  type: ContentType;
  imageUrl?: string;
  image?: string;
  link?: string;
  artist?: string | string[];
  duration?: string;
  isLiked?: boolean;
  tracks?: unknown[];
  stats?: unknown;
  popularTracks?: unknown[];
  albums?: unknown[];
  singles?: unknown[];
};
type ContentList = Content[];

export default function Library() {
  const { blindtests, createPlaylist } = usePlaylist();
  const { isAuthenticated, token } = useAuth();
  const { history } = usePlayer();
  const router = useRouter();

  const [newBlindtestName, setNewBlindtestName] = useState("");
  const [newBlindtestLength, setNewBlindtestLength] = useState<number>(10);
  const [newBlindtestDifficulty, setNewBlindtestDifficulty] = useState<number>(10);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fallback local history if not authenticated
  const localHistoryContent = history.map((t) => ({ ...t, type: "Track" as const })).reverse().slice(0, 10);

  useEffect(() => {
    const fetchLibraryData = async () => {
      const localToken = localStorage.getItem("muse_token");
      if (!isAuthenticated && !localToken) {
        router.push("/login");
        return;
      }

      const activeToken = token || (localToken as string);
      if (activeToken) {
        try {
          const [likedRes, pinnedRes, historyRes] = await Promise.all([
            getLikedTracksQuery(activeToken),
            getMyPinnedItemsQuery(activeToken),
            getMyTrackHistoryQuery(12, activeToken),
          ]);

          setLikedTracks(likedRes.map((t) => ({ ...toMusic(t), type: "Track" as const })));

          // Format Pinned Items
          const formattedPinned = pinnedRes
            .sort((a, b) => a.slot - b.slot)
            .map((item) => {
              if (item.itemType === "TRACK" && item.track) {
                const m = toMusic(item.track);
                return { ...m, type: "Track" as const };
              }
              if (item.itemType === "ALBUM" && item.album) {
                return {
                  id: item.album.albumId,
                  name: item.album.title || "Album Inconnu",
                  type: "Album" as const,
                  image: item.album.imageUrl || "/placeholder-album.jpg",
                  link: `/album/${item.album.albumId}`,
                  artist: item.album.artists.map((a) => a.name).join(", "),
                };
              }
              if (item.itemType === "ARTIST" && item.artist) {
                return {
                  id: item.artist.artistId,
                  name: item.artist.name || "Artiste Inconnu",
                  type: "Artiste" as const,
                  image: item.artist.imageUrl || "/placeholder-artist.jpg",
                  link: `/artist/${item.artist.artistId}`,
                };
              }
              if (item.itemType === "BLINDTEST" && item.blindtest) {
                return {
                  id: item.blindtest.blindtestId,
                  name: item.blindtest.name || "Blindtest",
                  type: "Blindtest" as const,
                  link: `/playlist/${item.blindtest.blindtestId}`,
                };
              }
              return null;
            })
            .filter(Boolean) as ContentList;
          setPinnedContent(formattedPinned);

          // Format History
          const formattedHistory = historyRes.map((h) => {
            const m = toMusic(h.track);
            return { ...m, type: "Track" as const };
          });
          setHistoryContent(formattedHistory);
        } catch (err) {
          console.error("Failed to load library data", err);
          setHistoryContent(localHistoryContent);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchLibraryData();
  }, [isAuthenticated, router, token, history, localHistoryContent]);

  if (!isAuthenticated) {
    return null;
  }

  const handleCreate = () => {
    if (newBlindtestName.trim()) {
      createPlaylist(newBlindtestName.trim());
      setNewBlindtestName("");
      setIsCreateOpen(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-background text-foreground">
      <Nav />
      {/* Increased padding-top for desktop to account for fixed Nav */}
      <main className="flex-1 lg:pt-8 pb-24 lg:pb-8 mx-4 md:mx-8 lg:mx-48">
        <div className="flex flex-col gap-8">
          {/* Header Action Row */}
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-bold font-[family-name:var(--font-protest-strike)]">
              Mes blindtests
            </h1>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-[var(--color-muse-sky-blue)] to-[var(--color-muse-pink)] text-foreground font-bold hover:scale-105 transition-transform flex items-center gap-2">
                  <Plus className="w-5 h-5" /> Créer
                </Button>
              </DialogTrigger>

              <DialogContent className="bg-card border-border sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Créer un blindtest</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom du blindtest</Label>
                    <Input
                      id="name"
                      placeholder="Mon super blindtest..."
                      value={newBlindtestName}
                      onChange={(e) => setNewBlindtestName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                    />

                    <SectionTitle title="Paramètres" className="mt-0" />

                    <Label htmlFor="name">Nombre de morceaux</Label>
                    <Input
                      id="length"
                      type="number"
                      max={99}
                      min={0}
                      value={newBlindtestLength}
                      onChange={(e) => setNewBlindtestLength(parseInt(e.target.value))}
                      onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                    />

                    <Label htmlFor="name">Temps pour deviner (s)</Label>
                    <Slider
                      step={1}
                      max={99}
                      min={0}
                      value={[newBlindtestDifficulty]}
                      onValueChange={(vals: number[]) => setNewBlindtestDifficulty(vals[0])}
                    />

                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Annuler
                  </Button>
                  <Button onClick={handleCreate}>Créer</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div>
            <SectionTitle title="Mes blindtests" className="mt-0" />
            {blindtests.length > 0 ? (
              <ContentGrid
                items={blindtests.map((p: any) => ({
                  ...p,
                  type: "Blindtest",
                  link: `/blindtest/${p.id}`,
                }))}
              />
            ) : (
              <p className="text-muted-foreground mt-4">Vous n&apos;avez pas encore de blindtest.</p>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
