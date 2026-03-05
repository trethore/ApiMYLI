-- ====================================================================================
-- USERS AND PREFERENCES
-- ====================================================================================
CREATE TEMP TABLE stg_user (
  created_at TIMESTAMP,
  has_consented TEXT,
  is_listening TEXT,
  frequency TEXT,
  context TEXT,
  "when" DOUBLE PRECISION,
  how TEXT,
  platform TEXT,
  utility TEXT,
  track_genre TEXT,
  duration DOUBLE PRECISION,
  energy TEXT,
  tempo DOUBLE PRECISION,
  feeling TEXT,
  is_live TEXT,
  quality DOUBLE PRECISION,
  curiosity DOUBLE PRECISION,
  age_range TEXT,
  gender TEXT,
  position TEXT,
  account_uuid UUID DEFAULT uuid_generate_v4()
);

\copy stg_user (created_at, has_consented, is_listening, frequency, context, "when", how, platform, utility, track_genre, duration, energy, tempo, feeling, is_live, quality, curiosity, age_range, gender, position) FROM './data/clean_answers.csv' WITH (FORMAT csv, HEADER true, DELIMITER ',');

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
  CASE
    WHEN has_consented IS NULL OR btrim(has_consented) = '' THEN NULL
    ELSE lower(btrim(has_consented)) IN ('true', 't', '1', 'yes', 'y')
  END,
  CASE
    WHEN is_listening IS NULL OR btrim(is_listening) = '' THEN NULL
    ELSE lower(btrim(is_listening)) IN ('true', 't', '1', 'yes', 'y')
  END,
  frequency,
  "when",
  CAST(duration AS INT),
  energy,
  tempo,
  feeling,
  is_live,
  CAST(quality AS INT),
  CAST(curiosity AS INT),
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
SELECT
  ug.account_uuid,
  g.genre_id
FROM user_genres ug
JOIN genre g ON lower(g.title) = lower(ug.genre_name)
ON CONFLICT DO NOTHING;
