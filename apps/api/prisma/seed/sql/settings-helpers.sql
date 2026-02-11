SET synchronous_commit = off;

CREATE OR REPLACE FUNCTION parse_python_list(p_text TEXT) RETURNS TEXT[] AS $$
DECLARE
  clean_text TEXT;
BEGIN
  IF p_text IS NULL OR p_text = '' OR p_text = '[]' THEN
    RETURN ARRAY[]::TEXT[];
  END IF;

  clean_text := p_text;

  IF position('""' IN clean_text) > 0 THEN
    clean_text := replace(clean_text, '""', '"');
  END IF;

  IF left(clean_text, 2) = '[''' THEN
    clean_text := replace(clean_text, '''', '"');
  END IF;

  IF left(clean_text, 1) = '[' AND position('''' IN clean_text) > 0 AND position('"' IN clean_text) = 0 THEN
    clean_text := replace(clean_text, '''', '"');
  END IF;

  BEGIN
    RETURN ARRAY(SELECT jsonb_array_elements_text(clean_text::jsonb));
  EXCEPTION WHEN OTHERS THEN
    RETURN string_to_array(
      replace(replace(replace(trim(both '[]' from p_text), '''', ''), '"', ''), ', ', ','),
      ','
    );
  END;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION parse_bool_text(p_text TEXT) RETURNS BOOLEAN AS $$
DECLARE
  normalized_text TEXT;
BEGIN
  IF p_text IS NULL THEN
    RETURN NULL;
  END IF;

  normalized_text := lower(trim(p_text));
  IF normalized_text = '' THEN
    RETURN NULL;
  END IF;

  IF normalized_text IN ('true', 't', '1', 'yes', 'y', 'oui') THEN
    RETURN TRUE;
  END IF;

  IF position('consens' IN normalized_text) > 0 THEN
    RETURN TRUE;
  END IF;

  IF normalized_text IN ('false', 'f', '0', 'no', 'n', 'non') THEN
    RETURN FALSE;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

DROP TABLE IF EXISTS _legacy_id_map;
CREATE TEMP TABLE _legacy_id_map (
  table_name TEXT,
  old_id TEXT,
  new_uuid UUID
);
CREATE INDEX idx_legacy_map ON _legacy_id_map(table_name, old_id);
