-- CreateEnum
CREATE TYPE "BlindtestRankingType" AS ENUM ('listens', 'likes', 'comments');

-- AlterTable
ALTER TABLE "account_pinned_item" ADD COLUMN     "blindtest_id" UUID;

-- AlterTable
ALTER TABLE "blindtest" ADD COLUMN     "blindtest_ranking_order" "BlindtestRankingType";

-- AddForeignKey
ALTER TABLE "account_pinned_item" ADD CONSTRAINT "account_pinned_item_blindtest_id_fkey" FOREIGN KEY ("blindtest_id") REFERENCES "blindtest"("blindtest_id") ON DELETE CASCADE ON UPDATE CASCADE;
