/*
  Warnings:

  - You are about to drop the column `lighthouse_url` on the `ad_content` table. All the data in the column will be lost.
  - The `content_type` column on the `ad_placements` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `ad_placements` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `moderation_status` column on the `ad_placements` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Made the column `file_path` on table `ad_content` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "AdStatus" AS ENUM ('pending', 'active', 'queued', 'completed', 'rejected', 'expired');

-- CreateEnum
CREATE TYPE "ModerationStatus" AS ENUM ('pending', 'approved', 'rejected');

-- CreateEnum
CREATE TYPE "ContentType" AS ENUM ('image', 'video', 'html');

-- AlterTable
ALTER TABLE "ad_content" DROP COLUMN "lighthouse_url",
ALTER COLUMN "file_path" SET NOT NULL;

-- AlterTable
ALTER TABLE "ad_placements" ADD COLUMN     "bid_amount" DECIMAL(10,6) NOT NULL DEFAULT 0.0,
ADD COLUMN     "queue_position" INTEGER,
DROP COLUMN "content_type",
ADD COLUMN     "content_type" "ContentType" NOT NULL DEFAULT 'image',
ALTER COLUMN "currency" SET DEFAULT 'XLM',
DROP COLUMN "status",
ADD COLUMN     "status" "AdStatus" NOT NULL DEFAULT 'pending',
DROP COLUMN "moderation_status",
ADD COLUMN     "moderation_status" "ModerationStatus" NOT NULL DEFAULT 'pending';

-- AlterTable
ALTER TABLE "ad_slots" ALTER COLUMN "currency" SET DEFAULT 'XLM',
ALTER COLUMN "network" SET DEFAULT 'stellar';

-- AlterTable
ALTER TABLE "payments" ALTER COLUMN "currency" SET DEFAULT 'XLM',
ALTER COLUMN "network" SET DEFAULT 'stellar';

-- CreateIndex
CREATE INDEX "ad_placements_slot_id_status_expires_at_idx" ON "ad_placements"("slot_id", "status", "expires_at");

-- CreateIndex
CREATE INDEX "ad_placements_slot_id_status_bid_amount_idx" ON "ad_placements"("slot_id", "status", "bid_amount");
