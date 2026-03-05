-- AlterTable
ALTER TABLE "album" ADD COLUMN     "album_image_file" TEXT,
ADD COLUMN     "album_images" TEXT;

-- AlterTable
ALTER TABLE "artist" ADD COLUMN     "artist_image_file" TEXT,
ADD COLUMN     "artist_images" TEXT;

-- AlterTable
ALTER TABLE "track" ADD COLUMN     "track_file" TEXT,
ADD COLUMN     "track_image_file" TEXT,
ADD COLUMN     "track_url" TEXT;
