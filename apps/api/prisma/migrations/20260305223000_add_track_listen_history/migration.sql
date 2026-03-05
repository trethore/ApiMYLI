CREATE TABLE "track_listen_history_item" (
    "listen_history_item_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "track_id" UUID NOT NULL,
    "account_id" UUID NOT NULL,
    "listened_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "track_listen_history_item_pkey" PRIMARY KEY ("listen_history_item_id")
);

CREATE INDEX "track_listen_history_item_account_id_listened_at_idx"
ON "track_listen_history_item"("account_id", "listened_at" DESC);

CREATE INDEX "track_listen_history_item_track_id_listened_at_idx"
ON "track_listen_history_item"("track_id", "listened_at" DESC);

ALTER TABLE "track_listen_history_item"
ADD CONSTRAINT "track_listen_history_item_track_id_fkey"
FOREIGN KEY ("track_id") REFERENCES "track"("track_id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "track_listen_history_item"
ADD CONSTRAINT "track_listen_history_item_account_id_fkey"
FOREIGN KEY ("account_id") REFERENCES "account"("account_id") ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "track_listen_history_item" ("listen_history_item_id", "track_id", "account_id", "listened_at")
SELECT
  uuid_generate_v4(),
  tal."track_id",
  tal."account_id",
  tal."listened_at" - generated."offset" * INTERVAL '1 second'
FROM "track_account_listen" AS tal
JOIN LATERAL generate_series(0, GREATEST(COALESCE(tal."count", 1), 1) - 1) AS generated("offset") ON TRUE;

DROP TRIGGER IF EXISTS "tr_inc_track_listens" ON "track_account_listen";

UPDATE "track" AS t
SET "track_listens" = stats."total_listens"
FROM (
  SELECT
    tal."track_id",
    SUM(COALESCE(tal."count", 0))::BIGINT AS "total_listens"
  FROM "track_account_listen" AS tal
  GROUP BY tal."track_id"
) AS stats
WHERE stats."track_id" = t."track_id";
