"use client";
import Nav from "@/components/Nav";
import SectionTitle from "@/components/SectionTitle";
import ContentGrid from "@/components/ContentGrid";
import { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { MdPlayArrow, MdShuffle } from "react-icons/md";
import MusicVisualizer from "@/components/MusicVisualizer";
import CoverCarousel from "@/components/CoverCarousel";
import { useAuth } from "@/context/AuthContext";
import { usePlayer } from "@/context/PlayerContext";
import { useRouter } from "next/navigation";
import { getMyPinnedItemsQuery, getMyTrackHistoryQuery, toMusic, ApiPinnedItem } from "@/lib/api-client";
import { Music } from "@/types/music";

export default function Home() {
  const { isAuthenticated, requireAuth, token } = useAuth();
  const { history } = usePlayer();
  const router = useRouter();

  // ... existing types ...
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

  const [pinnedContent, setPinnedContent] = useState<ContentList>([]);
  const [historyContent, setHistoryContent] = useState<ContentList>([]);
  const [recoContent, setRecoContent] = useState<ContentList[]>([]);
  const [loading, setLoading] = useState(true);

  // Fallback local history if not authenticated
  const localHistoryContent = history.map((t) => ({ ...t, type: "Track" as const })).reverse().slice(0, 10);

  useEffect(() => {
    const fetchHomeData = async () => {
      if (isAuthenticated && token) {
        try {
          const [pinnedRes, historyRes] = await Promise.all([
            getMyPinnedItemsQuery(token),
            getMyTrackHistoryQuery(12, token),
          ]);

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
                  type: "Artiste" as const, // For ContentCard type switch
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
          console.error("Failed to load home data", err);
          // When auth fails, clear them entirely instead of falling back to local history
          setPinnedContent([]);
          setHistoryContent([]);
        }
      } else {
        setPinnedContent([]);
        setHistoryContent([]);
      }
      setLoading(false);
    };

    fetchHomeData();
  }, [isAuthenticated, token, history]);

  useEffect(() => {
    if (!loading) {
      setRecoContent([pinnedContent]); // Just for visual demo of infinite scroll
    }
  }, [pinnedContent, loading]);

  const contentRef = useRef<HTMLDivElement>(null);

  function LoadNewReco() {
    if (pinnedContent.length > 0) {
      setRecoContent((prev) => [...prev, pinnedContent, pinnedContent, pinnedContent]);
    }
  }

  const loaderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            LoadNewReco();
          }
        });
      },
      { threshold: 1.0 },
    );
    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }
    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col font-sans bg-background text-foreground">
      <Nav />
      {/* Increased padding-top for desktop to account for fixed Nav */}
      <main className="flex-1 lg:pt-8 pb-24 lg:pb-8 mx-4 md:mx-8 lg:mx-48">
        <div className="flex flex-col gap-4 mt-16" ref={contentRef}>
          <MusicVisualizer />
          <div className="flex w-full rounded-full overflow-hidden bg-gradient-to-r from-[var(--color-muse-sky-blue)] to-[var(--color-muse-pink)]">
            <Button
              className="flex-1 rounded-none bg-transparent hover:bg-white/20 text-foreground border-r-2 border-[var(--color-background)] hover:cursor-pointer"
              size="lg"
              onClick={() => {
                requireAuth(() => {
                  console.log("Lancer la radio");
                });
              }}
            >
              <MdPlayArrow className="mr-2 h-5 w-5" /> Lancer la radio
            </Button>
            <Button
              className="flex-1 rounded-none bg-transparent hover:bg-white/20 text-foreground border-l-2 border-[var(--color-background)] hover:cursor-pointer"
              size="lg"
            >
              <MdShuffle className="mr-2 h-5 w-5" /> Découvrir
            </Button>
          </div>

          {isAuthenticated && !loading && pinnedContent.length > 0 && (
            <>
              <SectionTitle title="Épinglés" />
              <ContentGrid items={pinnedContent as any} />
            </>
          )}

          <CoverCarousel
            title="Recommandé pour vous"
            items={[
              {
                id: "reco-1",
                title: "Midnight Vibes",
                artist: ["The Weeknd"],
                album: "After Hours",
                image: "/placeholder-music.jpg",
                duration: "3:20",
                isLiked: false,
                type: "Track",
              },
              {
                id: "reco-2",
                name: "Summer Hits",
                artist: "Various",
                image: "/placeholder-album.jpg",
                type: "Playlist",
                tracks: [],
              },
              {
                id: "reco-3",
                name: "Dua Lipa",
                image: "/placeholder-artist.jpg",
                stats: { totalListeners: "1M" },
                popularTracks: [],
                albums: [],
                singles: [],
                type: "Artist",
              },
              {
                id: "reco-4",
                name: "Future Nostalgia",
                artist: "Dua Lipa",
                image: "/placeholder-album.jpg",
                type: "Album",
                tracks: [],
              },
              {
                id: "reco-5",
                title: "Blinding Lights",
                artist: ["The Weeknd"],
                album: "After Hours",
                image: "/placeholder-music.jpg",
                duration: "3:20",
                isLiked: true,
                type: "Track",
              },
            ]}
          />

          <CoverCarousel
            title="Parce que vous avez aimé The Weeknd"
            items={[
              {
                id: "wknd-1",
                title: "Starboy",
                artist: ["The Weeknd"],
                album: "Starboy",
                image: "/placeholder-music.jpg",
                duration: "3:50",
                isLiked: true,
                type: "Track",
              },
              {
                id: "wknd-2",
                name: "Dawn FM",
                artist: "The Weeknd",
                image: "/placeholder-album.jpg",
                type: "Album",
                tracks: [],
              },
              {
                id: "wknd-3",
                name: "Ariana Grande",
                image: "/placeholder-artist.jpg",
                stats: { totalListeners: "2M" },
                popularTracks: [],
                albums: [],
                singles: [],
                type: "Artist",
              },
              {
                id: "wknd-4",
                title: "Die For You",
                artist: ["The Weeknd"],
                album: "Starboy",
                image: "/placeholder-music.jpg",
                duration: "4:20",
                isLiked: false,
                type: "Track",
              },
            ]}
          />

          <CoverCarousel
            title="Parce que vous avez aimé Pop"
            items={[
              {
                id: "pop-1",
                title: "Levitating",
                artist: ["Dua Lipa"],
                album: "Future Nostalgia",
                image: "/placeholder-music.jpg",
                duration: "3:23",
                isLiked: true,
                type: "Track",
              },
              {
                id: "pop-2",
                name: "Disco",
                artist: "Kylie Minogue",
                image: "/placeholder-album.jpg",
                type: "Album",
                tracks: [],
              },
              {
                id: "pop-3",
                name: "Harry Styles",
                image: "/placeholder-artist.jpg",
                stats: { totalListeners: "1.5M" },
                popularTracks: [],
                albums: [],
                singles: [],
                type: "Artist",
              },
              {
                id: "pop-4",
                title: "As It Was",
                artist: ["Harry Styles"],
                album: "Harry's House",
                image: "/placeholder-music.jpg",
                duration: "2:47",
                isLiked: false,
                type: "Track",
              },
            ]}
          />

          {isAuthenticated && historyContent.length > 0 && (
            <>
              <SectionTitle title="Historique" />
              <CoverCarousel items={historyContent as any} />
            </>
          )}

          <SectionTitle title="Pour vous" />
          {recoContent.map((reco, index) => (
            <ContentGrid key={index} items={reco} />
          ))}
        </div>
        <div ref={loaderRef} className="h-1 w-1" />
      </main>
    </div>
  );
}
