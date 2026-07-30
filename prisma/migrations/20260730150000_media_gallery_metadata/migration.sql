-- Phase 2 polish: gallery metadata (alt, thumbnail, display order)
-- Multiple media per product/post already allowed (no unique on FKs).

ALTER TABLE "media_assets" ADD COLUMN IF NOT EXISTS "alt_text" TEXT;
ALTER TABLE "media_assets" ADD COLUMN IF NOT EXISTS "thumbnail_url" TEXT;
ALTER TABLE "media_assets" ADD COLUMN IF NOT EXISTS "display_order" INTEGER NOT NULL DEFAULT 0;

DROP INDEX IF EXISTS "media_assets_product_id_idx";
DROP INDEX IF EXISTS "media_assets_post_id_idx";
DROP INDEX IF EXISTS "media_assets_designer_id_idx";
DROP INDEX IF EXISTS "media_assets_story_id_idx";

CREATE INDEX IF NOT EXISTS "media_assets_product_id_display_order_idx" ON "media_assets"("product_id", "display_order");
CREATE INDEX IF NOT EXISTS "media_assets_post_id_display_order_idx" ON "media_assets"("post_id", "display_order");
CREATE INDEX IF NOT EXISTS "media_assets_designer_id_display_order_idx" ON "media_assets"("designer_id", "display_order");
CREATE INDEX IF NOT EXISTS "media_assets_story_id_display_order_idx" ON "media_assets"("story_id", "display_order");
