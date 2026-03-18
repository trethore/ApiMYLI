-- DropForeignKey
ALTER TABLE "album_account_favorite" DROP CONSTRAINT "album_account_favorite_account_id_fkey";

-- DropForeignKey
ALTER TABLE "album_account_favorite" DROP CONSTRAINT "album_account_favorite_album_id_fkey";

-- DropForeignKey
ALTER TABLE "artist_account_favorite" DROP CONSTRAINT "artist_account_favorite_account_id_fkey";

-- DropForeignKey
ALTER TABLE "artist_account_favorite" DROP CONSTRAINT "artist_account_favorite_artist_id_fkey";

-- AddForeignKey
ALTER TABLE "artist_account_favorite" ADD CONSTRAINT "artist_account_favorite_artist_id_fkey" FOREIGN KEY ("artist_id") REFERENCES "artist"("artist_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "artist_account_favorite" ADD CONSTRAINT "artist_account_favorite_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "account"("account_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "album_account_favorite" ADD CONSTRAINT "album_account_favorite_album_id_fkey" FOREIGN KEY ("album_id") REFERENCES "album"("album_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "album_account_favorite" ADD CONSTRAINT "album_account_favorite_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "account"("account_id") ON DELETE RESTRICT ON UPDATE CASCADE;
