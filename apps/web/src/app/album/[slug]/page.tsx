"use client";

import Nav from "@/components/Nav";
import MusicItem from "@/components/MusicItem";
import { MoreHorizontal, Play } from "lucide-react";
import Image from "next/image";
import LikeButton from "@/components/LikeButton";
import PinActionSubMenu from "@/components/PinActionSubMenu";
import SectionTitle from "@/components/SectionTitle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Music } from "@/types/music";
import { Button } from "@/components/ui/button";

import { use, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { usePlayer } from "@/context/PlayerContext";
import { getAlbumTracksQuery, toMusic, formatImageUrl } from "@/lib/api-client";

export default function AlbumPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const albumId = slug;

  const { token, requireAuth } = useAuth();
  const { playTrack, setQueueList } = usePlayer();
  
  const [tracks, setTracks] = useState<Music[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Derived state from the API tracks (since GraphQL doesn't have an album query for metadata)
  const [albumName, setAlbumName] = useState<string>(slug.replace(/-/g, " "));
  const [albumImage, setAlbumImage] = useState<string>("/placeholder-album.jpg");
  const [artistName, setArtistName] = useState<string>("Artiste Inconnu");

  useEffect(() => {
    const fetchAlbum = async () => {
      try {
        setLoading(true);
        const apiTracks = await getAlbumTracksQuery(albumId, token);
        if (apiTracks && apiTracks.length > 0) {
          setTracks(apiTracks.map(toMusic));
          
          const firstTrack = apiTracks[0];
          if (firstTrack.album?.title) setAlbumName(firstTrack.album.title);
          if (firstTrack.album?.imageUrl) setAlbumImage(formatImageUrl(firstTrack.album.imageUrl));
          if (firstTrack.mainArtists.length > 0) {
            setArtistName(firstTrack.mainArtists.map(a => a.name).join(", "));
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAlbum();
  }, [albumId, token]);

  const handlePlayAlbum = () => {
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

  return (
    <div className="min-h-screen flex flex-col font-sans bg-background text-foreground pb-24 lg:pb-0">
      <Nav />
      <main className="flex-1 p-4 lg:p-8 max-w-5xl mx-auto w-full">
        {/* Album Header - Mobile Layout Focus */}
        <div className="flex flex-col items-center mb-8">
          {/* Album Image - Centered */}
          <div className="relative w-48 h-48 sm:w-64 sm:h-64 shadow-xl rounded-lg overflow-hidden mb-6">
            {/* Placeholder gradient if no image */}
            <div className="absolute inset-0 bg-gradient-to-br from-muse-sky-blue to-muse-pink opacity-80" />
            <Image src={albumImage} alt={albumName} fill className="object-cover" />
          </div>

          {/* Metadata & Actions Row */}
          <div className="w-full flex items-end justify-between px-2 sm:px-8">
            <div className="flex flex-col text-left">
              <SectionTitle
                title={albumName}
                className="mt-0 text-2xl sm:text-4xl leading-tight"
              />
              <p className="text-lg text-muted-foreground font-medium">{artistName}</p>
              <p className="text-sm text-muted-foreground/80 lowercase mt-1">
                Album • {tracks.length} titres
              </p>
            </div>

            <div className="flex items-center gap-2">
              <LikeButton
                initialIsLiked={false}
                size={28}
                className="rounded-full hover:bg-secondary/20 h-10 w-10"
                iconClassName="w-7 h-7"
                itemId={albumId}
                itemType="album"
              />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="rounded-full hover:bg-secondary/20 hover:text-foreground transition-colors cursor-pointer"
                  >
                    <MoreHorizontal size={28} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <PinActionSubMenu itemId={albumId} itemType="album" />
                  <DropdownMenuItem className="cursor-pointer">Voir l'artiste</DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">Partager</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Play Button */}
          <div className="w-full px-2 sm:px-8 mt-6">
            <Button 
              onClick={handlePlayAlbum}
              className="w-full sm:w-auto text-foreground font-bold text-lg py-6 rounded-full flex items-center gap-2 bg-gradient-to-r from-[var(--color-muse-sky-blue)] to-[var(--color-muse-pink)] hover:cursor-pointer">
              <Play className="fill-current" /> Lecture
            </Button>
          </div>
        </div>

        {/* Tracklist */}
        <div className="bg-background/50 rounded-xl p-2 sm:p-4">
          <div className="flex flex-col gap-1">
            {tracks.length > 0 ? (
              tracks.map((track, index) => (
                <MusicItem key={track.id} music={track} index={index} showImage={false} />
              ))
            ) : (
              <p className="text-muted-foreground text-center py-4">Cet album ne contient aucune chanson.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
