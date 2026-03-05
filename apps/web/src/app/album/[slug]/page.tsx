import Nav from "@/components/Nav";
import { Album, Music } from "@/types/music";
import MusicItem from "@/components/MusicItem";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Play } from "lucide-react";
import Image from "next/image";
import LikeButton from "@/components/LikeButton";
import SectionTitle from "@/components/SectionTitle";

export default async function AlbumPage({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug;

  // Mock Data Generation based on slug
  const mockTracks: Music[] = Array.from({ length: 12 }).map((_, i) => ({
    id: `track-${i}`,
    title: `Track Title ${i + 1}`,
    artist: ["Artist Name", ...(i % 2 === 0 ? ["Feat. Artist"] : [])], // Example of multiple artists
    album: slug.replace(/-/g, " "),
    image: "/placeholder-music.jpg", // Replace with actual image in production
    duration: "3:45",
    isLiked: i % 3 === 0,
  }));

  const album: Album = {
    id: "album-1",
    name: slug.replace(/-/g, " "),
    artist: "Artist Name",
    image: "/placeholder-album.jpg", // Replace with actual image
    type: "Album",
    tracks: mockTracks,
  };

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
            {/* Img would go here */}
            {/* <Image src={album.image} alt={album.name} fill className="object-cover" /> */}
          </div>

          {/* Metadata & Actions Row */}
          <div className="w-full flex items-end justify-between px-2 sm:px-8">
            <div className="flex flex-col text-left">
              <SectionTitle
                title={album.name}
                className="mt-0 text-2xl sm:text-4xl leading-tight"
              />
              <p className="text-lg text-muted-foreground font-medium">{album.artist}</p>
              <p className="text-sm text-muted-foreground/80 lowercase mt-1">
                {album.type} • {album.tracks.length} titres
              </p>
            </div>

            <div className="flex items-center gap-2">
              <LikeButton
                initialIsLiked={false}
                size={28}
                className="rounded-full hover:bg-secondary/20 h-10 w-10"
                iconClassName="w-7 h-7"
                itemId={album.id}
                itemType="album"
              />
              <Button
                size="icon"
                variant="ghost"
                className="rounded-full hover:bg-secondary/20 hover:text-foreground transition-colors cursor-pointer"
              >
                <MoreHorizontal size={28} />
              </Button>
            </div>
          </div>

          {/* Play Button (Optional but common) */}
          <div className="w-full px-2 sm:px-8 mt-6">
            <Button className="w-full sm:w-auto text-foreground font-bold text-lg py-6 rounded-full flex items-center gap-2 bg-gradient-to-r from-[var(--color-muse-sky-blue)] to-[var(--color-muse-pink)] hover:cursor-pointer">
              <Play className="fill-current" /> Lecture
            </Button>
          </div>
        </div>

        {/* Tracklist */}
        <div className="bg-background/50 rounded-xl p-2 sm:p-4">
          <div className="flex flex-col gap-1">
            {album.tracks.map((track, index) => (
              <MusicItem key={track.id} music={track} index={index} showImage={false} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
