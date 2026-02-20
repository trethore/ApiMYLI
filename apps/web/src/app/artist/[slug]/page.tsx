import Nav from "@/components/Nav";
import { Artist, Music, Album } from "@/types/music";
import MusicItem from "@/components/MusicItem";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Play } from "lucide-react";
import Image from "next/image";
import LikeButton from "@/components/LikeButton";
import SectionTitle from "@/components/SectionTitle";
import ContentGrid from "@/components/ContentGrid";

export default async function ArtistPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const slug = (await params).slug;
  const artistName = slug.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());

  // Mock Data Generation using Artist Type
  const mockArtist: Artist = {
    id: `artist-${slug}`,
    name: artistName,
    image: "/placeholder-artist.jpg",
    stats: {
        totalListeners: "2,456,789"
    },
    popularTracks: Array.from({ length: 5 }).map((_, i) => ({
        id: `track-${i}`,
        title: i === 0 ? "Food" : `Popular Hit ${i + 1}`,
        artist: [artistName], 
        album: "Best Of",
        image: "/placeholder-music.jpg",
        duration: "3:30",
        isLiked: i % 2 === 0,
        audioSrc: i === 0 ? "music/WFMU/AWOL/AWOL_-_A_Way_Of_Life/AWOL_-_03_-_Food.mp3" : undefined
    })),
    albums: Array.from({ length: 4 }).map((_, i) => ({
        id: `album-${i}`,
        name: `Album Vol. ${i + 1}`,
        artist: artistName,
        image: "/placeholder-album.jpg",
        type: "Album",
        tracks: [] // Empty for overview
    })),
    singles: Array.from({ length: 3 }).map((_, i) => ({
        id: `single-${i}`,
        name: `Latest Single ${i + 1}`,
        artist: artistName,
        image: "/placeholder-music.jpg",
        type: "Single",
        tracks: []
    }))
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
                 {/* <Image src={mockArtist.image} alt={mockArtist.name} fill className="object-cover" /> */}
            </div>

            {/* Artist Info */}
            <div className="flex flex-col items-center md:items-start text-center md:text-left flex-1 space-y-2">
                
                <SectionTitle title={mockArtist.name} className="mt-0 text-4xl sm:text-6xl md:text-7xl leading-tight" />
                
                <p className="text-lg text-muted-foreground font-medium md:text-left">
                    {mockArtist.stats.totalListeners} écoutes
                </p>

                <div className="flex items-center justify-center md:justify-start gap-4 mt-6">
                    <Button className="rounded-full bg-gradient-to-r from-[var(--color-muse-sky-blue)] to-[var(--color-muse-pink)] text-foreground font-bold text-lg px-8 py-6 hover:scale-105 transition-transform hover:cursor-pointer flex-1 md:flex-none">
                         <Play className="mr-2 fill-current" /> Lecture
                    </Button>
                    
                    <LikeButton initialIsLiked={false} size={28} className="rounded-full hover:bg-secondary/20 h-14 w-14 border border-white/10" iconClassName="w-7 h-7" itemId={mockArtist.id} itemType="artist" />

                    <Button size="icon" variant="ghost" className="rounded-full hover:bg-secondary/20 h-14 w-14 border border-white/10">
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
                            {mockArtist.popularTracks.map((track, index) => (
                                <MusicItem key={track.id} music={track} index={index} />
                            ))}
                        </div>
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-bold mb-4">Discographie</h2>
                    <div className="space-y-6">
                         <div>
                            <h3 className="text-lg text-muted-foreground mb-3 font-medium">Albums</h3>
                            <ContentGrid items={mockArtist.albums.map(album => ({
                                name: album.name,
                                type: album.type,
                                imageUrl: album.image,
                                link: `/album/${album.id}`
                            }))} />
                         </div>
                         <div>
                            <h3 className="text-lg text-muted-foreground mb-3 font-medium">Singles et EP</h3>
                            <ContentGrid items={mockArtist.singles.map(single => ({
                                name: single.name,
                                type: single.type,
                                imageUrl: single.image,
                                link: `/album/${single.id}`
                            }))} />
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
                                 {mockArtist.name} est un artiste de renommée mondiale connu pour son style unique mélangeant pop, rock et électro...
                             </p>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                        <p>Paris, France</p>
                    </div>
                </section>
            </div>
        </div>

      </main>
    </div>
  );
}
