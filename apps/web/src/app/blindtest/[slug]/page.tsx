"use client";

import Nav from "@/components/Nav";
import MusicItem from "@/components/MusicItem";
import { Music } from "@/types/music";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Play, Edit, Trash2, ListMinus, EyeClosed, Eye, PlusIcon, ChevronRight, ChevronDown } from "lucide-react";
import Image from "@/components/ImageWithFallback";
import SectionTitle from "@/components/SectionTitle";
import PinActionSubMenu from "@/components/PinActionSubMenu";
import { useToast } from "@/context/ToastContext";
import { use, useState, useEffect, useRef, useMemo } from "react";
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
import { toMusic } from "@/lib/api-client";
import { useBlindtest } from "@/context/BlindtestContext";
import SearchBar from "@/components/SearchBar";
import SelectedItemsChips from "@/components/SelectedItemsChips";
import { Slider } from "@/components/ui/slider";
import { PlayBlindtest } from "@/components/PlayBlindtest";

export default function BlindtestPage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter();
  const { slug } = use(params);
  const blindtestId = slug;

  // Auth
  const { token, requireAuth } = useAuth();
  const { playTrack, setQueueList } = usePlayer();

  // Blindtest data
  const { updateBlindtest, deleteBlindtest, autocompleteBlindtest, loadBlindtest, blindtest, addCompulsoryTracksToBlindtest } = useBlindtest();
  const [tracks, setTracks] = useState<Music[]>([]);
  const [compulsoryTracks, setCompulsoryTracks] = useState<Music[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCompulsoryTracks, setSelectedCompulsoryTracks] = useState<{ id: string, name: string }[]>([]);

  // Update blindtest attributes
  const [updateBlindtestName, setUpdateBlindtestName] = useState<string>("");
  const [updateBlindtestLength, setUpdateBlindtestLength] = useState<string>("10");
  const [updateBlindtestYearBegin, setUpdateBlindtestYearBegin] = useState<string>("");
  const [updateBlindtestYearEnd, setUpdateBlindtestYearEnd] = useState<string>("");
  const [updateBlindtestDifficulty, setUpdateBlindtestDifficulty] = useState<string>("10");
  const [updateBlindtestInstrumental, setUpdateBlindtestInstrumental] = useState<string>("");
  const [updateBlindtestArtists, setUpdateBlindtestArtists] = useState<{ id: string, name: string }[]>([]);
  const [updateBlindtestCompulsoryTracks, setUpdateBlindtestCompulsoryTracks] = useState<{ id: string, name: string }[]>([]);
  const [updateBlindtestGenres, setUpdateBlindtestGenres] = useState<{ id: string, name: string }[]>([]);

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

  // Utilities
  const [holding, setHolding] = useState(false);
  const [blindtestVisible, setBlindtestVisible] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [isAdvancedOptionsOpen, setIsAdvancedOptionsOpen] = useState(false);
  const [hasAutocompleteNoTracks, setHasAutocompleteNoTracks] = useState(false);
  const [playingBlindtest, setPlayingBlindtest] = useState(false);
  const difficultyMeta = useMemo(() => {
    if (Number(updateBlindtestDifficulty) < 5) {
      return { color: "red", text: "Difficile" };
    }
    if (Number(updateBlindtestDifficulty) < 10) {
      return { color: "orange", text: "Moyen" };
    }
    return { color: "green", text: "Facile" };
  }, [Number(updateBlindtestDifficulty)]);

  const years = Array.from({ length: 3000 - 1950 + 1 }, (_, i) => 1950 + i)


  const handleMouseDown = () => {
    setHolding(true);
    timerRef.current = setTimeout(() => {
      setBlindtestVisible(!blindtestVisible)
      setHolding(false);
    }, 1000);
  };

  const handleMouseUp = () => {
    setHolding(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast("Lien copié !");
  };

  useEffect(() => {
    const fetchBlindtest = async () => {
      setLoading(true);
      try {
        await loadBlindtest(blindtestId);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchBlindtest();
    }
  }, [token, blindtestId]);

  useEffect(() => {
    if (blindtest) {
      // direct attributes
      if (blindtest.name) {
        setDisplayName(blindtest.name);
        setEditName(blindtest.name);
        setUpdateBlindtestName(blindtest.name);
      }
      if (blindtest.length) {
        setUpdateBlindtestLength(blindtest.length.toString());
      }
      if (blindtest.yearBegin) {
        setUpdateBlindtestYearBegin(blindtest.yearBegin.toString());
      }
      if (blindtest.yearEnd) {
        setUpdateBlindtestYearEnd(blindtest.yearEnd.toString());
      }
      if (blindtest.difficulty) {
        setUpdateBlindtestDifficulty(blindtest.difficulty.toString());
      }
      setUpdateBlindtestInstrumental(blindtest.instrumental ? 'true' : (blindtest.instrumental === null ? "" : "false"));

      // relations
      if (blindtest.tracks) {
        setTracks(blindtest.tracks.map(toMusic));
      }
      if (blindtest.compulsoryTracks) {
        setCompulsoryTracks(blindtest.compulsoryTracks.map(toMusic))
        setUpdateBlindtestCompulsoryTracks(blindtest.compulsoryTracks.map(t => { return { id: t.trackId, name: t.title ?? "" } }))
      }
      if (blindtest.artists) {
        setUpdateBlindtestArtists(blindtest.artists.map(a => { return { id: a.artistId, name: a.name ?? "" } }))
      }
      if (blindtest.genres) {
        setUpdateBlindtestGenres(blindtest.genres.map(g => { return { id: g.genreId, name: g.title ?? "" } }))
      }

      // Utilities
      if (blindtest.ownerDisplayName) setDisplayOwner(blindtest.ownerDisplayName);
      if (blindtest.isEditable) setIsOwned(true);
      if (blindtest.totalTracksCount >= blindtest.length) {
        setIsFull(true)
      } else {
        setIsFull(false)
      }
      if (blindtest.totalTracksCount <= 0) {
        setBlindtestVisible(true)
      }
    }
  }, [blindtest])

  const handleEdit = async (e: any) => {
    if (!updateBlindtestName.trim() || !updateBlindtestDifficulty || !updateBlindtestLength) {
      return
    }

    await updateBlindtest(blindtestId, {
      name: updateBlindtestName,
      length: parseInt(updateBlindtestLength),
      difficulty: parseInt(updateBlindtestDifficulty),
      yearBegin: updateBlindtestYearBegin ? parseInt(updateBlindtestYearBegin) : null,
      yearEnd: updateBlindtestYearEnd ? parseInt(updateBlindtestYearEnd) : null,
      instrumental: updateBlindtestInstrumental === ""
        ? null
        : updateBlindtestInstrumental === "true",
      genreIds: updateBlindtestGenres.map(i => i.id),
      artistIds: updateBlindtestArtists.map(i => i.id),
      compulsoryTrackIds: updateBlindtestCompulsoryTracks.map(i => i.id),
    });

    // reset attrs by reloading blindtest
    loadBlindtest(blindtestId);

    setIsEditOpen(false);
    if (editImage) setDisplayImage(editImage);
  };

  const handleAutocomplete = async () => {
    const before = blindtest?.trackCount;
    const updatedBlindtest = await autocompleteBlindtest(blindtestId, [], [], 10);
    const after = updatedBlindtest?.trackCount;
    if (before === after) setHasAutocompleteNoTracks(true);
  };

  const handleAddCompulsoryTracks = async () => {
    await addCompulsoryTracksToBlindtest(blindtestId, selectedCompulsoryTracks.map(t => t.id));
    loadBlindtest(blindtestId);
  };

  const handleDelete = async () => {
    await deleteBlindtest(blindtestId);
    router.push("/blindtests");
  };

  const handlePlayBlindtest = () => {
    requireAuth(() => {
      if (tracks.length > 0) {
        setPlayingBlindtest(true)
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

      <AlertDialog open={hasAutocompleteNoTracks}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Aïe</AlertDialogTitle>
            <AlertDialogDescription>
              Nous n&apos;avons pas pu trouver de titres répondant à l&apos;ensemble des paramètres / contraintes de votre blindtest. Vous pouvez les assouplir un peu puis réessayer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={(e) => setHasAutocompleteNoTracks(false)}
              className="cursor-pointer"
            >
              D'accord
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {playingBlindtest && (
        <PlayBlindtest blindtest={blindtest} closeBlindtest={() => setPlayingBlindtest(false)} />
      )}

      <main className="flex-1 p-4 lg:p-8 max-w-5xl mx-auto w-full">
        {/* Blindtest Header - Mobile Layout Focus */}
        <div className="flex flex-col items-center mb-4">
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
                Blindtest • {blindtest.totalTracksCount}/{blindtest.length} titres
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
            <div className="flex items-center gap-2">
              <Button
                onClick={handlePlayBlindtest}
                className="w-full sm:w-auto text-foreground font-bold text-lg py-6 rounded-full flex items-center gap-2 bg-gradient-to-r from-[var(--color-muse-sky-blue)] to-[var(--color-muse-pink)] hover:cursor-pointer disabled:opacity-50"
                disabled={tracks.length === 0}
              >
                <Play className="fill-current hover:animate-bounce" /> Jouer !
              </Button>

              <div
                title="Voir les titres (maintenir le click)"
                className={`p-2 rounded-full relative cursor-pointer transition-all duration-[1000ms] flex gap-2 items-center`}
                style={{
                  borderWidth: holding ? "4px" : "0px",
                  borderColor: holding ? "var(--color-secondary)" : "transparent",
                  borderStyle: "solid",
                  boxSizing: "border-box",
                  transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
                }} onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleMouseDown}
                onTouchEnd={handleMouseUp}
              >
                {(((blindtestVisible && holding) || (!blindtestVisible && !holding)) &&
                  <EyeClosed className="w-6 h-6" />
                )}
                {(((blindtestVisible && !holding) || (!blindtestVisible && holding)) &&
                  <Eye className="w-6 h-6" />
                )}
                {(holding) &&
                  <p className="italic font-light text-sm">Maintenir</p>
                }
              </div>
            </div>
          </div>
        </div>

        {/* Tracklist */}
        <div className={`bg-background/50 rounded-xl p-2 sm:p-4 ${blindtestVisible ? "" : "blur-md select-none pointer-events-none cursor-not-allowed"}`}>
          {!(compulsoryTracks.length <= 0 && isFull) && (
            <div className="mb-4">
              <div className="flex gap-2 items-center mb-2 justify-between">
                <p>Vos titres</p>
                {!isFull && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        className="rounded-full hover:bg-secondary/20 transition-colors cursor-pointer flex-shrink-0 border"
                      >
                        <PlusIcon size={24} /> Ajouter un titre
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Ajouter un titre spécifique</AlertDialogTitle>
                        <AlertDialogDescription>
                          Recherchez un titre à ajouter à votre blindtest
                        </AlertDialogDescription>
                      </AlertDialogHeader>

                      <SearchBar categories={["track"]} setSelectedTracks={setSelectedCompulsoryTracks} selectedTracks={selectedCompulsoryTracks} placeholder="" />
                      <SelectedItemsChips items={selectedCompulsoryTracks} setItems={setSelectedCompulsoryTracks} />

                      <AlertDialogFooter>
                        <AlertDialogCancel className="cursor-pointer">Annuler</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleAddCompulsoryTracks}
                          className="cursor-pointer"
                        >
                          Ajouter
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
              <div className="flex flex-col gap-1 bg-secondary/20 rounded-md">
                {compulsoryTracks.map((track, index) => (
                  <MusicItem key={track.id} music={track} index={index} showImage={true} type="COMPULSORY" />
                ))}
              </div>
            </div>
          )}

          {!(tracks.length <= 0 && isFull) && (
            <>
              <div className="mb-2 flex items-center gap-2 justify-between">
                <p>Titres</p>
                {!isFull && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        className="rounded-full hover:bg-secondary/20 transition-colors cursor-pointer flex-shrink-0 border"
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
              <div className="flex flex-col gap-1">
                {tracks.map((track, index) => (
                  <MusicItem key={track.id} music={track} index={index} showImage={true} type="TRACK" />
                ))}
              </div>
            </>
          )}

          {blindtest.totalTracksCount <= 0 && (
            <div className="text-center text-muted-foreground py-12">
              Ce blindtest est vide.
            </div>
          )}
        </div>

        {/* Edit Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
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

                handleEdit(e);
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

                  handleEdit(e);
                }
              }}
            >
              <DialogHeader>
                <DialogTitle>Modification</DialogTitle>
              </DialogHeader>
              <div className="space-y-2">
                <Label htmlFor="name">Nom du blindtest</Label>
                <Input
                  id="name"
                  placeholder="Mon super blindtest..."
                  value={updateBlindtestName}
                  onChange={(e) => setUpdateBlindtestName(e.target.value)}
                  required
                />

                <Label>Nombre de morceaux</Label>
                <Input
                  id="length"
                  type="number"
                  max={99}
                  min={0}
                  value={updateBlindtestLength}
                  onChange={(e) => setUpdateBlindtestLength(e.target.value)}
                  required
                />

                <Label className="flex justify-between w-full items-center mt-5">
                  Temps pour deviner ({updateBlindtestDifficulty}s)
                  <div style={{ color: difficultyMeta.color }}>
                    {difficultyMeta.text}
                  </div>
                </Label>
                <Slider
                  step={1}
                  max={20}
                  min={1}
                  value={[parseInt(updateBlindtestDifficulty)]}
                  onValueChange={(vals: number[]) => setUpdateBlindtestDifficulty(vals[0].toString())}
                />

                <div
                  onClick={(_) => setIsAdvancedOptionsOpen(!isAdvancedOptionsOpen)}
                  className="w-full flex gap-2 justify-between items-center cursor-pointer mt-5">
                  <SectionTitle title="Modification avancée" className="mt-0!" />

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
                      value={updateBlindtestInstrumental}
                      onChange={(e) => setUpdateBlindtestInstrumental(e.target.value)}
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

                    <div className="mt-5">
                      <Label>Période</Label>
                      <div className="flex gap-2 items-center">
                        <select
                          value={updateBlindtestYearBegin}
                          onChange={(e) => setUpdateBlindtestYearBegin(e.target.value)}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                        >
                          <option value="">
                            Peu importe
                          </option>

                          {years.map((year) => (
                            <option key={year} value={year}>
                              {year}
                            </option>
                          ))}
                        </select>

                        <p className="text-sm"> - </p>

                        <select
                          value={updateBlindtestYearEnd}
                          onChange={(e) => setUpdateBlindtestYearEnd(e.target.value)}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                        >
                          <option value="">
                            Peu importe
                          </option>

                          {years.map((year) => (
                            <option key={year} value={year}>
                              {year}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="mt-3">
                      <Label>Artistes</Label>
                      <SearchBar categories={["artist"]} setSelectedArtists={setUpdateBlindtestArtists} selectedArtists={updateBlindtestArtists} placeholder="" />
                      <SelectedItemsChips items={updateBlindtestArtists} setItems={setUpdateBlindtestArtists} />
                    </div>

                    <div className="mt-3">
                      <Label>Genres</Label>
                      <SearchBar categories={["genre"]} setSelectedGenres={setUpdateBlindtestGenres} selectedGenres={updateBlindtestGenres} placeholder="" />
                      <SelectedItemsChips items={updateBlindtestGenres} setItems={setUpdateBlindtestGenres} />
                    </div>

                    <div className="mt-3">
                      <Label>Musiques</Label>
                      <SearchBar categories={["track"]} setSelectedTracks={setUpdateBlindtestCompulsoryTracks} selectedTracks={updateBlindtestCompulsoryTracks} placeholder="" />
                      <SelectedItemsChips items={updateBlindtestCompulsoryTracks} setItems={setUpdateBlindtestCompulsoryTracks} />
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit">Modifier</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
