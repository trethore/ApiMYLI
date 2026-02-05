-- ====================================================================================
-- EXTENSIONS
-- ====================================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;

-- ====================================================================================
-- TABLES
-- ====================================================================================

-- CreateTable
CREATE TABLE "account" (
    "account_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "login" VARCHAR(255),
    "password" VARCHAR(255),
    "name" VARCHAR(255),
    "email" VARCHAR(255),
    "created_at" TIMESTAMP(6),

    CONSTRAINT "account_pkey" PRIMARY KEY ("account_id")
);

-- CreateTable
CREATE TABLE "artist" (
    "artist_id" UUID NOT NULL,
    "artist_bio" TEXT,
    "artist_location" TEXT,
    "artist_latitude" DOUBLE PRECISION,
    "artist_longitude" DOUBLE PRECISION,
    "artist_active_year_begin" INTEGER,
    "artist_active_year_end" INTEGER,
    "artist_favorites" BIGINT,
    "artist_comments" BIGINT,

    CONSTRAINT "artist_pkey" PRIMARY KEY ("artist_id")
);

-- CreateTable
CREATE TABLE "album" (
    "album_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "album_title" TEXT,
    "album_type" VARCHAR(255),
    "album_tracks_count" INTEGER,
    "album_date_released" DATE,
    "album_listens" BIGINT,
    "album_favorites" BIGINT,
    "album_comments" BIGINT,
    "album_producer" VARCHAR(255),

    CONSTRAINT "album_pkey" PRIMARY KEY ("album_id")
);

-- CreateTable
CREATE TABLE "genre" (
    "genre_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "parent_id" UUID,
    "title" VARCHAR(255),
    "top_level" INTEGER,

    CONSTRAINT "genre_pkey" PRIMARY KEY ("genre_id")
);

-- CreateTable
CREATE TABLE "track" (
    "track_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "album_id" UUID,
    "track_title" VARCHAR(255),
    "track_duration" BIGINT,
    "track_number" INTEGER,
    "track_disc_number" INTEGER,
    "track_explicit" BOOLEAN,
    "track_instrumental" BOOLEAN,
    "track_listens" BIGINT,
    "track_favorites" BIGINT,
    "track_interest" DOUBLE PRECISION,
    "track_comments" BIGINT,
    "track_date_created" DATE,
    "track_composer" VARCHAR(255),
    "track_lyricist" VARCHAR(255),
    "track_publisher" VARCHAR(255),

    CONSTRAINT "track_pkey" PRIMARY KEY ("track_id")
);

-- CreateTable
CREATE TABLE "audio_feature" (
    "track_id" UUID NOT NULL,
    "acousticness" DOUBLE PRECISION,
    "danceability" DOUBLE PRECISION,
    "energy" DOUBLE PRECISION,
    "instrumentalness" DOUBLE PRECISION,
    "liveness" DOUBLE PRECISION,
    "speechiness" DOUBLE PRECISION,
    "tempo" DOUBLE PRECISION,
    "valence" DOUBLE PRECISION,

    CONSTRAINT "audio_feature_pkey" PRIMARY KEY ("track_id")
);

-- CreateTable
CREATE TABLE "temporal_feature" (
    "track_id" UUID NOT NULL,

    CONSTRAINT "temporal_feature_pkey" PRIMARY KEY ("track_id")
);

-- CreateTable
CREATE TABLE "tag" (
    "tag_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tag_name" VARCHAR(255),

    CONSTRAINT "tag_pkey" PRIMARY KEY ("tag_id")
);

-- CreateTable
CREATE TABLE "playlist" (
    "playlist_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "playlist_name" VARCHAR(255),

    CONSTRAINT "playlist_pkey" PRIMARY KEY ("playlist_id")
);

-- CreateTable
CREATE TABLE "license" (
    "license_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "license_title" VARCHAR(255),
    "license_url" VARCHAR(255),

    CONSTRAINT "license_pkey" PRIMARY KEY ("license_id")
);

-- CreateTable
CREATE TABLE "rank_track" (
    "track_id" UUID NOT NULL,
    "ranks_date" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rank_song_currency" BIGINT,
    "rank_song_hotttnesss" BIGINT,

    CONSTRAINT "rank_track_pkey" PRIMARY KEY ("track_id","ranks_date")
);

-- CreateTable
CREATE TABLE "rank_artist" (
    "artist_id" UUID NOT NULL,
    "ranks_date" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rank_artist_discovery" BIGINT,
    "rank_artist_familiarity" BIGINT,
    "rank_artist_hotttnesss" BIGINT,

    CONSTRAINT "rank_artist_pkey" PRIMARY KEY ("artist_id","ranks_date")
);

-- CreateTable
CREATE TABLE "track_genre" (
    "track_id" UUID NOT NULL,
    "genre_id" UUID NOT NULL,

    CONSTRAINT "track_genre_pkey" PRIMARY KEY ("track_id","genre_id")
);

-- CreateTable
CREATE TABLE "track_tag" (
    "track_id" UUID NOT NULL,
    "tag_id" UUID NOT NULL,

    CONSTRAINT "track_tag_pkey" PRIMARY KEY ("track_id","tag_id")
);

-- CreateTable
CREATE TABLE "artist_tag" (
    "artist_id" UUID NOT NULL,
    "tag_id" UUID NOT NULL,

    CONSTRAINT "artist_tag_pkey" PRIMARY KEY ("artist_id","tag_id")
);

-- CreateTable
CREATE TABLE "album_artist" (
    "album_id" UUID NOT NULL,
    "artist_id" UUID NOT NULL,

    CONSTRAINT "album_artist_pkey" PRIMARY KEY ("album_id","artist_id")
);

-- CreateTable
CREATE TABLE "track_artist_main" (
    "track_id" UUID NOT NULL,
    "artist_id" UUID NOT NULL,

    CONSTRAINT "track_artist_main_pkey" PRIMARY KEY ("track_id","artist_id")
);

-- CreateTable
CREATE TABLE "track_artist_feat" (
    "track_id" UUID NOT NULL,
    "artist_id" UUID NOT NULL,

    CONSTRAINT "track_artist_feat_pkey" PRIMARY KEY ("track_id","artist_id")
);

-- CreateTable
CREATE TABLE "track_license" (
    "track_id" UUID NOT NULL,
    "license_id" UUID NOT NULL,

    CONSTRAINT "track_license_pkey" PRIMARY KEY ("track_id","license_id")
);

-- CreateTable
CREATE TABLE "playlist_track" (
    "playlist_id" UUID NOT NULL,
    "track_id" UUID NOT NULL,

    CONSTRAINT "playlist_track_pkey" PRIMARY KEY ("playlist_id","track_id")
);

-- CreateTable
CREATE TABLE "user" (
    "account_id" UUID NOT NULL,
    "pseudo" VARCHAR(255),

    CONSTRAINT "user_pkey" PRIMARY KEY ("account_id")
);

-- CreateTable
CREATE TABLE "preference" (
    "account_id" UUID NOT NULL,
    "age_range" VARCHAR(255),
    "gender" VARCHAR(255),
    "position" VARCHAR(255),
    "has_consented" BOOLEAN,
    "is_listening" BOOLEAN,
    "frequency" VARCHAR(255),
    "when_listening" DOUBLE PRECISION,
    "duration_pref" INTEGER,
    "energy_pref" VARCHAR(255),
    "tempo_pref" DOUBLE PRECISION,
    "feeling_pref" VARCHAR(255),
    "is_live_pref" VARCHAR(255),
    "quality_pref" INTEGER,
    "curiosity_pref" INTEGER,
    "context" VARCHAR(255),
    "how" VARCHAR(255),
    "platform" VARCHAR(255),
    "utility" VARCHAR(255),

    CONSTRAINT "preference_pkey" PRIMARY KEY ("account_id")
);

-- CreateTable
CREATE TABLE "preference_vector" (
    "account_id" UUID NOT NULL,
    "embedding" VECTOR(71),

    CONSTRAINT "preference_vector_pkey" PRIMARY KEY ("account_id")
);

-- CreateTable
CREATE TABLE "genre_preference" (
    "account_id" UUID NOT NULL,
    "genre_id" UUID NOT NULL,

    CONSTRAINT "genre_preference_pkey" PRIMARY KEY ("account_id","genre_id")
);

-- CreateTable
CREATE TABLE "playlist_user" (
    "playlist_id" UUID NOT NULL,
    "account_id" UUID NOT NULL,

    CONSTRAINT "playlist_user_pkey" PRIMARY KEY ("playlist_id","account_id")
);

-- CreateTable
CREATE TABLE "track_user_like" (
    "track_id" UUID NOT NULL,
    "account_id" UUID NOT NULL,

    CONSTRAINT "track_user_like_pkey" PRIMARY KEY ("track_id","account_id")
);

-- CreateTable
CREATE TABLE "track_user_listen" (
    "track_id" UUID NOT NULL,
    "account_id" UUID NOT NULL,
    "count" INTEGER DEFAULT 1,

    CONSTRAINT "track_user_listen_pkey" PRIMARY KEY ("track_id","account_id")
);

-- CreateTable
CREATE TABLE "track_comment" (
    "comment_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "track_id" UUID NOT NULL,
    "account_id" UUID,
    "content" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "track_comment_pkey" PRIMARY KEY ("comment_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "account_login_key" ON "account"("login");

-- AddForeignKey
ALTER TABLE "artist" ADD CONSTRAINT "artist_artist_id_fkey" FOREIGN KEY ("artist_id") REFERENCES "account"("account_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "genre" ADD CONSTRAINT "genre_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "genre"("genre_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "track" ADD CONSTRAINT "track_album_id_fkey" FOREIGN KEY ("album_id") REFERENCES "album"("album_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audio_feature" ADD CONSTRAINT "audio_feature_track_id_fkey" FOREIGN KEY ("track_id") REFERENCES "track"("track_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "temporal_feature" ADD CONSTRAINT "temporal_feature_track_id_fkey" FOREIGN KEY ("track_id") REFERENCES "track"("track_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rank_track" ADD CONSTRAINT "rank_track_track_id_fkey" FOREIGN KEY ("track_id") REFERENCES "track"("track_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rank_artist" ADD CONSTRAINT "rank_artist_artist_id_fkey" FOREIGN KEY ("artist_id") REFERENCES "artist"("artist_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "track_genre" ADD CONSTRAINT "track_genre_track_id_fkey" FOREIGN KEY ("track_id") REFERENCES "track"("track_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "track_genre" ADD CONSTRAINT "track_genre_genre_id_fkey" FOREIGN KEY ("genre_id") REFERENCES "genre"("genre_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "track_tag" ADD CONSTRAINT "track_tag_track_id_fkey" FOREIGN KEY ("track_id") REFERENCES "track"("track_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "track_tag" ADD CONSTRAINT "track_tag_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tag"("tag_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "artist_tag" ADD CONSTRAINT "artist_tag_artist_id_fkey" FOREIGN KEY ("artist_id") REFERENCES "artist"("artist_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "artist_tag" ADD CONSTRAINT "artist_tag_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tag"("tag_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "album_artist" ADD CONSTRAINT "album_artist_album_id_fkey" FOREIGN KEY ("album_id") REFERENCES "album"("album_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "album_artist" ADD CONSTRAINT "album_artist_artist_id_fkey" FOREIGN KEY ("artist_id") REFERENCES "artist"("artist_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "track_artist_main" ADD CONSTRAINT "track_artist_main_track_id_fkey" FOREIGN KEY ("track_id") REFERENCES "track"("track_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "track_artist_main" ADD CONSTRAINT "track_artist_main_artist_id_fkey" FOREIGN KEY ("artist_id") REFERENCES "artist"("artist_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "track_artist_feat" ADD CONSTRAINT "track_artist_feat_track_id_fkey" FOREIGN KEY ("track_id") REFERENCES "track"("track_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "track_artist_feat" ADD CONSTRAINT "track_artist_feat_artist_id_fkey" FOREIGN KEY ("artist_id") REFERENCES "artist"("artist_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "track_license" ADD CONSTRAINT "track_license_track_id_fkey" FOREIGN KEY ("track_id") REFERENCES "track"("track_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "track_license" ADD CONSTRAINT "track_license_license_id_fkey" FOREIGN KEY ("license_id") REFERENCES "license"("license_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "playlist_track" ADD CONSTRAINT "playlist_track_playlist_id_fkey" FOREIGN KEY ("playlist_id") REFERENCES "playlist"("playlist_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "playlist_track" ADD CONSTRAINT "playlist_track_track_id_fkey" FOREIGN KEY ("track_id") REFERENCES "track"("track_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "account"("account_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "preference" ADD CONSTRAINT "preference_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "user"("account_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "preference_vector" ADD CONSTRAINT "preference_vector_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "user"("account_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "genre_preference" ADD CONSTRAINT "genre_preference_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "preference"("account_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "genre_preference" ADD CONSTRAINT "genre_preference_genre_id_fkey" FOREIGN KEY ("genre_id") REFERENCES "genre"("genre_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "playlist_user" ADD CONSTRAINT "playlist_user_playlist_id_fkey" FOREIGN KEY ("playlist_id") REFERENCES "playlist"("playlist_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "playlist_user" ADD CONSTRAINT "playlist_user_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "user"("account_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "track_user_like" ADD CONSTRAINT "track_user_like_track_id_fkey" FOREIGN KEY ("track_id") REFERENCES "track"("track_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "track_user_like" ADD CONSTRAINT "track_user_like_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "user"("account_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "track_user_listen" ADD CONSTRAINT "track_user_listen_track_id_fkey" FOREIGN KEY ("track_id") REFERENCES "track"("track_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "track_user_listen" ADD CONSTRAINT "track_user_listen_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "user"("account_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "track_comment" ADD CONSTRAINT "track_comment_track_id_fkey" FOREIGN KEY ("track_id") REFERENCES "track"("track_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "track_comment" ADD CONSTRAINT "track_comment_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "user"("account_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ====================================================================================
-- VIEWS
-- ====================================================================================

CREATE OR REPLACE VIEW v_track_full AS
SELECT
    t.track_id,
    t.album_id,
    t.track_title,
    t.track_duration,
    t.track_number,
    t.track_disc_number,
    t.track_explicit,
    t.track_instrumental,
    t.track_listens,
    t.track_favorites,
    t.track_interest,
    t.track_comments,
    t.track_date_created,
    t.track_composer,
    t.track_lyricist,
    t.track_publisher,
    a.album_title,
    a.album_date_released,
    a.album_tracks_count,
    (SELECT json_agg(json_build_object('artist_id', tam.artist_id))
       FROM track_artist_main tam WHERE tam.track_id = t.track_id) AS main_artists,
    (SELECT json_agg(json_build_object('artist_id', taf.artist_id))
       FROM track_artist_feat taf WHERE taf.track_id = t.track_id) AS feat_artists,
    (SELECT json_agg(g.title)
       FROM track_genre tg JOIN genre g ON g.genre_id = tg.genre_id
       WHERE tg.track_id = t.track_id) AS genres,
    (SELECT json_agg(tag_name)
       FROM track_tag tt JOIN tag tg ON tg.tag_id = tt.tag_id
       WHERE tt.track_id = t.track_id) AS tags,
    af.acousticness,
    af.danceability,
    af.energy,
    af.instrumentalness,
    af.liveness,
    af.speechiness,
    af.tempo,
    af.valence,
    to_jsonb(tf) - 'track_id' AS temporal_features
FROM track t
LEFT JOIN album a ON t.album_id = a.album_id
LEFT JOIN audio_feature af ON af.track_id = t.track_id
LEFT JOIN temporal_feature tf ON tf.track_id = t.track_id;

CREATE OR REPLACE VIEW v_album_full AS
SELECT
    al.album_id,
    al.album_title,
    al.album_type,
    al.album_tracks_count,
    al.album_date_released,
    (SELECT json_agg(json_build_object('artist_id', aa.artist_id))
       FROM album_artist aa WHERE aa.album_id = al.album_id) AS artists,
    (SELECT json_agg(json_build_object('track_id', t.track_id, 'track_title', t.track_title, 'track_number', t.track_number))
       FROM track t WHERE t.album_id = al.album_id) AS tracks
FROM album al;

CREATE OR REPLACE VIEW v_artist_full AS
SELECT
    ar.artist_id,
    ar.artist_bio,
    ar.artist_location,
    ar.artist_latitude,
    ar.artist_longitude,
    ar.artist_active_year_begin,
    ar.artist_active_year_end,
    ar.artist_favorites,
    ar.artist_comments,
    (SELECT json_agg(tag_id) FROM artist_tag at WHERE at.artist_id = ar.artist_id) AS tags,
    (SELECT json_agg(album_id) FROM album_artist aa WHERE aa.artist_id = ar.artist_id) AS albums,
    (SELECT json_agg(track_id) FROM track_artist_main tam WHERE tam.artist_id = ar.artist_id) AS main_tracks,
    (SELECT json_agg(track_id) FROM track_artist_feat taf WHERE taf.artist_id = ar.artist_id) AS feat_tracks
FROM artist ar;

CREATE OR REPLACE VIEW v_tracks_list AS
SELECT
    track_id,
    track_title,
    track_duration,
    track_listens,
    track_favorites,
    track_comments
FROM track;

CREATE OR REPLACE VIEW v_albums_list AS
SELECT
    album_id,
    album_title,
    album_tracks_count,
    album_listens,
    album_favorites,
    album_comments
FROM album;

CREATE OR REPLACE VIEW v_artists_list AS
SELECT
    artist_id,
    artist_bio,
    artist_location,
    artist_favorites,
    artist_comments
FROM artist;

CREATE OR REPLACE VIEW v_track_popularity AS
SELECT
    t.track_id,
    t.track_title,
    t.track_listens,
    t.track_favorites,
    t.track_comments,
    rt.rank_song_currency,
    rt.rank_song_hotttnesss
FROM track t
LEFT JOIN LATERAL (
    SELECT rank_song_currency, rank_song_hotttnesss
    FROM rank_track
    WHERE track_id = t.track_id
    ORDER BY ranks_date DESC
    LIMIT 1
) rt ON true;

CREATE OR REPLACE VIEW v_artist_popularity AS
SELECT
    ar.artist_id,
    ar.artist_bio,
    ar.artist_favorites,
    ar.artist_comments,
    ra.rank_artist_discovery,
    ra.rank_artist_familiarity,
    ra.rank_artist_hotttnesss
FROM artist ar
LEFT JOIN LATERAL (
    SELECT rank_artist_discovery, rank_artist_familiarity, rank_artist_hotttnesss
    FROM rank_artist
    WHERE artist_id = ar.artist_id
    ORDER BY ranks_date DESC
    LIMIT 1
) ra ON true;

CREATE OR REPLACE VIEW v_user_playlists AS
SELECT
    u.account_id,
    u.pseudo,
    pu.playlist_id,
    p.playlist_name,
    (SELECT json_agg(pt.track_id ORDER BY pt.track_id)
       FROM playlist_track pt WHERE pt.playlist_id = p.playlist_id) AS track_ids
FROM "user" u
LEFT JOIN playlist_user pu ON pu.account_id = u.account_id
LEFT JOIN playlist p ON p.playlist_id = pu.playlist_id;

CREATE OR REPLACE VIEW v_track_comments AS
SELECT
    tc.track_id,
    json_agg(json_build_object('comment_id', tc.comment_id, 'account_id', tc.account_id, 'content', tc.content, 'created_at', tc.created_at) ORDER BY tc.created_at) AS comments
FROM track_comment tc
GROUP BY tc.track_id;

CREATE OR REPLACE VIEW v_user_listen_history AS
SELECT
    tul.account_id,
    json_agg(tul.track_id) AS listened_track_ids
FROM track_user_listen tul
GROUP BY tul.account_id;

CREATE OR REPLACE VIEW v_user_summary AS
SELECT
    u.account_id,
    u.pseudo,
    a.login,
    a.email,
    a.name,
    a.created_at AS account_created_at,
    p.age_range,
    p.gender,
    p.position,
    p.has_consented,
    p.is_listening,
    p.frequency,
    p.when_listening,
    p.duration_pref,
    p.energy_pref,
    p.tempo_pref,
    p.feeling_pref,
    p.is_live_pref,
    p.quality_pref,
    p.curiosity_pref,
    p.context,
    p.how,
    p.platform,
    p.utility,
    (SELECT json_agg(g.title)
     FROM genre_preference gp
     JOIN genre g ON g.genre_id = gp.genre_id
     WHERE gp.account_id = u.account_id) AS track_genres
FROM "user" u
LEFT JOIN account a ON a.account_id = u.account_id
LEFT JOIN preference p ON p.account_id = u.account_id;

CREATE OR REPLACE VIEW v_tracks_recommended AS
SELECT
    t.track_id,
    t.track_title,
    af.energy,
    af.tempo,
    af.valence,
    rt.rank_song_hotttnesss,
    t.track_listens,
    t.track_favorites
FROM track t
LEFT JOIN audio_feature af ON af.track_id = t.track_id
LEFT JOIN LATERAL (
    SELECT rank_song_hotttnesss
    FROM rank_track
    WHERE track_id = t.track_id
    ORDER BY ranks_date DESC
    LIMIT 1
) rt ON true;

CREATE OR REPLACE VIEW v_entity_tags AS
SELECT 'track' AS entity_type, tt.track_id AS entity_id, tg.tag_id, tg.tag_name
FROM track_tag tt
JOIN tag tg ON tg.tag_id = tt.tag_id
UNION ALL
SELECT 'artist' AS entity_type, at.artist_id AS entity_id, tg.tag_id, tg.tag_name
FROM artist_tag at
JOIN tag tg ON tg.tag_id = at.tag_id;

CREATE OR REPLACE VIEW v_track_audio AS
SELECT
    t.track_id,
    af.acousticness,
    af.danceability,
    af.energy,
    af.instrumentalness,
    af.liveness,
    af.speechiness,
    af.tempo,
    af.valence,
    to_jsonb(tf) - 'track_id' AS temporal_features
FROM track t
LEFT JOIN audio_feature af ON af.track_id = t.track_id
LEFT JOIN temporal_feature tf ON tf.track_id = t.track_id;

-- ====================================================================================
-- FUNCTIONS
-- ====================================================================================

CREATE OR REPLACE FUNCTION f_inc_album_tracks_count(p_album_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE album
  SET album_tracks_count = COALESCE(album_tracks_count,0) + 1
  WHERE album_id = p_album_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION f_dec_album_tracks_count(p_album_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE album
  SET album_tracks_count = GREATEST(COALESCE(album_tracks_count,0) - 1, 0)
  WHERE album_id = p_album_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION f_track_before_insert_create_album_if_null()
RETURNS trigger AS $$
DECLARE created_album_id UUID;
BEGIN
  IF NEW.album_id IS NULL THEN
    INSERT INTO album(album_title, album_type, album_tracks_count, album_date_released)
    VALUES (COALESCE(NEW.track_title, 'Untitled') || ' - Single', 'single', 1, COALESCE(NEW.track_date_created, CURRENT_DATE))
    RETURNING album_id INTO created_album_id;

    NEW.album_id := created_album_id;
    NEW.track_listens := COALESCE(NEW.track_listens, 0);
    NEW.track_favorites := COALESCE(NEW.track_favorites, 0);
    NEW.track_comments := COALESCE(NEW.track_comments, 0);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION f_track_after_insert_postcreate()
RETURNS trigger AS $$
BEGIN
  IF NEW.album_id IS NOT NULL THEN
    PERFORM f_inc_album_tracks_count(NEW.album_id);
  END IF;

  INSERT INTO rank_track(track_id, rank_song_currency, rank_song_hotttnesss)
  VALUES (NEW.track_id, 0, 0);

  INSERT INTO audio_feature(track_id) VALUES (NEW.track_id)
  ON CONFLICT (track_id) DO NOTHING;

  INSERT INTO temporal_feature(track_id) VALUES (NEW.track_id)
  ON CONFLICT (track_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION f_track_before_delete_cleanup()
RETURNS trigger AS $$
BEGIN
    DELETE FROM track_artist_main WHERE track_id = OLD.track_id;
    DELETE FROM track_artist_feat WHERE track_id = OLD.track_id;
    DELETE FROM track_license WHERE track_id = OLD.track_id;
    DELETE FROM track_genre WHERE track_id = OLD.track_id;
    DELETE FROM track_tag WHERE track_id = OLD.track_id;
    DELETE FROM playlist_track WHERE track_id = OLD.track_id;
    DELETE FROM track_user_like WHERE track_id = OLD.track_id;
    DELETE FROM track_user_listen WHERE track_id = OLD.track_id;
    DELETE FROM track_comment WHERE track_id = OLD.track_id;
    DELETE FROM rank_track WHERE track_id = OLD.track_id;
    DELETE FROM audio_feature WHERE track_id = OLD.track_id;
    DELETE FROM temporal_feature WHERE track_id = OLD.track_id;

    IF OLD.album_id IS NOT NULL THEN
        PERFORM f_dec_album_tracks_count(OLD.album_id);
    END IF;

    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION f_prevent_album_delete_if_tracks()
RETURNS trigger AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM track WHERE album_id = OLD.album_id) THEN
    RAISE EXCEPTION 'Impossible de supprimer l''album % : il contient des tracks.', OLD.album_id;
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION f_inc_track_favorites_on_like()
RETURNS trigger AS $$
BEGIN
  UPDATE track SET track_favorites = COALESCE(track_favorites,0) + 1 WHERE track_id = NEW.track_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION f_dec_track_favorites_on_unlike()
RETURNS trigger AS $$
BEGIN
  UPDATE track SET track_favorites = GREATEST(COALESCE(track_favorites,0) - 1, 0) WHERE track_id = OLD.track_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION f_inc_track_listens_on_listen()
RETURNS trigger AS $$
BEGIN
  UPDATE track SET track_listens = COALESCE(track_listens,0) + 1 WHERE track_id = NEW.track_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION f_inc_track_comments_on_comment()
RETURNS trigger AS $$
BEGIN
  UPDATE track SET track_comments = COALESCE(track_comments,0) + 1 WHERE track_id = NEW.track_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION f_dec_track_comments_on_comment_delete()
RETURNS trigger AS $$
BEGIN
  UPDATE track SET track_comments = GREATEST(COALESCE(track_comments,0) - 1,0) WHERE track_id = OLD.track_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION f_create_playlist_if_none_for_user()
RETURNS trigger AS $$
DECLARE p_id UUID;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM playlist_user WHERE account_id = NEW.account_id) THEN
    INSERT INTO playlist(playlist_name) VALUES ('My First Playlist') RETURNING playlist_id INTO p_id;
    INSERT INTO playlist_user(playlist_id, account_id) VALUES (p_id, NEW.account_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION f_auto_create_rank_artist()
RETURNS trigger AS $$
BEGIN
  INSERT INTO rank_artist(artist_id, rank_artist_discovery, rank_artist_familiarity, rank_artist_hotttnesss)
  VALUES (NEW.artist_id, 0, 0, 0);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION f_recompute_artist_counters(p_artist_id UUID)
RETURNS void AS $$
DECLARE fav_sum BIGINT;
DECLARE com_sum BIGINT;
BEGIN
  SELECT COALESCE(SUM(t.track_favorites),0) INTO fav_sum
  FROM track t
  WHERE EXISTS (SELECT 1 FROM track_artist_main tam WHERE tam.track_id = t.track_id AND tam.artist_id = p_artist_id)
     OR EXISTS (SELECT 1 FROM track_artist_feat taf WHERE taf.track_id = t.track_id AND taf.artist_id = p_artist_id);

  SELECT COALESCE(SUM(t.track_comments),0) INTO com_sum
  FROM track t
  WHERE EXISTS (SELECT 1 FROM track_artist_main tam WHERE tam.track_id = t.track_id AND tam.artist_id = p_artist_id)
     OR EXISTS (SELECT 1 FROM track_artist_feat taf WHERE taf.track_id = t.track_id AND taf.artist_id = p_artist_id);

  UPDATE artist
  SET artist_favorites = fav_sum,
      artist_comments = com_sum
  WHERE artist_id = p_artist_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION f_after_track_artist_main_change()
RETURNS trigger AS $$
BEGIN
  PERFORM f_recompute_artist_counters(NEW.artist_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION f_after_delete_track_artist_main()
RETURNS trigger AS $$
BEGIN
  PERFORM f_recompute_artist_counters(OLD.artist_id);
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION f_after_track_artist_feat_change()
RETURNS trigger AS $$
BEGIN
  PERFORM f_recompute_artist_counters(NEW.artist_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION f_after_delete_track_artist_feat()
RETURNS trigger AS $$
BEGIN
  PERFORM f_recompute_artist_counters(OLD.artist_id);
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION f_after_like_change_recompute_artists()
RETURNS trigger AS $$
DECLARE v_track UUID := NEW.track_id;
BEGIN
  PERFORM f_recompute_artist_counters(artist_id) FROM track_artist_main WHERE track_id = v_track;
  PERFORM f_recompute_artist_counters(artist_id) FROM track_artist_feat WHERE track_id = v_track;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION f_after_comment_change_recompute_artists()
RETURNS trigger AS $$
DECLARE v_track UUID := NEW.track_id;
BEGIN
  PERFORM f_recompute_artist_counters(artist_id) FROM track_artist_main WHERE track_id = v_track;
  PERFORM f_recompute_artist_counters(artist_id) FROM track_artist_feat WHERE track_id = v_track;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION ensure_artist_account()
RETURNS TRIGGER AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM account WHERE account_id = NEW.artist_id) THEN
        INSERT INTO account(account_id, login, email, name, created_at)
        VALUES (
            NEW.artist_id,
            'artist_' || NEW.artist_id::text,
            'artist_' || NEW.artist_id::text || '@example.com',
            'Artist_' || NEW.artist_id::text,
            CURRENT_TIMESTAMP
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_listen_count(p_account_id UUID, p_track_id UUID)
RETURNS VOID AS $$
BEGIN
    INSERT INTO track_user_listen (account_id, track_id, count)
    VALUES (p_account_id, p_track_id, 1)
    ON CONFLICT (track_id, account_id)
    DO UPDATE SET count = track_user_listen.count + 1;
END;
$$ LANGUAGE plpgsql;

-- ====================================================================================
-- TRIGGERS
-- ====================================================================================

CREATE TRIGGER tr_track_before_insert_create_album_if_null
BEFORE INSERT ON track
FOR EACH ROW
EXECUTE FUNCTION f_track_before_insert_create_album_if_null();

CREATE TRIGGER tr_track_after_insert_postcreate
AFTER INSERT ON track
FOR EACH ROW
EXECUTE FUNCTION f_track_after_insert_postcreate();

CREATE TRIGGER tr_track_before_delete_cleanup
BEFORE DELETE ON track
FOR EACH ROW
EXECUTE FUNCTION f_track_before_delete_cleanup();

CREATE TRIGGER tr_prevent_album_delete
BEFORE DELETE ON album
FOR EACH ROW
EXECUTE FUNCTION f_prevent_album_delete_if_tracks();

CREATE TRIGGER tr_inc_track_favorites
AFTER INSERT ON track_user_like
FOR EACH ROW
EXECUTE FUNCTION f_inc_track_favorites_on_like();

CREATE TRIGGER tr_dec_track_favorites
AFTER DELETE ON track_user_like
FOR EACH ROW
EXECUTE FUNCTION f_dec_track_favorites_on_unlike();

CREATE TRIGGER tr_inc_track_listens
AFTER INSERT ON track_user_listen
FOR EACH ROW
EXECUTE FUNCTION f_inc_track_listens_on_listen();

CREATE TRIGGER tr_inc_track_comments
AFTER INSERT ON track_comment
FOR EACH ROW
EXECUTE FUNCTION f_inc_track_comments_on_comment();

CREATE TRIGGER tr_dec_track_comments
AFTER DELETE ON track_comment
FOR EACH ROW
EXECUTE FUNCTION f_dec_track_comments_on_comment_delete();

CREATE TRIGGER tr_create_playlist_if_none
AFTER INSERT ON track_user_like
FOR EACH ROW
EXECUTE FUNCTION f_create_playlist_if_none_for_user();

CREATE TRIGGER tr_auto_create_rank_artist
AFTER INSERT ON artist
FOR EACH ROW
EXECUTE FUNCTION f_auto_create_rank_artist();

CREATE TRIGGER tr_after_insert_track_artist_main
AFTER INSERT ON track_artist_main
FOR EACH ROW
EXECUTE FUNCTION f_after_track_artist_main_change();

CREATE TRIGGER tr_after_delete_track_artist_main
AFTER DELETE ON track_artist_main
FOR EACH ROW
EXECUTE FUNCTION f_after_delete_track_artist_main();

CREATE TRIGGER tr_after_insert_track_artist_feat
AFTER INSERT ON track_artist_feat
FOR EACH ROW
EXECUTE FUNCTION f_after_track_artist_feat_change();

CREATE TRIGGER tr_after_delete_track_artist_feat
AFTER DELETE ON track_artist_feat
FOR EACH ROW
EXECUTE FUNCTION f_after_delete_track_artist_feat();

CREATE TRIGGER tr_after_like_insert_recompute_artists
AFTER INSERT ON track_user_like
FOR EACH ROW
EXECUTE FUNCTION f_after_like_change_recompute_artists();

CREATE TRIGGER tr_after_like_delete_recompute_artists
AFTER DELETE ON track_user_like
FOR EACH ROW
EXECUTE FUNCTION f_after_like_change_recompute_artists();

CREATE TRIGGER tr_after_comment_insert_recompute_artists
AFTER INSERT ON track_comment
FOR EACH ROW
EXECUTE FUNCTION f_after_comment_change_recompute_artists();

CREATE TRIGGER tr_after_comment_delete_recompute_artists
AFTER DELETE ON track_comment
FOR EACH ROW
EXECUTE FUNCTION f_after_comment_change_recompute_artists();

CREATE TRIGGER trg_ensure_artist_account
BEFORE INSERT ON artist
FOR EACH ROW
EXECUTE FUNCTION ensure_artist_account();
