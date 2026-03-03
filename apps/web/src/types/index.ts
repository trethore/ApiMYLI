
export type ContentType = "Album" | "Single" | "Artiste" | "Playlist";

export interface ContentItem {
  id?: string | number; // Optional ID for keys
  name: string;
  type: ContentType;
  imageUrl?: string;
  link: string;
}

// Type for a group of content items (e.g. a row of 4)
export type ContentGroup = ContentItem[];
