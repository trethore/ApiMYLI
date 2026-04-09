"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { globalSearchQuery, ApiSearchResults, toMusic } from "@/lib/api-client";
import { useAuth } from "@/context/AuthContext";
import { usePlayer } from "@/context/PlayerContext";
import { MdSearch, MdClose } from "react-icons/md";
import { Play } from "lucide-react";
import Image from "@/components/ImageWithFallback";

interface SearchBarProps {
  categories?: string[];
  placeholder?: string;
  setSelectedPlaylists?: (selected: { id: string, name: string }[]) => void;
  selectedPlaylists?: { id: string, name: string }[];
  setSelectedArtists?: (selected: { id: string, name: string }[]) => void;
  selectedArtists?: { id: string, name: string }[];
  setSelectedGenres?: (selected: { id: string, name: string }[]) => void;
  selectedGenres?: { id: string, name: string }[];
  setSelectedTracks?: (selected: { id: string, name: string }[]) => void;
  selectedTracks?: { id: string, name: string }[];
}

export default function SearchBar({
  categories = ["album", "track", "artist", "playlist", "genre"],
  placeholder = "Rechercher musiques, artistes...",
  setSelectedPlaylists,
  selectedPlaylists,
  setSelectedArtists,
  selectedArtists,
  setSelectedGenres,
  selectedGenres,
  setSelectedTracks,
  selectedTracks,
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ApiSearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const { token, requireAuth } = useAuth();
  const { playTrack } = usePlayer();
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleArtistSelection = (artist: { id: string, name: string }) => {
    if (setSelectedArtists && selectedArtists) {
      const isSelected = selectedArtists.map(item => item.id).includes(artist.id);
      const updated = isSelected
        ? selectedArtists.filter(item => item.id !== artist.id)
        : [...selectedArtists, artist];
      setSelectedArtists(updated)
    }
  };
  const togglePlaylistSelection = (playlist: { id: string, name: string }) => {
    if (setSelectedPlaylists && selectedPlaylists) {
      const isSelected = selectedPlaylists.map(item => item.id).includes(playlist.id);
      const updated = isSelected
        ? selectedPlaylists.filter(item => item.id !== playlist.id)
        : [...selectedPlaylists, playlist];
      setSelectedPlaylists(updated);
    }
  };
  const toggleGenreSelection = (genre: { id: string, name: string }) => {
    if (setSelectedGenres && selectedGenres) {
      const isSelected = selectedGenres.map(item => item.id).includes(genre.id);
      const updated = isSelected
        ? selectedGenres.filter(item => item.id !== genre.id)
        : [...selectedGenres, genre];
      setSelectedGenres(updated);
    }
  };
  const toggleTrackSelection = (track: { id: string, name: string }) => {
    if (setSelectedTracks && selectedTracks) {
      const isSelected = selectedTracks.map(item => item.id).includes(track.id);
      const updated = isSelected
        ? selectedTracks.filter(item => item.id !== track.id)
        : [...selectedTracks, track];
      setSelectedTracks(updated);
    }
  };

  // Debounce effect
  useEffect(() => {
    if (!query.trim()) {
      setResults(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timeoutId = setTimeout(async () => {
      try {
        const res = await globalSearchQuery(query, 3, token);
        setResults(res);
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setLoading(false);
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [query, token]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const hasResults = results && (
    results.tracks?.length > 0 ||
    results.albums?.length > 0 ||
    results.artists?.length > 0 ||
    results.playlists?.length > 0
  );

  return (
    <div className="relative w-full max-w-sm hidden md:block" ref={dropdownRef}>
      <div className="relative flex items-center">
        <MdSearch className="absolute left-3 text-muted-foreground w-5 h-5" />
        <input
          type="text"
          placeholder={placeholder}
          value={query}
          onFocus={() => setShowDropdown(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowDropdown(true);
          }}
          className="w-full bg-secondary/40 hover:bg-secondary/80 placeholder-zinc-950 hover:placeholder-white text-white border border-border/50 rounded-full py-2 pl-10 pr-10 focus:outline-none focus:ring-1 focus:ring-primary transition-all text-sm"
        />
        {query && (
          <button
            className="absolute right-3 text-muted-foreground hover:text-foreground"
            onClick={() => {
              setQuery("");
              setResults(null);
            }}
          >
            <MdClose className="w-4 h-4" />
          </button>
        )}
      </div>

      {showDropdown && query && (
        <div className="absolute top-12 left-0 w-full lg:w-[450px] bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden flex flex-col max-h-[70vh] md:max-h-[500px]">
          {loading ? (
            <div className="p-8 flex justify-center text-muted-foreground">
              <span className="animate-pulse">Recherche en cours...</span>
            </div>
          ) : !hasResults ? (
            <div className="p-8 text-center text-muted-foreground text-sm">
              Aucun résultat pour &quot;{query}&quot;
            </div>
          ) : (
            <div className="overflow-y-auto p-2 flex flex-col gap-4 custom-scrollbar">
              {results.tracks.length > 0 && categories.includes("track") && (
                <div>
                  <h3 className="px-2 text-xs font-bold text-muted-foreground mb-1 uppercase tracking-wider">Titres</h3>
                  {results.tracks.map(t => {
                    const isSelected = selectedTracks?.map(i => i.id).includes(t.trackId);

                    return (
                      <div
                        key={t.trackId}
                        className={`flex items-center gap-3 p-2 rounded-md transition-colors
                        ${setSelectedTracks ? "cursor-pointer" : ""}
                        ${isSelected ? "bg-secondary/50" : "hover:bg-secondary/30"}`}
                        onClick={(e) => {
                          if (setSelectedTracks) {
                            toggleTrackSelection({ id: t.trackId, name: t.title ?? "" })
                          }
                        }}
                      >
                        <div
                          className="w-10 h-10 relative flex-shrink-0 bg-secondary rounded overflow-hidden group/image cursor-pointer"
                          onClick={(e) => {
                            if (!setSelectedTracks) {
                              e.stopPropagation();
                              requireAuth(() => playTrack(toMusic(t)));
                            }
                          }}
                        >
                          <Image src={t.imageUrl || "/placeholder-music.jpg"} alt={t.title || "Titre"} layout="fill" objectFit="cover" />
                          <div className={`absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 transition-opacity
                            ${setSelectedTracks ? "" : "group-hover/image:opacity-100"}
                            `}>
                            <Play className="w-4 h-4 fill-white text-white" />
                          </div>
                        </div>
                        <div className="flex-1 truncate">
                          <p className="text-sm font-medium truncate">{t.title}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {t.mainArtists.map(a => a.name).join(", ")} {t.album?.title ? `• ${t.album.title}` : ""}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {results.genres?.length > 0 && categories.includes("genre") && (
                <div>
                  <h3 className="px-2 text-xs font-bold text-muted-foreground mb-1 uppercase tracking-wider">Genres</h3>
                  {results.genres?.map(g => {
                    const isSelected = selectedGenres?.map(i => i.id).includes(g.genreId);

                    return (
                      <div
                        key={g.genreId}
                        className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors
                          ${isSelected ? "bg-secondary/50" : "hover:bg-secondary/30"}`}
                        onClick={() => {
                          if (setSelectedGenres) {
                            toggleGenreSelection({ id: g.genreId, name: g.title ?? "" })
                          }
                        }}
                      >
                        <div className="flex-1 truncate border-b border-transparent">
                          <p className="text-sm font-medium truncate">{g.title}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {results.artists?.length > 0 && categories.includes("artist") && (
                <div>
                  <h3 className="px-2 text-xs font-bold text-muted-foreground mb-1 uppercase tracking-wider">Artistes</h3>
                  {results.artists?.map(a => {
                    const isSelected = selectedArtists?.map(i => i.id).includes(a.artistId);

                    return (
                      <div
                        key={a.artistId}
                        className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors
                          ${isSelected ? "bg-secondary/50" : "hover:bg-secondary/30"}`}
                        onClick={() => {
                          if (setSelectedArtists) {
                            toggleArtistSelection({ id: a.artistId, name: a.name ?? "" })
                          } else {
                            setShowDropdown(false);
                            router.push(`/artist/${a.artistId}`);
                            setQuery("");
                          }
                        }}
                      >
                        <div className="w-10 h-10 relative flex-shrink-0 bg-secondary rounded-full overflow-hidden border border-border/10">
                          <Image src={a.imageUrl || "/placeholder-artist.jpg"} alt={a.name || "Artiste"} layout="fill" objectFit="cover" />
                        </div>
                        <div className="flex-1 truncate border-b border-transparent">
                          <p className="text-sm font-medium truncate">{a.name}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {results.albums?.length > 0 && categories.includes("album") && (
                <div>
                  <h3 className="px-2 text-xs font-bold text-muted-foreground mb-1 uppercase tracking-wider">Albums</h3>
                  {results.albums?.map(a => (
                    <div
                      key={a.albumId}
                      className="flex items-center gap-3 p-2 hover:bg-secondary/50 rounded-md cursor-pointer transition-colors"
                      onClick={() => {
                        setShowDropdown(false);
                        router.push(`/album/${a.albumId}`);
                        setQuery("");
                      }}
                    >
                      <div className="w-10 h-10 relative flex-shrink-0 bg-secondary rounded overflow-hidden shadow-sm">
                        <Image src={a.imageUrl || "/placeholder-album.jpg"} alt={a.title || "Album"} layout="fill" objectFit="cover" />
                      </div>
                      <div className="flex-1 truncate">
                        <p className="text-sm font-medium truncate">{a.title}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          <span className="capitalize">{a.type?.toLowerCase() || 'Album'}</span>
                          {a.artists && a.artists.length > 0 ? ` • ${a.artists.map(art => art.name).join(", ")}` : ""}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {results.playlists?.length > 0 && categories.includes("playlist") && (
                <div>
                  <h3 className="px-2 text-xs font-bold text-muted-foreground mb-1 uppercase tracking-wider">Playlists</h3>
                  {results.playlists?.map(p => {
                    const isSelected = selectedPlaylists?.map(i => i.id).includes(p.playlistId);

                    return (
                      <div
                        key={p.playlistId}
                        className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors
                          ${isSelected ? "bg-secondary/50" : "hover:bg-secondary/30"}`}
                        onClick={() => {
                          if (setSelectedPlaylists) {
                            togglePlaylistSelection({ name: p.name ?? "", id: p.playlistId })
                          } else {
                            setShowDropdown(false);
                            router.push(`/playlist/${p.playlistId}`);
                            setQuery("");
                          }
                        }}
                      >
                        <div className="w-10 h-10 relative flex-shrink-0 bg-secondary rounded shadow-sm overflow-hidden">
                          <Image src={'/placeholder-album.jpg'} alt={p.name || "Playlist"} layout="fill" objectFit="cover" />
                        </div>
                        <div className="flex-1 truncate">
                          <p className="text-sm font-medium truncate">{p.name}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
