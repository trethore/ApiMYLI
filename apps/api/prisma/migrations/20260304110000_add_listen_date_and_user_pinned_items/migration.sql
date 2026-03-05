-- AlterTable
ALTER TABLE "track_user_listen"
ADD COLUMN "listened_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateEnum
CREATE TYPE "pinned_item_type" AS ENUM ('TRACK', 'ALBUM', 'ARTIST', 'PLAYLIST');

-- CreateTable
CREATE TABLE "user_pinned_item" (
    "account_id" UUID NOT NULL,
    "slot" INTEGER NOT NULL,
    "item_type" "pinned_item_type" NOT NULL,
    "track_id" UUID,
    "album_id" UUID,
    "artist_id" UUID,
    "playlist_id" UUID,
    "pinned_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_pinned_item_pkey" PRIMARY KEY ("account_id","slot"),
    CONSTRAINT "user_pinned_item_slot_check" CHECK ("slot" BETWEEN 1 AND 4),
    CONSTRAINT "user_pinned_item_item_check" CHECK (
      (
        "item_type" = 'TRACK'
        AND "track_id" IS NOT NULL
        AND "album_id" IS NULL
        AND "artist_id" IS NULL
        AND "playlist_id" IS NULL
      )
      OR (
        "item_type" = 'ALBUM'
        AND "track_id" IS NULL
        AND "album_id" IS NOT NULL
        AND "artist_id" IS NULL
        AND "playlist_id" IS NULL
      )
      OR (
        "item_type" = 'ARTIST'
        AND "track_id" IS NULL
        AND "album_id" IS NULL
        AND "artist_id" IS NOT NULL
        AND "playlist_id" IS NULL
      )
      OR (
        "item_type" = 'PLAYLIST'
        AND "track_id" IS NULL
        AND "album_id" IS NULL
        AND "artist_id" IS NULL
        AND "playlist_id" IS NOT NULL
      )
    )
);

-- AddForeignKey
ALTER TABLE "user_pinned_item" ADD CONSTRAINT "user_pinned_item_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "user"("account_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_pinned_item" ADD CONSTRAINT "user_pinned_item_track_id_fkey" FOREIGN KEY ("track_id") REFERENCES "track"("track_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_pinned_item" ADD CONSTRAINT "user_pinned_item_album_id_fkey" FOREIGN KEY ("album_id") REFERENCES "album"("album_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_pinned_item" ADD CONSTRAINT "user_pinned_item_artist_id_fkey" FOREIGN KEY ("artist_id") REFERENCES "artist"("artist_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_pinned_item" ADD CONSTRAINT "user_pinned_item_playlist_id_fkey" FOREIGN KEY ("playlist_id") REFERENCES "playlist"("playlist_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- UpdateFunction
CREATE OR REPLACE FUNCTION increment_listen_count(p_account_id UUID, p_track_id UUID)
RETURNS VOID AS $$
BEGIN
    INSERT INTO track_user_listen (account_id, track_id, count, listened_at)
    VALUES (p_account_id, p_track_id, 1, CURRENT_TIMESTAMP)
    ON CONFLICT (track_id, account_id)
    DO UPDATE SET count = track_user_listen.count + 1,
                  listened_at = CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;
