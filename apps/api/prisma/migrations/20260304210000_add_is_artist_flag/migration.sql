-- add boolean flag for artist role
ALTER TABLE "account" ADD COLUMN IF NOT EXISTS "is_artist" BOOLEAN NOT NULL DEFAULT false;
