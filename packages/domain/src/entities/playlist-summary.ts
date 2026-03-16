export type PlaylistSummary = {
  playlistId: string;
  name: string | null;
  description: string | null;
  imagePath: string | null;
  ownerDisplayName: string | null;
  isEditable: boolean;
  trackCount: number;
};
