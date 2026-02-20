import ContentCard from "@/components/ContentCard";

// Using the same type definition as ContentCard for items
interface ContentItem {
  name: string;
  type: "Album" | "Single" | "Artiste" | "Playlist";
  imageUrl?: string;
  link: string;
}

interface ContentGridProps {
  items?: readonly ContentItem[] | ContentItem[]; // Made items optional to prevent undefined errors
}

export default function ContentGrid({ items = [] }: ContentGridProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {items?.map((item, index) => (
        <ContentCard 
            key={index}
            name={item.name}
            type={item.type}
            imageUrl={item.imageUrl}
            link={item.link}
            priority={index < 2} // Keep priority for first 2 items
        />
      ))}
    </div>
  );
}
