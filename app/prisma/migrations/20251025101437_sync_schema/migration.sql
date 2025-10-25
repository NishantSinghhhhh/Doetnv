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

ALTER TABLE "ad_slots" ALTER COLUMN "currency" SET DEFAULT 'XLM',
ALTER COLUMN "network" SET DEFAULT 'stellar';

ALTER TABLE "payments" ALTER COLUMN "currency" SET DEFAULT 'XLM',
ALTER COLUMN "network" SET DEFAULT 'stellar';

CREATE INDEX "ad_placements_slot_id_status_expires_at_idx" ON "ad_placements"("slot_id", "status", "expires_at");

CREATE INDEX "ad_placements_slot_id_status_bid_amount_idx" ON "ad_placements"("slot_id", "status", "bid_amount");
