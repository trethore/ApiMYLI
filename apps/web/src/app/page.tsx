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
import { useRouter } from "next/navigation";

export default function Home() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  // ... existing types ...
  type ContentType = "Album" | "Single" | "Artiste" | "Playlist";
  type Content = {
    name: string;
    type: ContentType;
    imageUrl: string;
    link: string;
  };
  type ContentList = Content[];
  const pinnedContent: ContentList = [
    // ... existing content ...
    {
      name: "Album 1",
      type: "Album",
      imageUrl: "/placeholder-album.jpg",
      link: "/album/album-1",
    },
    {
      name: "Single Hit",
      type: "Single",
      imageUrl: "/placeholder-album.jpg",
      link: "/album/single-hit-1",
    },
    {
      name: "Top Artist",
      type: "Artiste",
      imageUrl: "/placeholder-album.jpg",
      link: "/artist/artist-top-1",
    },
    {
      name: "Morning Playlist",
      type: "Playlist",
      imageUrl: "/placeholder-album.jpg",
      link: "/playlist/playlist-morning-1",
    },
  ];

  const historyContent = pinnedContent;
  const [recoContent, setRecoContent] = useState<ContentList[]>([pinnedContent]);

  const contentRef = useRef<HTMLDivElement>(null);

  function LoadNewReco() {
    setRecoContent((prev) => [...prev, pinnedContent]);
    setRecoContent((prev) => [...prev, pinnedContent]);
    setRecoContent((prev) => [...prev, pinnedContent]);
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
                if (isAuthenticated) {
                  // Lancer la radio logic... (To be implemented later according to previous codebase state)
                  console.log("Lancer la radio");
                } else {
                  router.push("/login");
                }
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
          <SectionTitle title="Épinglés" />
          <ContentGrid items={pinnedContent} />

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

          <SectionTitle title="Historique" />
          <CoverCarousel
            items={[
              {
                id: "home-hist-1",
                title: "Yesterday",
                artist: ["The Beatles"],
                album: "Help!",
                image: "/placeholder-music.jpg",
                duration: "2:05",
                isLiked: true,
                type: "Track",
              },
              {
                id: "home-hist-2",
                name: "Abbey Road",
                artist: "The Beatles",
                image: "/placeholder-album.jpg",
                type: "Album",
                tracks: [],
              },
              {
                id: "home-hist-3",
                title: "Bohemian Rhapsody",
                artist: ["Queen"],
                album: "A Night at the Opera",
                image: "/placeholder-music.jpg",
                duration: "5:55",
                isLiked: true,
                type: "Track",
              },
              {
                id: "home-hist-4",
                name: "Queen",
                image: "/placeholder-artist.jpg",
                stats: { totalListeners: "3M" },
                popularTracks: [],
                albums: [],
                singles: [],
                type: "Artist",
              },
            ]}
          />

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
