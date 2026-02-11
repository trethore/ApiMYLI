DO $$
DECLARE
  table_list TEXT;
BEGIN
  SELECT string_agg(format('%I.%I', schemaname, tablename), ', ')
    INTO table_list
    FROM pg_tables
   WHERE schemaname = 'public'
     AND tablename <> '_prisma_migrations';

  IF table_list IS NOT NULL THEN
    EXECUTE 'TRUNCATE TABLE ' || table_list || ' RESTART IDENTITY CASCADE';
  END IF;
END;
$$;
