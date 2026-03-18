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
import {
  getMyPinnedItemsQuery,
  getMyTrackHistoryQuery,
  getRecommendationsQuery,
  getDislikedTracksQuery,
  toMusic,
} from "@/lib/api-client";
import { Music } from "@/types/music";

export default function Home() {
  const { isAuthenticated, requireAuth, token } = useAuth();
  const { history, clearPlayer, setQueueList, playTrack } = usePlayer();
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
  const [recommendedContent, setRecommendedContent] = useState<ContentList>([]);
  const [basedOnHistoryRecos, setBasedOnHistoryRecos] = useState<
    { seedName: string; items: ContentList }[]
  >([]);
  const [guestCarousels, setGuestCarousels] = useState<ContentList[]>([]);
  const [loading, setLoading] = useState(true);

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

          if (formattedHistory.length > 0) {
            const historyIds = formattedHistory.map((h) => h.id);

            let dislikedIds: string[] = [];
            try {
              const dislikedTracks = await getDislikedTracksQuery(token);
              dislikedIds = dislikedTracks.map((t) => t.trackId);
            } catch {
              // best-effort
            }

            const filteredHistoryIds = historyIds.filter((id) => !dislikedIds.includes(id));
            const mergedBlacklist = [...new Set([...historyIds, ...dislikedIds])];

            // 1. Recommandé pour vous (Radio style)
            const mainRecos = await getRecommendationsQuery(
              filteredHistoryIds.slice(0, 12),
              mergedBlacklist,
              20,
              20, // 20% randomness
              token,
            );
            setRecommendedContent(
              mainRecos.map((t) => ({ ...toMusic(t), type: "Track" as const })),
            );

            // 2. Up to 4 'Based on' carousels
            // Shuffle history to pick 4 distinct items
            const shuffledHistory = [...formattedHistory].sort(() => 0.5 - Math.random());
            const seedTracks = shuffledHistory.slice(0, Math.min(4, shuffledHistory.length));

            const dynamicRecos = [];
            for (const track of seedTracks) {
              const recs = await getRecommendationsQuery(
                [track.id].filter((id) => !dislikedIds.includes(id)),
                mergedBlacklist,
                10,
                10, // 10% randomness for highly related
                token,
              );
              if (recs.length > 0) {
                dynamicRecos.push({
                  seedName: track.title || "Titre inconnu",
                  items: recs.map((t) => ({ ...toMusic(t), type: "Track" as const })),
                });
              }
            }
            setBasedOnHistoryRecos(dynamicRecos);
          }
        } catch (err) {
          console.error("Failed to load home data", err);
          // When auth fails, clear them entirely instead of falling back to local history
          setPinnedContent([]);
          setHistoryContent([]);
          setRecommendedContent([]);
          setBasedOnHistoryRecos([]);
        }
      } else {
        setPinnedContent([]);
        setHistoryContent([]);
        setRecommendedContent([]);
        setBasedOnHistoryRecos([]);
        // Guest: 2 fully random carousels
        try {
          const [g1, g2] = await Promise.all([
            getRecommendationsQuery([], [], 20, 100, null),
            getRecommendationsQuery([], [], 20, 100, null),
          ]);
          setGuestCarousels([
            g1.map((t) => ({ ...toMusic(t), type: "Track" as const })),
            g2.map((t) => ({ ...toMusic(t), type: "Track" as const })),
          ]);
        } catch (e) {
          console.error("Guest carousels failed", e);
        }
      }
      setLoading(false);
    };

    fetchHomeData();
  }, [isAuthenticated, token, history]);

  const contentRef = useRef<HTMLDivElement>(null);

  const handleLancerRadio = async () => {
    if (!token) return;
    try {
      const historyIds = history.slice(-12).map((t) => t.id);

      let dislikedIds: string[] = [];
      if (token) {
        try {
          const dislikedTracks = await getDislikedTracksQuery(token);
          dislikedIds = dislikedTracks.map((t) => t.trackId);
        } catch {
          // best-effort
        }
      }

      const filteredIds = historyIds.filter((id) => !dislikedIds.includes(id));
      const mergedBlacklist = [...new Set([...historyIds, ...dislikedIds])];

      const recs = await getRecommendationsQuery(
        filteredIds,
        mergedBlacklist,
        20,
        20, // 20% randomness
        token,
      );
      if (recs.length > 0) {
        const musicList = recs.map(toMusic);
        clearPlayer();
        setQueueList(musicList.slice(1));
        playTrack(musicList[0]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDecouvrir = async () => {
    try {
      const historyIds = history.map((t) => t.id);

      let dislikedIds: string[] = [];
      if (token) {
        try {
          const dislikedTracks = await getDislikedTracksQuery(token);
          dislikedIds = dislikedTracks.map((t) => t.trackId);
        } catch {
          // best-effort
        }
      }

      const mergedBlacklist = [...new Set([...historyIds, ...dislikedIds])];

      const recs = await getRecommendationsQuery(
        [],
        mergedBlacklist,
        20,
        100, // 100% randomness
        token,
      );
      if (recs.length > 0) {
        const musicList = recs.map(toMusic);
        clearPlayer();
        setQueueList(musicList.slice(1));
        playTrack(musicList[0]);
      }
    } catch (e) {
      console.error(e);
    }
  };

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
              onClick={() => requireAuth(handleLancerRadio)}
            >
              <MdPlayArrow className="mr-2 h-5 w-5" /> Lancer la radio
            </Button>
            <Button
              className="flex-1 rounded-none bg-transparent hover:bg-white/20 text-foreground hover:cursor-pointer"
              size="lg"
              onClick={handleDecouvrir}
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

          {isAuthenticated && !loading && recommendedContent.length > 0 && (
            <CoverCarousel title="Recommandé pour vous" items={recommendedContent as any} />
          )}

          {isAuthenticated && !loading && historyContent.length > 0 && (
            <>
              <SectionTitle title="Historique" />
              <CoverCarousel items={historyContent as any} />
            </>
          )}

          {isAuthenticated &&
            !loading &&
            basedOnHistoryRecos.map((section, idx) => (
              <CoverCarousel
                key={idx}
                title={`Car vous avez écouté : ${section.seedName}`}
                items={section.items as any}
              />
            ))}

          {!isAuthenticated &&
            !loading &&
            guestCarousels.map((items, idx) => (
              <CoverCarousel
                key={`guest-${idx}`}
                title="Vous pourriez aimer"
                items={items as any}
              />
            ))}
        </div>
      </main>
    </div>
  );
}
