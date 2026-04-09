-- AlterTable
ALTER TABLE "blindtest" ALTER COLUMN "blindtest_name" DROP NOT NULL,
ALTER COLUMN "blindtest_length" SET DEFAULT 10,
ALTER COLUMN "blindtest_difficulty" SET DEFAULT 10;
