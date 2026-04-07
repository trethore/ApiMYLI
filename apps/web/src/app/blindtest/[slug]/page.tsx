"use client";

import Nav from "@/components/Nav";
import MusicItem from "@/components/MusicItem";
import { Music } from "@/types/music";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Play, Edit, Trash2, ListMinus } from "lucide-react";
import Image from "@/components/ImageWithFallback";
import SectionTitle from "@/components/SectionTitle";
import PinActionSubMenu from "@/components/PinActionSubMenu";
import { usePlaylist } from "@/context/PlaylistContext";
import { useToast } from "@/context/ToastContext";
import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { usePlayer } from "@/context/PlayerContext";
import { getBlindtestQuery, toMusic } from "@/lib/api-client";
import { ApiBlindtest } from "@/lib/api-client";
import { useBlindtest } from "@/context/BlindtestContext";

export default function BlindtestPage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter();
  const { slug } = use(params);
  const blindtestId = slug;

  const { token, requireAuth } = useAuth();
  const { playTrack, setQueueList } = usePlayer();

  const { updateBlindtest, deleteBlindtest, autocompleteBlindtest } = useBlindtest();

  const [blindtest, setBlindtest] = useState<ApiBlindtest | null>(null);
  const [tracks, setTracks] = useState<Music[]>([]);
  const [loading, setLoading] = useState(true);

  // Derived state
  const [displayName, setDisplayName] = useState(slug.replace(/-/g, " "));
  const [displayImage, setDisplayImage] = useState("/placeholder-album.jpg");
  const [displayOwner, setDisplayOwner] = useState("Utilisateur inconnu");
  const [isOwned, setIsOwned] = useState(false);
  const [isFull, setIsFull] = useState(false);

  // Edit Dialog State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editImage, setEditImage] = useState("");
  const { showToast } = useToast();

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast("Lien copié !");
  };

  const fetchBlindtest = async () => {
    try {
      setLoading(true);
      const data = await getBlindtestQuery(blindtestId, token);
      if (data) {
        setBlindtest(data);

        if (data.tracks) {
          setTracks(data.tracks.map(toMusic));
        }

        if (data.name) {
          setDisplayName(data.name);
          setEditName(data.name);
        }
        if (data.ownerDisplayName) setDisplayOwner(data.ownerDisplayName);
        if (data.isEditable) setIsOwned(true);
        if (data.totalTracksCount >= data.length) setIsFull(true)
      }
    } catch (err) {
      console.error("Error fetching blindtest", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlindtest();
  }, [token]);

  const handleEdit = async () => {
    if (editName.trim()) {
      await updateBlindtest(blindtestId, editName);
      setIsEditOpen(false);
      setDisplayName(editName);
      if (editImage) setDisplayImage(editImage);
    }
  };

  const handleAutocomplete = async () => {
    await autocompleteBlindtest(blindtestId, [], [], 20);
    await fetchBlindtest();
  };

  const handleDelete = async () => {
    await deleteBlindtest(blindtestId);
    router.push("/blindtests");
  };

  const handlePlayBlindtest = () => {
    requireAuth(() => {
      if (tracks.length > 0) {
        playTrack(tracks[0]);
        setQueueList(tracks.slice(1));
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col font-sans bg-background text-foreground pb-24 lg:pb-0">
        <Nav />
        <main className="flex-1 p-4 lg:p-8 flex items-center justify-center max-w-5xl mx-auto w-full">
          <p className="text-muted-foreground">Chargement...</p>
        </main>
      </div>
    );
  }

  if (!blindtest) {
    return (
      <div className="min-h-screen flex flex-col font-sans bg-background text-foreground pb-24 lg:pb-0">
        <Nav />
        <main className="flex-1 p-4 lg:p-8 flex flex-col items-center justify-center max-w-5xl mx-auto w-full text-center">
          <SectionTitle title="Blindtest introuvable" />
          <p className="text-muted-foreground mt-4">Le blindtest que vous cherchez n&apos;existe pas ou a été supprimé.</p>
          <Button className="mt-6" onClick={() => router.push("/blindtests")}>
            Retour à mes blindtests
          </Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans bg-background text-foreground pb-24 lg:pb-0">
      <Nav />
      <main className="flex-1 p-4 lg:p-8 max-w-5xl mx-auto w-full">
        {/* Blindtest Header - Mobile Layout Focus */}
        <div className="flex flex-col items-center mb-8">
          {/* Blindtest Image - Centered */}
          <div className="relative w-48 h-48 sm:w-64 sm:h-64 shadow-xl rounded-lg overflow-hidden mb-6 group">
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-muse-sky-blue)] to-[var(--color-muse-pink)] opacity-80" />
            {displayImage && displayImage !== "/placeholder-album.jpg" && (
              <Image src={displayImage} alt={displayName} fill className="object-cover z-10" />
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
              <SectionTitle
                title={displayName}
                className="mt-0 text-2xl sm:text-4xl leading-tight"
              />
              <p className="text-lg text-muted-foreground font-medium flex items-center gap-2">
                Blindtest par {displayOwner}
                {isOwned && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-foreground"
                    onClick={() => setIsEditOpen(true)}
                  >
                    <Edit className="w-4 h-4 cursor-pointer" />
                  </Button>
                )}
              </p>
              <p className="text-sm text-muted-foreground/80 lowercase mt-1">
                Blindtest • {tracks.length} titres
              </p>
            </div>

            <div className="flex items-center gap-2">
              {isOwned && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="rounded-full hover:bg-destructive/20 hover:text-destructive transition-colors cursor-pointer flex-shrink-0"
                    >
                      <Trash2 size={24} />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Cette action est irréversible. Cela supprimera définitivement votre blindtest
                        &quot;{displayName}&quot;.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-destructive hover:bg-destructive/90 cursor-pointer"
                      >
                        Supprimer
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="rounded-full hover:bg-secondary/20 hover:text-foreground transition-colors cursor-pointer flex-shrink-0"
                  >
                    <MoreHorizontal size={28} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <PinActionSubMenu itemId={blindtestId} itemType="blindtest" />
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={handleShare}
                  >
                    Partager
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Play Button */}
          <div className="w-full px-2 sm:px-8 mt-6 flex justify-between">
            <Button
              onClick={handlePlayBlindtest}
              className="w-full sm:w-auto text-foreground font-bold text-lg py-6 rounded-full flex items-center gap-2 bg-gradient-to-r from-[var(--color-muse-sky-blue)] to-[var(--color-muse-pink)] hover:cursor-pointer disabled:opacity-50"
              disabled={tracks.length === 0}
            >
              <Play className="fill-current" /> Lecture
            </Button>

            {!isFull && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="secondary"
                    className="rounded-full transition-colors cursor-pointer flex-shrink-0"
                  >
                    <ListMinus size={24} /> Autocompléter
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Autocomplétion</AlertDialogTitle>
                    <AlertDialogDescription>
                      Cette action remplira le reste de votre blindtest automatiquement en fonction des titres déjà présents
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleAutocomplete}
                      className="bg-secondary hover:bg-secondary/80 cursor-pointer"
                    >
                      Autocompléter
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}

          </div>
        </div>

        {/* Tracklist */}
        <div className="bg-background/50 rounded-xl p-2 sm:p-4">
          <div className="flex flex-col gap-1">
            {tracks.length > 0 ? (
              tracks.map((track, index) => (
                <MusicItem key={track.id} music={track} index={index} showImage={true} />
              ))
            ) : (
              <div className="text-center text-muted-foreground py-12">
                Ce blindtest est vide.
              </div>
            )}
          </div>
        </div>

        {/* Edit Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="bg-card border-border sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Modifier le blindtest</DialogTitle>
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
                <Label htmlFor="edit-image">URL de l&apos;image (optionnelle)</Label>
                <Input
                  id="edit-image"
                  placeholder="https://..."
                  value={editImage}
                  onChange={(e) => setEditImage(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleEdit}>Sauvegarder</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
