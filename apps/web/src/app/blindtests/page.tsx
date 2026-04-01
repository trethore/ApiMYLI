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
import { useAuth } from "@/context/AuthContext";
import { usePlayer } from "@/context/PlayerContext";
import { useRouter } from "next/navigation";
import { useBlindtest } from "@/context/BlindtestContext";

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

export default function Blindtests() {
  const { blindtests, loadBlindtests, createBlindtest, addCompulsoryTrackToBlindtest, deleteBlindtest, updateBlindtest, removeCompulsoryTrackFromBlindtest, isOwnedBlindtest } = useBlindtest();
  const { isAuthenticated, token } = useAuth();
  const { history } = usePlayer();
  const router = useRouter();

  const [newBlindtestName, setNewBlindtestName] = useState<string>("");
  const [newBlindtestLength, setNewBlindtestLength] = useState<string>("10");
  const [newBlindtestDifficulty, setNewBlindtestDifficulty] = useState<string>("10");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fallback local history if not authenticated
  const localHistoryContent = history.map((t) => ({ ...t, type: "Track" as const })).reverse().slice(0, 10);

  useEffect(() => {
    const fetchBlindtests = async () => {
      const localToken = localStorage.getItem("muse_token");
      if (!isAuthenticated && !localToken) {
        router.push("/login");
        return;
      }

      const activeToken = token || (localToken as string);
      if (activeToken) {
        try {
        } catch (err) {
        } finally {
          setLoading(false);
        }
      }
    };

    fetchBlindtests();
  }, [isAuthenticated, router, token, history, localHistoryContent]);

  if (!isAuthenticated) {
    return null;
  }

  const handleCreate = async () => {
    if (newBlindtestName?.trim()) {

      // TODO : update cration with all attributes indcluded

      await createBlindtest(newBlindtestName?.trim());
      setNewBlindtestName("");
      setIsCreateOpen(false);

      loadBlindtests();
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
              Blindtests
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
                      onChange={(e) => setNewBlindtestLength(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                    />

                    <Label htmlFor="name">Temps pour deviner (s)</Label>
                    <Slider
                      step={1}
                      max={99}
                      min={0}
                      value={[parseInt(newBlindtestDifficulty)]}
                      onValueChange={(vals: number[]) => setNewBlindtestDifficulty(vals[0].toString())}
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
