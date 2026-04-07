import ContentCard from "@/components/ContentCard";
import TrackCard from "@/components/TrackCard";
import { Music } from "@/types/music";

interface ContentItem {
  id?: string;
  name?: string;
  title?: string;
  type?: string;
  annotation?: string,
  imageUrl?: string;
  image?: string;
  link?: string;
  [key: string]: unknown;
}

interface ContentGridProps {
  items?: readonly ContentItem[] | ContentItem[];
}

export default function ContentGrid({ items = [] }: ContentGridProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {items?.map((item, index) => {
        if (item.type === "Track") {
          return <TrackCard key={`${item.id}-${index}`} track={item as unknown as Music} priority={index < 2} />;
        }
        return (
          <ContentCard
            key={`${item.id}-${index}`}
            name={item.name || item.title || "Unknown"}
            type={item.type as "Track" | "Album" | "Single" | "Artiste" | "Playlist" | "Artist" | "Blindtest"}
            annotation={item.annotation}
            imageUrl={item.imageUrl || item.image}
            link={item.link || "/"}
            priority={index < 2}
          />
        );
      })}
    </div>
  );
}
