"use client";
import Nav from "@/components/Nav";
import SectionTitle from "@/components/SectionTitle";
import ContentGrid from "@/components/ContentGrid";
import CoverCarousel from "@/components/CoverCarousel";
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
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { usePlaylist } from "@/context/PlaylistContext";
import { useAuth } from "@/context/AuthContext";
import { usePlayer } from "@/context/PlayerContext";
import { useRouter } from "next/navigation";
import { getLikedTracksQuery, getMyPinnedItemsQuery, getMyTrackHistoryQuery, toMusic } from "@/lib/api-client";
import { Music } from "@/types/music";

type ContentType = "Album" | "Single" | "Artiste" | "Playlist" | "Track";
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
  const { playlists, createPlaylist } = usePlaylist();
  const { isAuthenticated, token } = useAuth();
  const { history } = usePlayer();
  const router = useRouter();

  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [likedTracks, setLikedTracks] = useState<(Music & { type: "Track" })[]>([]);
  const [pinnedContent, setPinnedContent] = useState<ContentList>([]);
  const [historyContent, setHistoryContent] = useState<ContentList>([]);
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
              if (item.itemType === "PLAYLIST" && item.playlist) {
                return {
                  id: item.playlist.playlistId,
                  name: item.playlist.name || "Playlist",
                  type: "Playlist" as const,
                  image: "/placeholder-album.jpg", // API lacks playlist image atm
                  link: `/playlist/${item.playlist.playlistId}`,
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
  }, [isAuthenticated, router, token, history]);

  if (!isAuthenticated) {
    return null;
  }

  const handleCreate = () => {
    if (newPlaylistName.trim()) {
      createPlaylist(newPlaylistName.trim());
      setNewPlaylistName("");
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
              Ma Bibliothèque
            </h1>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-[var(--color-muse-sky-blue)] to-[var(--color-muse-pink)] text-foreground font-bold hover:scale-105 transition-transform flex items-center gap-2">
                  <Plus className="w-5 h-5" /> Créer
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Créer une playlist</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom de la playlist</Label>
                    <Input
                      id="name"
                      placeholder="Ma super playlist..."
                      value={newPlaylistName}
                      onChange={(e) => setNewPlaylistName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleCreate()}
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

          {!loading && pinnedContent.length > 0 && (
            <div>
              <SectionTitle title="Épinglés" className="mt-0" />
              <ContentGrid items={pinnedContent as any} />
            </div>
          )}

          <div>
            <SectionTitle title="Mes Playlists" className="mt-0" />
            {playlists.length > 0 ? (
              <ContentGrid
                items={playlists.map((p) => ({
                  ...p,
                  type: "Playlist",
                  link: `/playlist/${p.id}`,
                }))}
              />
            ) : (
              <p className="text-muted-foreground mt-4">Vous n'avez pas encore de playlist.</p>
            )}
          </div>

          {historyContent.length > 0 && (
            <div>
              <SectionTitle title="Historique" className="mt-0" />
              <CoverCarousel items={historyContent as any} />
            </div>
          )}

          <div>
            <SectionTitle title="Like" className="mt-0" />
            {likedTracks.length > 0 ? (
              <ContentGrid items={likedTracks} />
            ) : (
              <p className="text-muted-foreground mt-4">Vous n'avez pas de titres likés.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
