"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Music, Album, Artist } from "@/types/music";
import Image from "@/components/ImageWithFallback";
import Link from "next/link";
import { Play } from "lucide-react";

// Define a union type for items that can be displayed
// Define a union type for items that can be displayed
type CarouselItemType =
  | (Music & { type?: "Track" })
  | Album
  | (Omit<Album, "type"> & { type: "Playlist" })
  | (Artist & { type: "Artist" });

interface CoverCarouselProps {
  items: CarouselItemType[];
  title?: string;
  className?: string;
}

import ContentCard from "@/components/ContentCard";
import TrackCard from "@/components/TrackCard";
import SectionTitle from "@/components/SectionTitle";

export default function CoverCarousel({ items, title, className }: CoverCarouselProps) {
  if (!items || items.length === 0) return null;

  return (
    <div className={`w-full ${className}`}>
      {title && <SectionTitle title={title} className="mb-4" />}
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {items.map((item, index) => (
            <CarouselItem
              key={`${item.id}-${index}`}
              className="pl-2 md:pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4"
            >
              <div className="p-1">
                {getType(item) === "Track" ? (
                  <TrackCard track={item as Music} priority={index < 2} />
                ) : (
                  <ContentCard
                    name={getName(item)}
                    imageUrl={getImage(item)}
                    link={getLink(item)}
                    type={getType(item)}
                  />
                )}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
}

function getType(
  item: CarouselItemType,
): "Album" | "Single" | "Artiste" | "Playlist" | "Track" | "Artist" {
  if ("type" in item && item.type) return item.type;
  return "Track"; // Default fallback
}

function getLink(item: CarouselItemType): string {
  // Check for specific discriminators first
  if ("type" in item) {
    if (item.type === "Artist") return `/artist/${item.id}`;
    if (item.type === "Album" || item.type === "Single") return `/album/${item.id}`;
    if (item.type === "Playlist") return `/playlist/${item.id}`;
  }

  // Fallback for Track or undefined type (assuming tracks are linked to album or play)
  if ("album" in item && typeof item.album === "string") {
    // In a real app with IDs, Track should contain albumId.
    // For now, if album is just a string name, we generate a slug,
    // but ideally the user clicks the track to play it anyway.
    return `/album/${item.album.toLowerCase().replace(/ /g, "-")}`;
  }
  return "/";
}

function getImage(item: CarouselItemType): string {
  if ("image" in item && item.image) return item.image;
  return "/placeholder-music.jpg";
}

function getName(item: CarouselItemType): string {
  if ("name" in item) return item.name;
  if ("title" in item) return item.title;
  return "Unknown";
}

function getSubtext(item: CarouselItemType): string {
  if ("artist" in item) {
    if (Array.isArray(item.artist)) return item.artist.join(", ");
    return item.artist;
  }
  if ("type" in item) return item.type;
  return "";
}
