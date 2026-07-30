-- Phase 2: extend media_assets for Cloudinary-backed media foundation

DO $$ BEGIN
  CREATE TYPE "MediaOwnerType" AS ENUM ('product', 'post', 'designer', 'story', 'unattached');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "media_assets" ADD COLUMN IF NOT EXISTS "product_id" TEXT;
ALTER TABLE "media_assets" ADD COLUMN IF NOT EXISTS "post_id" TEXT;
ALTER TABLE "media_assets" ADD COLUMN IF NOT EXISTS "designer_id" TEXT;
ALTER TABLE "media_assets" ADD COLUMN IF NOT EXISTS "story_id" TEXT;
ALTER TABLE "media_assets" ADD COLUMN IF NOT EXISTS "owner_type" "MediaOwnerType" NOT NULL DEFAULT 'unattached';
ALTER TABLE "media_assets" ADD COLUMN IF NOT EXISTS "format" TEXT;
ALTER TABLE "media_assets" ADD COLUMN IF NOT EXISTS "bytes" INTEGER;
ALTER TABLE "media_assets" ADD COLUMN IF NOT EXISTS "folder" TEXT;
ALTER TABLE "media_assets" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

UPDATE "media_assets" SET "public_id" = COALESCE("public_id", '') WHERE "public_id" IS NULL;
ALTER TABLE "media_assets" ALTER COLUMN "public_id" SET DEFAULT '';
ALTER TABLE "media_assets" ALTER COLUMN "public_id" SET NOT NULL;

CREATE INDEX IF NOT EXISTS "media_assets_product_id_idx" ON "media_assets"("product_id");
CREATE INDEX IF NOT EXISTS "media_assets_post_id_idx" ON "media_assets"("post_id");
CREATE INDEX IF NOT EXISTS "media_assets_designer_id_idx" ON "media_assets"("designer_id");
CREATE INDEX IF NOT EXISTS "media_assets_story_id_idx" ON "media_assets"("story_id");
CREATE INDEX IF NOT EXISTS "media_assets_owner_type_idx" ON "media_assets"("owner_type");
CREATE INDEX IF NOT EXISTS "media_assets_kind_idx" ON "media_assets"("kind");

ALTER TABLE "media_assets" DROP CONSTRAINT IF EXISTS "media_assets_product_id_fkey";
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "media_assets" DROP CONSTRAINT IF EXISTS "media_assets_post_id_fkey";
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "media_assets" DROP CONSTRAINT IF EXISTS "media_assets_designer_id_fkey";
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_designer_id_fkey" FOREIGN KEY ("designer_id") REFERENCES "designer_houses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "media_assets" DROP CONSTRAINT IF EXISTS "media_assets_story_id_fkey";
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_story_id_fkey" FOREIGN KEY ("story_id") REFERENCES "stories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
