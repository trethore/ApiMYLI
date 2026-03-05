ALTER TABLE "account"
ADD COLUMN IF NOT EXISTS "pseudo" VARCHAR(255);

UPDATE "account" AS a
SET "pseudo" = COALESCE(u."pseudo", a."login")
FROM "user" AS u
WHERE a."account_id" = u."account_id"
  AND (a."pseudo" IS NULL OR btrim(a."pseudo") = '');

UPDATE "account"
SET "pseudo" = "login"
WHERE ("pseudo" IS NULL OR btrim("pseudo") = '')
  AND "login" IS NOT NULL;

DROP VIEW IF EXISTS "v_user_playlists";
DROP VIEW IF EXISTS "v_user_listen_history";
DROP VIEW IF EXISTS "v_user_summary";
DROP VIEW IF EXISTS "v_account_playlists";
DROP VIEW IF EXISTS "v_account_listen_history";
DROP VIEW IF EXISTS "v_account_summary";

ALTER TABLE "preference" DROP CONSTRAINT IF EXISTS "preference_account_id_fkey";
ALTER TABLE "preference_vector" DROP CONSTRAINT IF EXISTS "preference_vector_account_id_fkey";
ALTER TABLE "track_comment" DROP CONSTRAINT IF EXISTS "track_comment_account_id_fkey";
ALTER TABLE "playlist_user" DROP CONSTRAINT IF EXISTS "playlist_user_account_id_fkey";
ALTER TABLE "track_user_like" DROP CONSTRAINT IF EXISTS "track_user_like_account_id_fkey";
ALTER TABLE "track_user_listen" DROP CONSTRAINT IF EXISTS "track_user_listen_account_id_fkey";
ALTER TABLE "user_pinned_item" DROP CONSTRAINT IF EXISTS "user_pinned_item_account_id_fkey";

ALTER TABLE "playlist_user" RENAME TO "playlist_account";
ALTER TABLE "track_user_like" RENAME TO "track_account_like";
ALTER TABLE "track_user_listen" RENAME TO "track_account_listen";
ALTER TABLE "user_pinned_item" RENAME TO "account_pinned_item";

ALTER TABLE "playlist_account" RENAME CONSTRAINT "playlist_user_pkey" TO "playlist_account_pkey";
ALTER TABLE "playlist_account" RENAME CONSTRAINT "playlist_user_playlist_id_fkey" TO "playlist_account_playlist_id_fkey";

ALTER TABLE "track_account_like" RENAME CONSTRAINT "track_user_like_pkey" TO "track_account_like_pkey";
ALTER TABLE "track_account_like" RENAME CONSTRAINT "track_user_like_track_id_fkey" TO "track_account_like_track_id_fkey";

ALTER TABLE "track_account_listen" RENAME CONSTRAINT "track_user_listen_pkey" TO "track_account_listen_pkey";
ALTER TABLE "track_account_listen" RENAME CONSTRAINT "track_user_listen_track_id_fkey" TO "track_account_listen_track_id_fkey";

ALTER TABLE "account_pinned_item" RENAME CONSTRAINT "user_pinned_item_pkey" TO "account_pinned_item_pkey";
ALTER TABLE "account_pinned_item" RENAME CONSTRAINT "user_pinned_item_slot_check" TO "account_pinned_item_slot_check";
ALTER TABLE "account_pinned_item" RENAME CONSTRAINT "user_pinned_item_item_check" TO "account_pinned_item_item_check";
ALTER TABLE "account_pinned_item" RENAME CONSTRAINT "user_pinned_item_track_id_fkey" TO "account_pinned_item_track_id_fkey";
ALTER TABLE "account_pinned_item" RENAME CONSTRAINT "user_pinned_item_album_id_fkey" TO "account_pinned_item_album_id_fkey";
ALTER TABLE "account_pinned_item" RENAME CONSTRAINT "user_pinned_item_artist_id_fkey" TO "account_pinned_item_artist_id_fkey";
ALTER TABLE "account_pinned_item" RENAME CONSTRAINT "user_pinned_item_playlist_id_fkey" TO "account_pinned_item_playlist_id_fkey";

ALTER TABLE "preference"
ADD CONSTRAINT "preference_account_id_fkey"
FOREIGN KEY ("account_id") REFERENCES "account"("account_id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "preference_vector"
ADD CONSTRAINT "preference_vector_account_id_fkey"
FOREIGN KEY ("account_id") REFERENCES "account"("account_id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "playlist_account"
ADD CONSTRAINT "playlist_account_account_id_fkey"
FOREIGN KEY ("account_id") REFERENCES "account"("account_id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "track_account_like"
ADD CONSTRAINT "track_account_like_account_id_fkey"
FOREIGN KEY ("account_id") REFERENCES "account"("account_id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "track_account_listen"
ADD CONSTRAINT "track_account_listen_account_id_fkey"
FOREIGN KEY ("account_id") REFERENCES "account"("account_id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "account_pinned_item"
ADD CONSTRAINT "account_pinned_item_account_id_fkey"
FOREIGN KEY ("account_id") REFERENCES "account"("account_id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "track_comment"
ADD CONSTRAINT "track_comment_account_id_fkey"
FOREIGN KEY ("account_id") REFERENCES "account"("account_id") ON DELETE SET NULL ON UPDATE CASCADE;

DROP TABLE IF EXISTS "user";

CREATE OR REPLACE VIEW "v_account_playlists" AS
SELECT
  a."account_id",
  a."pseudo",
  pa."playlist_id",
  p."playlist_name",
  (
    SELECT json_agg(pt."track_id" ORDER BY pt."track_id")
    FROM "playlist_track" AS pt
    WHERE pt."playlist_id" = p."playlist_id"
  ) AS "track_ids"
FROM "account" AS a
LEFT JOIN "playlist_account" AS pa ON pa."account_id" = a."account_id"
LEFT JOIN "playlist" AS p ON p."playlist_id" = pa."playlist_id";

CREATE OR REPLACE VIEW "v_account_listen_history" AS
SELECT
  tal."account_id",
  json_agg(tal."track_id") AS "listened_track_ids"
FROM "track_account_listen" AS tal
GROUP BY tal."account_id";

CREATE OR REPLACE VIEW "v_account_summary" AS
SELECT
  a."account_id",
  a."pseudo",
  a."login",
  a."email",
  a."name",
  a."created_at" AS "account_created_at",
  p."age_range",
  p."gender",
  p."position",
  p."has_consented",
  p."is_listening",
  p."frequency",
  p."when_listening",
  p."duration_pref",
  p."energy_pref",
  p."tempo_pref",
  p."feeling_pref",
  p."is_live_pref",
  p."quality_pref",
  p."curiosity_pref",
  p."context",
  p."how",
  p."platform",
  p."utility",
  (
    SELECT json_agg(g."title")
    FROM "genre_preference" AS gp
    JOIN "genre" AS g ON g."genre_id" = gp."genre_id"
    WHERE gp."account_id" = a."account_id"
  ) AS "track_genres"
FROM "account" AS a
LEFT JOIN "preference" AS p ON p."account_id" = a."account_id";

CREATE OR REPLACE FUNCTION f_track_before_delete_cleanup()
RETURNS trigger AS $$
BEGIN
  DELETE FROM track_artist_main WHERE track_id = OLD.track_id;
  DELETE FROM track_artist_feat WHERE track_id = OLD.track_id;
  DELETE FROM track_license WHERE track_id = OLD.track_id;
  DELETE FROM track_genre WHERE track_id = OLD.track_id;
  DELETE FROM track_tag WHERE track_id = OLD.track_id;
  DELETE FROM playlist_track WHERE track_id = OLD.track_id;
  DELETE FROM track_account_like WHERE track_id = OLD.track_id;
  DELETE FROM track_account_listen WHERE track_id = OLD.track_id;
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

CREATE OR REPLACE FUNCTION f_create_playlist_if_none_for_account()
RETURNS trigger AS $$
DECLARE p_id UUID;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM playlist_account WHERE account_id = NEW.account_id) THEN
    INSERT INTO playlist(playlist_name) VALUES ('My First Playlist') RETURNING playlist_id INTO p_id;
    INSERT INTO playlist_account(playlist_id, account_id) VALUES (p_id, NEW.account_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION ensure_artist_account()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM account WHERE account_id = NEW.artist_id) THEN
    INSERT INTO account(account_id, login, pseudo, email, name, created_at)
    VALUES (
      NEW.artist_id,
      'artist_' || NEW.artist_id::text,
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
  INSERT INTO track_account_listen (account_id, track_id, count, listened_at)
  VALUES (p_account_id, p_track_id, 1, CURRENT_TIMESTAMP)
  ON CONFLICT (track_id, account_id)
  DO UPDATE SET count = track_account_listen.count + 1,
                listened_at = CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_inc_track_favorites ON "track_account_like";
DROP TRIGGER IF EXISTS tr_dec_track_favorites ON "track_account_like";
DROP TRIGGER IF EXISTS tr_inc_track_listens ON "track_account_listen";
DROP TRIGGER IF EXISTS tr_create_playlist_if_none ON "track_account_like";
DROP TRIGGER IF EXISTS tr_after_like_insert_recompute_artists ON "track_account_like";
DROP TRIGGER IF EXISTS tr_after_like_delete_recompute_artists ON "track_account_like";

DROP FUNCTION IF EXISTS f_create_playlist_if_none_for_user();

CREATE TRIGGER tr_inc_track_favorites
AFTER INSERT ON "track_account_like"
FOR EACH ROW
EXECUTE FUNCTION f_inc_track_favorites_on_like();

CREATE TRIGGER tr_dec_track_favorites
AFTER DELETE ON "track_account_like"
FOR EACH ROW
EXECUTE FUNCTION f_dec_track_favorites_on_unlike();

CREATE TRIGGER tr_inc_track_listens
AFTER INSERT ON "track_account_listen"
FOR EACH ROW
EXECUTE FUNCTION f_inc_track_listens_on_listen();

CREATE TRIGGER tr_create_playlist_if_none
AFTER INSERT ON "track_account_like"
FOR EACH ROW
EXECUTE FUNCTION f_create_playlist_if_none_for_account();

CREATE TRIGGER tr_after_like_insert_recompute_artists
AFTER INSERT ON "track_account_like"
FOR EACH ROW
EXECUTE FUNCTION f_after_like_change_recompute_artists();

CREATE TRIGGER tr_after_like_delete_recompute_artists
AFTER DELETE ON "track_account_like"
FOR EACH ROW
EXECUTE FUNCTION f_after_like_change_recompute_artists();
