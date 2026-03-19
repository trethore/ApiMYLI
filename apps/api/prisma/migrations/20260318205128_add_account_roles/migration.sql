-- CreateEnum
CREATE TYPE "account_roles" AS ENUM ('listener', 'admin', 'super_admin');

-- AlterTable
ALTER TABLE "account" ADD COLUMN "role" "account_roles" NOT NULL DEFAULT 'listener';
