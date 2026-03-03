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
import { useState } from "react";
import { usePlaylist } from "@/context/PlaylistContext";

export default function Library() {
  type ContentType = "Album" | "Single" | "Artiste" | "Playlist";
  type Content = {
    name: string;
    type: ContentType;
    imageUrl: string;
    link: string;
  };
  type ContentList = Content[];

  const pinnedContent: ContentList = [
    {
       name: "Album 1",
       type: "Album",
       imageUrl: "/placeholder-album.jpg",
       link: "/album/album-1"
    },
    {
       name: "Single Hit",
       type: "Single",
       imageUrl: "/placeholder-album.jpg",
       link: "/album/single-hit-1"
    },
    {
       name: "Top Artist",
       type: "Artiste",
       imageUrl: "/placeholder-album.jpg",
       link: "/artist/artist-top-1"
    },
    {
       name: "Morning Playlist",
       type: "Playlist",
       imageUrl: "/placeholder-album.jpg",
       link: "/playlist/playlist-morning-1"
    }
  ];

  const likedContent: ContentList = [
    {
       name: "Liked Song 1",
       type: "Single",
       imageUrl: "/placeholder-album.jpg",
       link: "/album/album-liked-1"
    },
    {
       name: "Best Album",
       type: "Album",
       imageUrl: "/placeholder-album.jpg",
       link: "/album/album-best-1"
    },
    {
       name: "Favorite Artist",
       type: "Artiste",
       imageUrl: "/placeholder-album.jpg",
       link: "/artist/artist-fav-1"
    },
    {
       name: "Chill Vibes",
       type: "Playlist",
       imageUrl: "/placeholder-album.jpg",
       link: "/playlist/playlist-chill-1"
    },
    {
       name: "Workout Mix",
       type: "Playlist",
       imageUrl: "/placeholder-album.jpg",
       link: "/playlist/playlist-workout-1"
    }
  ];

  // Access PlaylistContext
  const { playlists, createPlaylist } = usePlaylist();
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

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
            <h1 className="text-4xl font-bold font-[family-name:var(--font-protest-strike)]">Ma Bibliothèque</h1>
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
                      onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Annuler</Button>
                  <Button onClick={handleCreate}>Créer</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div>
             <SectionTitle title="Mes Playlists" className="mt-0" />
             {playlists.length > 0 ? (
                 <ContentGrid items={playlists.map((p: any) => ({
                     name: p.name,
                     type: "Playlist",
                     imageUrl: p.image,
                     link: `/playlist/${p.id}`
                 }))} />
             ) : (
                 <p className="text-muted-foreground mt-4">Vous n'avez pas encore de playlist.</p>
             )}
          </div>

          <div>
            <SectionTitle title="Épinglés" className="mt-0" />
            <ContentGrid items={pinnedContent} />
          </div>
          
          <div>
            <SectionTitle title="Historique" className="mt-0" />
            <CoverCarousel 
              items={[
                  { id: "hist-1", title: "Last Played Track", artist: ["Artist A"], album: "Album A", image: "/placeholder-music.jpg", duration: "3:00", isLiked: true, type: "Track" },
                  { id: "hist-2", name: "Recently Viewed Album", artist: "Artist B", image: "/placeholder-album.jpg", type: "Album", tracks: [] },
                  { id: "hist-3", name: "Artist C", image: "/placeholder-artist.jpg", stats: { totalListeners: "500k" }, popularTracks: [], albums: [], singles: [], type: "Artist" },
                  { id: "hist-4", title: "Song D", artist: ["Artist D"], album: "Album D", image: "/placeholder-music.jpg", duration: "4:00", isLiked: false, type: "Track" },
                  { id: "hist-5", name: "Playlist E", artist: "User", image: "/placeholder-album.jpg", type: "Playlist", tracks: [] },
              ]} 
            />
          </div>
          
          <div>
            <SectionTitle title="Titres Likés" className="mt-0" />
            <ContentGrid items={likedContent} />
          </div>
        </div>
      </main>
    </div>
  );
}
