SET synchronous_commit = off;
SET work_mem = '256MB';
SET maintenance_work_mem = '1GB';
SET temp_buffers = '256MB';
SET jit = off;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- ====================================================================================
-- HELPERS
-- ====================================================================================

-- 1. Utility functions
CREATE OR REPLACE FUNCTION parse_python_list(p_text TEXT) RETURNS TEXT[] AS $$
DECLARE
    clean_text TEXT;
BEGIN
    IF p_text IS NULL OR p_text = '' OR p_text = '[]' THEN
        RETURN ARRAY[]::TEXT[];
    END IF;

    clean_text := p_text;

    -- Handle escaped double quotes often found in Python-list CSV fields
    IF position('""' IN clean_text) > 0 THEN
        clean_text := replace(clean_text, '""', '"');
    END IF;

    -- Replace Python-style single quotes with double quotes for JSON parsing
    IF left(clean_text, 2) = '[''' THEN
         clean_text := replace(clean_text, '''', '"');
    END IF;

    IF left(clean_text, 1) = '[' AND position('''' IN clean_text) > 0 AND position('"' IN clean_text) = 0 THEN
         clean_text := replace(clean_text, '''', '"');
    END IF;

    -- If it looks like JSON, parse it
    BEGIN
        RETURN ARRAY(SELECT jsonb_array_elements_text(clean_text::jsonb));
    EXCEPTION WHEN OTHERS THEN
        -- Remove brackets and quotes
        RETURN string_to_array(replace(replace(replace(trim(both '[]' from p_text), '''', ''), '"', ''), ', ', ','), ',');
    END;
END;
$$ LANGUAGE plpgsql;

-- 2. Mapping table for legacy id -> uuid
CREATE TEMP TABLE _legacy_id_map (
    table_name TEXT,
    old_id TEXT,
    new_uuid UUID
);
CREATE INDEX idx_legacy_map ON _legacy_id_map(table_name, old_id);
