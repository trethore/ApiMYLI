"use client";

import Nav from "@/components/Nav";
import SectionTitle from "@/components/SectionTitle";
import ContentGrid from "@/components/ContentGrid";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, Plus } from "lucide-react";
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
import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { usePlayer } from "@/context/PlayerContext";
import { useRouter } from "next/navigation";
import { useBlindtest } from "@/context/BlindtestContext";
import SearchBar from "@/components/SearchBar";
import SelectedItemsChips from "@/components/SelectedItemsChips";

export default function Blindtests() {
  const { blindtests, createBlindtest } = useBlindtest();
  const { isAuthenticated, token } = useAuth();
  const { history } = usePlayer();
  const router = useRouter();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isAdvancedOptionsOpen, setIsAdvancedOptionsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [newBlindtestName, setNewBlindtestName] = useState<string>("");
  const [newBlindtestLength, setNewBlindtestLength] = useState<string>("10");
  const [newBlindtestYearBegin, setNewBlindtestYearBegin] = useState<string>("");
  const [newBlindtestYearEnd, setNewBlindtestYearEnd] = useState<string>("");
  const [newBlindtestDifficulty, setNewBlindtestDifficulty] = useState<string>("10");
  const [newBlindtestInstrumental, setNewBlindtestInstrumental] = useState<string>("");

  const [newBlindtestArtists, setNewBlindtestArtists] = useState<{ id: string, name: string }[]>([]);
  const [newBlindtestCompulsoryTracks, setNewBlindtestCompulsoryTracks] = useState<{ id: string, name: string }[]>([]);
  const [newBlindtestGenres, setNewBlindtestGenres] = useState<{ id: string, name: string }[]>([]);

  const difficultyMeta = useMemo(() => {
    if (Number(newBlindtestDifficulty) < 5) {
      return { color: "red", text: "Difficile" };
    }
    if (Number(newBlindtestDifficulty) < 10) {
      return { color: "orange", text: "Moyen" };
    }
    return { color: "green", text: "Facile" };
  }, [Number(newBlindtestDifficulty)]);

  const years = Array.from({ length: 3000 - 1950 + 1 }, (_, i) => 1950 + i)

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

  const handleCreate = async (e: any) => {
    if (!newBlindtestName.trim() || !newBlindtestDifficulty || !newBlindtestLength) {
      return
    }

    await createBlindtest({
      name: newBlindtestName,
      length: parseInt(newBlindtestLength),
      difficulty: parseInt(newBlindtestDifficulty),
      yearBegin: parseInt(newBlindtestYearBegin),
      yearEnd: parseInt(newBlindtestYearEnd),
      instrumental: newBlindtestInstrumental === ""
        ? null
        : newBlindtestInstrumental === "true",
      genreIds: newBlindtestGenres.map(g => g.id),
      artistIds: newBlindtestArtists.map(a => a.id),
      compulsoryTrackIds: newBlindtestCompulsoryTracks.map(t => t.id),
    });

    // reset attrs
    setNewBlindtestName("");
    setNewBlindtestLength("10");
    setNewBlindtestDifficulty("10");
    setNewBlindtestYearBegin("");
    setNewBlindtestYearEnd("");

    setIsCreateOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-background text-foreground">
      <Nav />
      {/* Increased padding-top for desktop to account for fixed Nav */}
      <main className="flex-1 lg:pt-8 pb-24 lg:pb-8 mx-4 md:mx-8 lg:mx-48">

        {loading && (
          <>
            <div role="status" className="w-full flex justify-center pt-5">
              <svg aria-hidden="true" className="w-8 h-8 text-neutral-tertiary animate-spin fill-brand" viewBox="0 0 100 101" fill="blue" xmlns="http://www.w3.org/2000/svg">
                <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
              </svg>
              <span className="sr-only">Chargement...</span>
            </div>
          </>
        )}

        <div className="flex flex-col gap-8">
          {/* Header Action Row */}
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-bold font-[family-name:var(--font-protest-strike)]">
              Blindtests
            </h1>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-[var(--color-muse-sky-blue)] to-[var(--color-muse-pink)] text-foreground font-bold hover:scale-105 transition-transform flex items-center gap-2">
                  <Plus className="w-5 h-5" /> Générer
                </Button>
              </DialogTrigger>

              <DialogContent
                className="bg-card border-border sm:max-w-lg"
              >
                <form
                  className="space-y-4 py-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    const form = e.currentTarget as HTMLFormElement;

                    if (!form.checkValidity()) {
                      form.reportValidity();
                      return;
                    }

                    handleCreate(e);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      e.stopPropagation();

                      const form = e.currentTarget as HTMLFormElement;

                      if (!form.checkValidity()) {
                        form.reportValidity();
                        return;
                      }

                      handleCreate(e);
                    }
                  }}
                >
                  <DialogHeader>
                    <DialogTitle>Générer un blindtest</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom du blindtest</Label>
                    <Input
                      id="name"
                      placeholder="Mon super blindtest..."
                      value={newBlindtestName}
                      onChange={(e) => setNewBlindtestName(e.target.value)}
                      required
                    />

                    <Label>Nombre de morceaux</Label>
                    <Input
                      id="length"
                      type="number"
                      max={99}
                      min={0}
                      value={newBlindtestLength}
                      onChange={(e) => setNewBlindtestLength(e.target.value)}
                      required
                    />

                    <Label className="flex justify-between w-full items-center mt-5">
                      Temps pour deviner ({newBlindtestDifficulty}s)
                      <div style={{ color: difficultyMeta.color }}>
                        {difficultyMeta.text}
                      </div>
                    </Label>
                    <Slider
                      step={1}
                      max={20}
                      min={1}
                      value={[parseInt(newBlindtestDifficulty)]}
                      onValueChange={(vals: number[]) => setNewBlindtestDifficulty(vals[0].toString())}
                    />

                    <div
                      onClick={(_) => setIsAdvancedOptionsOpen(!isAdvancedOptionsOpen)}
                      className="w-full flex gap-2 justify-between items-center cursor-pointer mt-5">
                      <SectionTitle title="Génération avancée" className="mt-0!" />

                      {(!isAdvancedOptionsOpen &&
                        <ChevronRight size={24} />
                      )}
                      {(isAdvancedOptionsOpen &&
                        <ChevronDown size={24} />
                      )}
                    </div>

                    {(isAdvancedOptionsOpen &&
                      <div>
                        <Label>Musique instrumentale ?</Label>
                        <select
                          value={newBlindtestInstrumental}
                          onChange={(e) => setNewBlindtestInstrumental(e.target.value)}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                        >
                          <option key="" value="">
                            Peu importe
                          </option>
                          <option key="true" value="true">
                            Oui
                          </option>
                          <option key="false" value="false">
                            Non
                          </option>
                        </select>

                        <div className="flex gap-2 items-center mt-5">
                          <select
                            value={newBlindtestYearBegin}
                            onChange={(e) => setNewBlindtestYearBegin(e.target.value)}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                          >
                            <option value="" disabled>
                              Date minimale
                            </option>

                            {years.map((year) => (
                              <option key={year} value={year}>
                                {year}
                              </option>
                            ))}
                          </select>

                          <p className="text-sm"> - </p>

                          <select
                            value={newBlindtestYearEnd}
                            onChange={(e) => setNewBlindtestYearEnd(e.target.value)}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                          >
                            <option value="" disabled>
                              Date maximale
                            </option>

                            {years.map((year) => (
                              <option key={year} value={year}>
                                {year}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="mt-3">
                          <Label>Artistes</Label>
                          <SearchBar categories={["artist"]} setSelectedArtists={setNewBlindtestArtists} selectedArtists={newBlindtestArtists} placeholder="" />
                          <SelectedItemsChips items={newBlindtestArtists} setItems={setNewBlindtestArtists} />
                        </div>

                        <div className="mt-3">
                          <Label>Genres</Label>
                          <SearchBar categories={["genre"]} setSelectedGenres={setNewBlindtestGenres} selectedGenres={newBlindtestGenres} placeholder="" />
                          <SelectedItemsChips items={newBlindtestGenres} setItems={setNewBlindtestGenres} />
                        </div>

                        <div className="mt-3">
                          <Label>Musiques</Label>
                          <SearchBar categories={["track"]} setSelectedTracks={setNewBlindtestCompulsoryTracks} selectedTracks={newBlindtestCompulsoryTracks} placeholder="" />
                          <SelectedItemsChips items={newBlindtestCompulsoryTracks} setItems={setNewBlindtestCompulsoryTracks} />
                        </div>
                      </div>
                    )}
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                      Annuler
                    </Button>
                    <Button type="submit">Générer</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div>
            <SectionTitle title="Mes blindtests" className="mt-0" />
            {blindtests.length > 0 ? (
              <ContentGrid
                items={blindtests.map((b: any) => ({
                  ...b,
                  type: "Blindtest",
                  annotation: b.totalTracksCount ? (b.totalTracksCount + " titre" + (b.totalTracksCount > 1 ? "s" : "")) : null,
                  link: `/blindtest/${b.id}`,
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
