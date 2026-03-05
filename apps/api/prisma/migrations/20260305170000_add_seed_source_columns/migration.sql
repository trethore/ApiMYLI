-- AlterTable
ALTER TABLE "genre"
ADD COLUMN "tracks_count" INTEGER;

-- AlterTable
ALTER TABLE "artist"
ADD COLUMN "artist_members" TEXT;

-- AlterTable
ALTER TABLE "track"
ADD COLUMN "track_genre_top" TEXT;
