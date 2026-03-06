-- ====================================================================================
-- MINIMAL INSERTS FOR REMAINING TABLES
-- ====================================================================================

CREATE TEMP TABLE stg_account_track_pair AS
WITH account_numbered AS (
  SELECT
    a.account_id,
    row_number() OVER (ORDER BY a.account_id) AS rn
  FROM account a
  LIMIT 500
),
track_numbered AS (
  SELECT
    t.track_id,
    row_number() OVER (ORDER BY t.track_id) AS rn
  FROM track t
),
track_count AS (
  SELECT COUNT(*)::INT AS total FROM track_numbered
)
SELECT
  a.account_id,
  a.rn,
  t.track_id
FROM account_numbered a
JOIN track_count tc ON tc.total > 0
JOIN track_numbered t ON t.rn = ((a.rn - 1) % tc.total) + 1;

INSERT INTO preference_vector (account_id)
SELECT a.account_id
FROM account a
ON CONFLICT (account_id) DO NOTHING;

WITH candidate_feat AS (
  SELECT
    t.track_id,
    aa.artist_id,
    row_number() OVER (PARTITION BY t.track_id ORDER BY aa.artist_id) AS rn
  FROM track t
  JOIN album_artist aa ON aa.album_id = t.album_id
  LEFT JOIN track_artist_main tam
    ON tam.track_id = t.track_id
   AND tam.artist_id = aa.artist_id
  WHERE tam.track_id IS NULL
),
feat_sample AS (
  SELECT track_id, artist_id
  FROM candidate_feat
  WHERE rn = 1
  ORDER BY track_id
  LIMIT 500
)
INSERT INTO track_artist_feat (track_id, artist_id)
SELECT track_id, artist_id
FROM feat_sample
ON CONFLICT (track_id, artist_id) DO NOTHING;

INSERT INTO playlist (playlist_id, playlist_name)
SELECT
  p.account_id,
  'Seed Playlist ' || p.rn
FROM stg_account_track_pair p
ON CONFLICT (playlist_id) DO NOTHING;

INSERT INTO playlist_account (playlist_id, account_id)
SELECT
  p.account_id,
  p.account_id
FROM stg_account_track_pair p
ON CONFLICT (playlist_id, account_id) DO NOTHING;

INSERT INTO track_account_like (track_id, account_id)
SELECT
  p.track_id,
  p.account_id
FROM stg_account_track_pair p
ON CONFLICT (track_id, account_id) DO NOTHING;

INSERT INTO track_account_listen (track_id, account_id, count, listened_at)
SELECT
  p.track_id,
  p.account_id,
  ((p.rn - 1) % 20) + 1,
  NOW() - (p.rn % 30) * INTERVAL '1 day'
FROM stg_account_track_pair p
ON CONFLICT (track_id, account_id)
DO UPDATE SET
  count = EXCLUDED.count,
  listened_at = EXCLUDED.listened_at;

INSERT INTO track_listen_history_item (
  listen_history_item_id,
  track_id,
  account_id,
  listened_at
)
SELECT
  uuid_generate_v4(),
  p.track_id,
  p.account_id,
  (NOW() - (p.rn % 30) * INTERVAL '1 day')
    - gs.minute_offset * INTERVAL '1 minute'
FROM stg_account_track_pair p
JOIN LATERAL generate_series(0, ((p.rn - 1) % 20)) AS gs(minute_offset) ON TRUE;

UPDATE track t
SET track_listens = stats.total_listens
FROM (
  SELECT
    tal.track_id,
    SUM(COALESCE(tal.count, 0))::BIGINT AS total_listens
  FROM track_account_listen tal
  GROUP BY tal.track_id
) AS stats
WHERE stats.track_id = t.track_id;

INSERT INTO playlist_track (playlist_id, track_id)
SELECT
  p.account_id,
  p.track_id
FROM stg_account_track_pair p
ON CONFLICT (playlist_id, track_id) DO NOTHING;

INSERT INTO track_comment (comment_id, track_id, account_id, content, created_at)
SELECT
  uuid_generate_v5(
    '6ba7b810-9dad-11d1-80b4-00c04fd430c8'::UUID,
    p.account_id::TEXT || ':' || p.track_id::TEXT
  ),
  p.track_id,
  p.account_id,
  'Seed comment ' || p.rn,
  NOW() - (p.rn % 15) * INTERVAL '1 day'
FROM stg_account_track_pair p
ON CONFLICT (comment_id) DO NOTHING;

INSERT INTO account_pinned_item (account_id, slot, item_type, track_id)
SELECT
  p.account_id,
  1,
  'TRACK'::pinned_item_type,
  p.track_id
FROM stg_account_track_pair p
ON CONFLICT (account_id, slot) DO NOTHING;

INSERT INTO account_pinned_item (account_id, slot, item_type, album_id)
SELECT
  p.account_id,
  2,
  'ALBUM'::pinned_item_type,
  t.album_id
FROM stg_account_track_pair p
JOIN track t ON t.track_id = p.track_id
WHERE t.album_id IS NOT NULL
ON CONFLICT (account_id, slot) DO NOTHING;

INSERT INTO account_pinned_item (account_id, slot, item_type, artist_id)
SELECT
  p.account_id,
  3,
  'ARTIST'::pinned_item_type,
  featured.artist_id
FROM stg_account_track_pair p
JOIN LATERAL (
  SELECT tam.artist_id
  FROM track_artist_main tam
  WHERE tam.track_id = p.track_id
  ORDER BY tam.artist_id
  LIMIT 1
) AS featured ON TRUE
ON CONFLICT (account_id, slot) DO NOTHING;

INSERT INTO account_pinned_item (account_id, slot, item_type, playlist_id)
SELECT
  p.account_id,
  4,
  'PLAYLIST'::pinned_item_type,
  p.account_id
FROM stg_account_track_pair p
ON CONFLICT (account_id, slot) DO NOTHING;