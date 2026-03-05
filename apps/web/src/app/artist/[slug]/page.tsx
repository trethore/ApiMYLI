"use client";

import Nav from "@/components/Nav";
import { Music } from "@/types/music";
import MusicItem from "@/components/MusicItem";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Play } from "lucide-react";
import Image from "next/image";
import LikeButton from "@/components/LikeButton";
import SectionTitle from "@/components/SectionTitle";
import ContentGrid from "@/components/ContentGrid";

import { use, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { usePlayer } from "@/context/PlayerContext";
import { getArtistQuery, getArtistTopTracksQuery, getArtistAlbumsQuery, toMusic, formatImageUrl } from "@/lib/api-client";
import { ApiArtist, ApiAlbum } from "@/lib/api-client";

export default function ArtistPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const artistId = slug;

  const { token, requireAuth } = useAuth();
  const { playTrack, setQueueList } = usePlayer();
  
  const [artistData, setArtistData] = useState<ApiArtist | null>(null);
  const [popularTracks, setPopularTracks] = useState<Music[]>([]);
  const [artistName, setArtistName] = useState<string>(slug.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()));
  const [artistImage, setArtistImage] = useState<string>("/placeholder-artist.jpg");
  const [albums, setAlbums] = useState<ApiAlbum[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArtistData = async () => {
      try {
        setLoading(true);
        const [apiArtist, tracks, apiAlbums] = await Promise.all([
          getArtistQuery(artistId, token),
          getArtistTopTracksQuery(artistId, 5, token),
          getArtistAlbumsQuery(artistId, token),
        ]);
        
        if (apiArtist) setArtistData(apiArtist);
        if (apiAlbums) setAlbums(apiAlbums);
        
        if (tracks && tracks.length > 0) {
          setPopularTracks(tracks.map(toMusic));
          
          // Try to extract name and image from tracks since ApiArtist lacks them
          const artistSummary = tracks[0].mainArtists.find(a => a.artistId === artistId) || tracks[0].mainArtists[0];
          if (artistSummary?.name) setArtistName(artistSummary.name);
          if (artistSummary?.imageUrl) setArtistImage(formatImageUrl(artistSummary.imageUrl));
        }
      } catch (err) {
        console.error("Error fetching artist data", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchArtistData();
  }, [artistId, token]);



  if (loading) {
    return (
      <div className="min-h-screen flex flex-col font-sans bg-background text-foreground pb-24 lg:pb-0">
        <Nav />
        <main className="flex-1 p-4 lg:p-8 flex items-center justify-center max-w-7xl mx-auto w-full">
          <p className="text-muted-foreground">Chargement...</p>
        </main>
      </div>
    );
  }

  const handlePlayArtist = () => {
    requireAuth(() => {
      if (popularTracks.length > 0) {
        playTrack(popularTracks[0]);
        setQueueList(popularTracks.slice(1));
      }
    });
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-background text-foreground pb-24 lg:pb-0">
      <Nav />
      <main className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full">
        {/* Artist Header */}
        <div className="flex flex-col md:flex-row items-center md:items-end gap-6 mb-12">
          {/* Artist Image */}
          <div className="relative w-48 h-48 sm:w-64 sm:h-64 shadow-xl rounded-full overflow-hidden shrink-0 border-4 border-background">
            <div className="absolute inset-0 bg-gradient-to-br from-muse-sky-blue to-muse-pink opacity-80" />
            <Image src={artistImage} alt={artistName} fill className="object-cover" />
          </div>

          {/* Artist Info */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left flex-1 space-y-2">
            <SectionTitle
              title={artistName}
              className="mt-0 text-4xl sm:text-6xl md:text-7xl leading-tight"
            />

            <p className="text-lg text-muted-foreground font-medium md:text-left">
              {artistData?.artistFavorites || 0} favoris • Location: {artistData?.artistLocation || "Inconnue"}
            </p>

            <div className="flex items-center justify-center md:justify-start gap-4 mt-6">
              <Button 
                onClick={handlePlayArtist}
                className="rounded-full bg-gradient-to-r from-[var(--color-muse-sky-blue)] to-[var(--color-muse-pink)] text-foreground font-bold text-lg px-8 py-6 hover:scale-105 transition-transform hover:cursor-pointer flex-1 md:flex-none">
                <Play className="mr-2 fill-current" /> Lecture
              </Button>

              <LikeButton
                initialIsLiked={false}
                size={28}
                className="rounded-full hover:bg-secondary/20 h-14 w-14 border border-white/10"
                iconClassName="w-7 h-7"
                itemId={artistId}
                itemType="artist"
              />

              <Button
                size="icon"
                variant="ghost"
                className="rounded-full hover:bg-secondary/20 h-14 w-14 border border-white/10"
              >
                <MoreHorizontal />
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Left Column: Popular Tracks */}
          <div className="lg:col-span-2 space-y-8">
            <section>
              <h2 className="text-2xl font-bold mb-4">Populaires</h2>
              <div className="bg-background/50 rounded-xl p-2 sm:p-4 md:p-0 md:bg-transparent">
                <div className="flex flex-col gap-1">
                  {popularTracks.length > 0 ? (
                    popularTracks.map((track, index) => (
                      <MusicItem key={track.id} music={track} index={index} />
                    ))
                  ) : (
                    <p className="text-muted-foreground">Aucun titre populaire trouvé.</p>
                  )}
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">Discographie</h2>
              <div className="space-y-6">
                <div>
                  <ContentGrid
                    items={albums.map((album) => ({
                      id: album.albumId,
                      name: album.title || "Album Inconnu",
                      type: "Album",
                      imageUrl: formatImageUrl(album.imageUrl) || "/placeholder-album.jpg",
                      link: `/album/${album.albumId}`,
                    }))}
                  />
                  {albums.length === 0 && (
                     <p className="text-muted-foreground">Aucun album disponible pour cet artiste.</p>
                  )}
                </div>
              </div>
            </section>
          </div>

          {/* Right Column: About / Similar Artists (Placeholder) */}
          <div className="space-y-8">
            <section className="bg-card rounded-xl p-6 border border-border">
              <h2 className="text-xl font-bold mb-4">À propos</h2>
              <div className="relative h-64 w-full rounded-lg overflow-hidden mb-4 bg-muted">
                {/* Artist Bio Image */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4">
                  <p className="text-white font-bold line-clamp-3">
                    {artistData?.artistBio || `${artistName} est un artiste présent sur MUSE...`}
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                <p>{artistData?.artistLocation || "Emplacement inconnu"}</p>
                {artistData?.artistActiveYearBegin && (
                  <p>Actif depuis {artistData.artistActiveYearBegin}</p>
                )}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
