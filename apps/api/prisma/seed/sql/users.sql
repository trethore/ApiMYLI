DROP TABLE IF EXISTS stg_user;
CREATE TEMP TABLE stg_user (
  created_at TIMESTAMP,
  has_consented TEXT,
  is_listening TEXT,
  frequency TEXT,
  context TEXT,
  when_listening DOUBLE PRECISION,
  how TEXT,
  platform TEXT,
  utility TEXT,
  track_genre TEXT,
  duration_pref_raw DOUBLE PRECISION,
  energy_pref TEXT,
  tempo_pref DOUBLE PRECISION,
  feeling_pref TEXT,
  is_live_pref TEXT,
  quality_pref_raw DOUBLE PRECISION,
  curiosity_pref_raw DOUBLE PRECISION,
  age_range TEXT,
  gender TEXT,
  position TEXT,
  account_uuid UUID DEFAULT uuid_generate_v4()
);

\copy stg_user (
  created_at,
  has_consented,
  is_listening,
  frequency,
  context,
  when_listening,
  how,
  platform,
  utility,
  track_genre,
  duration_pref_raw,
  energy_pref,
  tempo_pref,
  feeling_pref,
  is_live_pref,
  quality_pref_raw,
  curiosity_pref_raw,
  age_range,
  gender,
  position
) FROM __ANSWERS_CSV__ WITH (FORMAT csv, HEADER true, DELIMITER ',');

INSERT INTO account (account_id, login, name, email, created_at)
SELECT
  account_uuid,
  'user_' || substr(account_uuid::text, 1, 8),
  'User ' || substr(account_uuid::text, 1, 8),
  'user_' || substr(account_uuid::text, 1, 8) || '@test.com',
  created_at
FROM stg_user;

INSERT INTO "user" (account_id, pseudo)
SELECT
  account_uuid,
  'User_' || substr(account_uuid::text, 1, 8)
FROM stg_user;

INSERT INTO preference (
  account_id,
  age_range,
  gender,
  position,
  has_consented,
  is_listening,
  frequency,
  when_listening,
  duration_pref,
  energy_pref,
  tempo_pref,
  feeling_pref,
  is_live_pref,
  quality_pref,
  curiosity_pref,
  context,
  how,
  platform,
  utility
)
SELECT
  account_uuid,
  age_range,
  gender,
  position,
  parse_bool_text(has_consented),
  parse_bool_text(is_listening),
  frequency,
  when_listening,
  CAST(duration_pref_raw AS INT),
  energy_pref,
  tempo_pref,
  feeling_pref,
  is_live_pref,
  CAST(quality_pref_raw AS INT),
  CAST(curiosity_pref_raw AS INT),
  context,
  how,
  platform,
  utility
FROM stg_user;

WITH user_genres AS (
  SELECT
    account_uuid,
    trim(genre_name) AS genre_name
  FROM stg_user, unnest(parse_python_list(track_genre)) AS genre_name
)
INSERT INTO genre_preference (account_id, genre_id)
SELECT ug.account_uuid, g.genre_id
FROM user_genres ug
JOIN genre g ON lower(g.title) = lower(ug.genre_name)
ON CONFLICT DO NOTHING;
