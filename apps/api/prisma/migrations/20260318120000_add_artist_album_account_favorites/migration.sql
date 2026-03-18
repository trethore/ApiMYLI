CREATE TABLE "artist_account_favorite" (
    "artist_id" UUID NOT NULL,
    "account_id" UUID NOT NULL,

    CONSTRAINT "artist_account_favorite_pkey" PRIMARY KEY ("artist_id", "account_id")
);

CREATE TABLE "album_account_favorite" (
    "album_id" UUID NOT NULL,
    "account_id" UUID NOT NULL,

    CONSTRAINT "album_account_favorite_pkey" PRIMARY KEY ("album_id", "account_id")
);

ALTER TABLE "artist_account_favorite"
ADD CONSTRAINT "artist_account_favorite_artist_id_fkey"
FOREIGN KEY ("artist_id") REFERENCES "artist"("artist_id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "artist_account_favorite"
ADD CONSTRAINT "artist_account_favorite_account_id_fkey"
FOREIGN KEY ("account_id") REFERENCES "account"("account_id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "album_account_favorite"
ADD CONSTRAINT "album_account_favorite_album_id_fkey"
FOREIGN KEY ("album_id") REFERENCES "album"("album_id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "album_account_favorite"
ADD CONSTRAINT "album_account_favorite_account_id_fkey"
FOREIGN KEY ("account_id") REFERENCES "account"("account_id") ON DELETE CASCADE ON UPDATE CASCADE;
