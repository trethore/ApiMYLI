DROP TABLE IF EXISTS stg_features;
CREATE TEMP TABLE stg_features (
  __STAGING_COLUMN_DEFINITIONS__
);

\copy stg_features FROM __FEATURES_CSV__ WITH (FORMAT csv, HEADER true, DELIMITER ',');

__ALTER_TEMPORAL_COLUMNS__

INSERT INTO temporal_feature (track_id, __DESTINATION_COLUMNS__)
SELECT m.new_uuid, __SELECT_EXPRESSIONS__
FROM stg_features s
JOIN _legacy_id_map m
  ON m.old_id = s."track_id"
 AND m.table_name = 'track'
ON CONFLICT (track_id) DO UPDATE
SET __UPDATE_EXPRESSIONS__;
