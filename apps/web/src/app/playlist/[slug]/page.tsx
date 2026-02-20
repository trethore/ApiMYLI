"use client"
import Nav from "@/components/Nav";
import { Music } from "@/types/music";
import MusicItem from "@/components/MusicItem";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Play, Edit, Trash2 } from "lucide-react";
import Image from "next/image";
import LikeButton from "@/components/LikeButton";
import SectionTitle from "@/components/SectionTitle";
import { usePlaylist } from "@/context/PlaylistContext";
import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function PlaylistPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const router = useRouter();
  const slug = use(params).slug;
  const { playlists, isOwnedPlaylist, deletePlaylist, updatePlaylist } = usePlaylist();
  
  // State for Edit Dialog
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editImage, setEditImage] = useState("");

  // Find if this is a user playlist
  const userPlaylist = playlists.find(p => p.id === slug);
  const isOwned = isOwnedPlaylist(slug);

  // Initialize edit state when playlist is found
  useEffect(() => {
      if (userPlaylist) {
          setEditName(userPlaylist.name);
          setEditImage(userPlaylist.image || "");
      }
  }, [userPlaylist])

  // Mock Data Fallback (if not a user playlist)
  const mockTracks: Music[] = Array.from({ length: 20 }).map((_, i) => ({
    id: `track-${i}`,
    title: `Playlist Track ${i + 1}`,
    artist: ["Artist Name", ...(i % 2 === 0 ? ["Feat. Artist"] : [])], 
    album: "Various Artists",
    image: "/placeholder-music.jpg",
    duration: "3:45",
    isLiked: i % 3 === 0,
  }));

  const fallbackPlaylist = {
    id: slug,
    name: slug.replace(/-/g, " "),
    artist: "Muse",
    image: "/placeholder-album.jpg", 
    type: "Playlist" as const,
    tracks: mockTracks,
  };

  const playlist = userPlaylist || fallbackPlaylist;

  const handleEdit = () => {
      if (editName.trim()) {
          updatePlaylist(playlist.id, editName, editImage);
          setIsEditOpen(false);
      }
  }

  const handleDelete = () => {
      deletePlaylist(playlist.id);
      router.push("/library");
  }

  return (
    <div className="min-h-screen flex flex-col font-sans bg-background text-foreground pb-24 lg:pb-0">
      <Nav />
      <main className="flex-1 p-4 lg:p-8 max-w-5xl mx-auto w-full">
        {/* Playlist Header - Mobile Layout Focus */}
        <div className="flex flex-col items-center mb-8">
            {/* Playlist Image - Centered */}
            <div className="relative w-48 h-48 sm:w-64 sm:h-64 shadow-xl rounded-lg overflow-hidden mb-6 group">
                 {/* Placeholder gradient if no image */}
                 <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-muse-sky-blue)] to-[var(--color-muse-pink)] opacity-80" />
                 {playlist.image && playlist.image !== "/placeholder-album.jpg" && (
                    <Image src={playlist.image} alt={playlist.name} fill className="object-cover z-10" />
                 )}
                 {/* Hover Edit Overlay for Image */}
                 {isOwned && (
                    <div 
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity z-20 flex items-center justify-center cursor-pointer"
                        onClick={() => setIsEditOpen(true)}
                    >
                        <Edit className="w-8 h-8 text-white" />
                    </div>
                 )}
            </div>

            {/* Metadata & Actions Row */}
            <div className="w-full flex justify-between px-2 sm:px-8">
                <div className="flex flex-col text-left">
                    <SectionTitle title={playlist.name} className="mt-0 text-2xl sm:text-4xl leading-tight" />
                    <p className="text-lg text-muted-foreground font-medium flex items-center gap-2">
                        Playlist par {playlist.artist}
                        {isOwned && (
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground" onClick={() => setIsEditOpen(true)}>
                                <Edit className="w-4 h-4 cursor-pointer" />
                            </Button>
                        )}
                    </p>
                    <p className="text-sm text-muted-foreground/80 lowercase mt-1">
                        {playlist.type} • {playlist.tracks.length} titres
                    </p>
                </div>

                <div className="flex items-center gap-2">
                     <LikeButton initialIsLiked={true} size={28} className="rounded-full hover:bg-secondary/20 h-10 w-10 flex-shrink-0" iconClassName="w-7 h-7 cursor-pointer" itemId={playlist.id} itemType="playlist" />
                     {isOwned && (
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button size="icon" variant="ghost" className="rounded-full hover:bg-destructive/20 hover:text-destructive transition-colors cursor-pointer flex-shrink-0">
                                    <Trash2 size={24} />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Cette action est irréversible. Cela supprimera définitivement votre playlist "{playlist.name}".
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90 cursor-pointer">
                                        Supprimer
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                     )}
                     <Button size="icon" variant="ghost" className="rounded-full hover:bg-secondary/20 hover:text-foreground transition-colors cursor-pointer flex-shrink-0">
                        <MoreHorizontal size={28} />
                     </Button>
                </div>
            </div>
            
            {/* Play Button (Optional but common) */}
             <div className="w-full px-2 sm:px-8 mt-6">
                <Button className="w-full sm:w-auto text-foreground font-bold text-lg py-6 rounded-full flex items-center gap-2 bg-gradient-to-r from-[var(--color-muse-sky-blue)] to-[var(--color-muse-pink)] hover:cursor-pointer disabled:opacity-50" disabled={playlist.tracks.length === 0}>
                    <Play className="fill-current" /> Lecture
                </Button>
             </div>
        </div>

        {/* Tracklist */}
        <div className="bg-background/50 rounded-xl p-2 sm:p-4">
            <div className="flex flex-col gap-1">
                {playlist.tracks.length > 0 ? (
                    playlist.tracks.map((track, index) => (
                        <MusicItem key={track.id} music={track} index={index} showImage={true} />
                    ))
                ) : (
                    <div className="text-center text-muted-foreground py-12">
                        Cette playlist est vide.
                    </div>
                )}
            </div>
        </div>

        {/* Edit Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <DialogContent className="bg-card border-border sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Modifier la playlist</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="edit-name">Nom</Label>
                        <Input
                            id="edit-name"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="edit-image">URL de l'image (optionnelle)</Label>
                        <Input
                            id="edit-image"
                            placeholder="https://..."
                            value={editImage}
                            onChange={(e) => setEditImage(e.target.value)}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsEditOpen(false)}>Annuler</Button>
                    <Button onClick={handleEdit}>Sauvegarder</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

      </main>
    </div>
  );
}
