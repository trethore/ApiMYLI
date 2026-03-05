-- ====================================================================================
-- LICENSES
-- ====================================================================================
WITH normalized_licenses AS (
  SELECT DISTINCT
    NULLIF(btrim(license_title), '') AS license_title,
    NULLIF(btrim(license_url), '') AS license_url
  FROM stg_raw_track_numbers
),
missing_licenses AS (
  SELECT nl.license_title, nl.license_url
  FROM normalized_licenses nl
  WHERE nl.license_title IS NOT NULL OR nl.license_url IS NOT NULL
  EXCEPT
  SELECT l.license_title, l.license_url
  FROM license l
)
INSERT INTO license (license_id, license_title, license_url)
SELECT uuid_generate_v4(), license_title, license_url
FROM missing_licenses;

INSERT INTO track_license (track_id, license_id)
SELECT DISTINCT
  t.new_uuid,
  license_match.license_id
FROM stg_track t
JOIN stg_raw_track_numbers r ON r.track_id = t.track_id
JOIN LATERAL (
  SELECT l.license_id
  FROM license l
  WHERE l.license_title IS NOT DISTINCT FROM NULLIF(btrim(r.license_title), '')
    AND l.license_url IS NOT DISTINCT FROM NULLIF(btrim(r.license_url), '')
  ORDER BY l.license_id
  LIMIT 1
) license_match ON TRUE
JOIN track tr ON tr.track_id = t.new_uuid
ON CONFLICT DO NOTHING;
