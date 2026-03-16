CREATE TABLE "track_account_dislike" (
    "track_id" UUID NOT NULL,
    "account_id" UUID NOT NULL,

    CONSTRAINT "track_account_dislike_pkey" PRIMARY KEY ("track_id", "account_id")
);

ALTER TABLE "track_account_dislike"
ADD CONSTRAINT "track_account_dislike_track_id_fkey"
FOREIGN KEY ("track_id") REFERENCES "track"("track_id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "track_account_dislike"
ADD CONSTRAINT "track_account_dislike_account_id_fkey"
FOREIGN KEY ("account_id") REFERENCES "account"("account_id") ON DELETE RESTRICT ON UPDATE CASCADE;

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
  DELETE FROM track_account_dislike WHERE track_id = OLD.track_id;
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
