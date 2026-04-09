export type Genre = {
  genreId: string;
  parentId: string | null;
  title: string | null;
  topLevel: number | null;
  tracksCount: number | null;
  parent: {
    genreId: string;
    parentId: string | null;
    title: string | null;
    topLevel: number | null;
    tracksCount: number | null;
  } | null;
  children: {
    genreId: string;
    parentId: string | null;
    title: string | null;
    topLevel: number | null;
    tracksCount: number | null;
  }[];
};