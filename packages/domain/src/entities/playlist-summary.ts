export type PlaylistSummary = {
  playlistId: string;
  name: string | null;
  ownerDisplayName: string | null;
  isEditable: boolean;
  trackCount: number;
};
