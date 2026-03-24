-- AlterEnum
ALTER TYPE "pinned_item_type" ADD VALUE 'BLINDTEST';

-- CreateTable
CREATE TABLE "artist_blindtest" (
    "blindtest_id" UUID NOT NULL,
    "artist_id" UUID NOT NULL,

    CONSTRAINT "artist_blindtest_pkey" PRIMARY KEY ("blindtest_id","artist_id")
);

-- CreateTable
CREATE TABLE "blindtest_genre" (
    "blindtest_id" UUID NOT NULL,
    "genre_id" UUID NOT NULL,

    CONSTRAINT "blindtest_genre_pkey" PRIMARY KEY ("blindtest_id","genre_id")
);

-- CreateTable
CREATE TABLE "blindtest_track" (
    "blindtest_id" UUID NOT NULL,
    "track_id" UUID NOT NULL,

    CONSTRAINT "blindtest_track_pkey" PRIMARY KEY ("blindtest_id","track_id")
);

-- CreateTable
CREATE TABLE "blindtest_compulsory_track" (
    "blindtest_id" UUID NOT NULL,
    "track_id" UUID NOT NULL,

    CONSTRAINT "blindtest_compulsory_track_pkey" PRIMARY KEY ("blindtest_id","track_id")
);

-- CreateTable
CREATE TABLE "blindtest" (
    "blindtest_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "blindtest_name" VARCHAR(255) NOT NULL,
    "blindtest_length" INTEGER NOT NULL,
    "blindtest_difficulty" INTEGER NOT NULL,
    "blindtest_instrumental" BOOLEAN,
    "blindtest_year_begin" INTEGER,
    "blindtest_year_end" INTEGER,

    CONSTRAINT "blindtest_pkey" PRIMARY KEY ("blindtest_id")
);

-- AddForeignKey
ALTER TABLE "artist_blindtest" ADD CONSTRAINT "artist_blindtest_blindtest_id_fkey" FOREIGN KEY ("blindtest_id") REFERENCES "blindtest"("blindtest_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "artist_blindtest" ADD CONSTRAINT "artist_blindtest_artist_id_fkey" FOREIGN KEY ("artist_id") REFERENCES "artist"("artist_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blindtest_genre" ADD CONSTRAINT "blindtest_genre_blindtest_id_fkey" FOREIGN KEY ("blindtest_id") REFERENCES "blindtest"("blindtest_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blindtest_genre" ADD CONSTRAINT "blindtest_genre_genre_id_fkey" FOREIGN KEY ("genre_id") REFERENCES "genre"("genre_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blindtest_track" ADD CONSTRAINT "blindtest_track_blindtest_id_fkey" FOREIGN KEY ("blindtest_id") REFERENCES "blindtest"("blindtest_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blindtest_track" ADD CONSTRAINT "blindtest_track_track_id_fkey" FOREIGN KEY ("track_id") REFERENCES "track"("track_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blindtest_compulsory_track" ADD CONSTRAINT "blindtest_compulsory_track_blindtest_id_fkey" FOREIGN KEY ("blindtest_id") REFERENCES "blindtest"("blindtest_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blindtest_compulsory_track" ADD CONSTRAINT "blindtest_compulsory_track_track_id_fkey" FOREIGN KEY ("track_id") REFERENCES "track"("track_id") ON DELETE RESTRICT ON UPDATE CASCADE;
