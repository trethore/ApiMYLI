import Link from "next/link";
import Image from "next/image";

interface ContentCardProps {
  imageUrl?: string;
  name: string;
  link: string;
  type: "Album" | "Single" | "Artiste" | "Playlist" | "Track" | "Artist";
  priority?: boolean;
}

export default function ContentCard({
  imageUrl,
  name,
  link,
  type,
  priority = false,
}: ContentCardProps) {
  return (
    <Link
      href={link}
      className="block w-full group hover:cursor-pointer transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-[var(--color-muse-sky-blue)] to-[var(--color-muse-pink)] rounded-lg"
    >
      <div className="group-hover:scale-[0.98] transition-all duration-300 flex flex-row lg:flex-col items-center lg:items-start bg-card text-card-foreground rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-border w-full">
        {/* Image Container */}
        <div className="relative w-1/3 lg:w-full aspect-square shrink-0">
          {/* Gradient Placeholder Background */}
          {(!imageUrl || imageUrl.includes("placeholder")) && (
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-muse-sky-blue)] to-[var(--color-muse-pink)] opacity-80" />
          )}
          {imageUrl && !imageUrl.includes("placeholder") && (
            <Image
              src={imageUrl}
              alt={name}
              fill
              priority={priority}
              className="object-cover z-10"
            />
          )}
          {/* Type Badge (Top Left) */}
          <div className="absolute hidden md:block top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur-sm z-20">
            {type}
          </div>
        </div>

        {/* Text Content */}
        <div className="p-1 lg:p-4 flex-1 w-full overflow-hidden">
          <h3 className="text-sm lg:text-base truncate opacity-70">{name}</h3>
          {/* You could add a description or subtitle here if needed */}
        </div>
      </div>
    </Link>
  );
}
