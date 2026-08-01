-- Phase 7 social commerce extensions
ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "comments_count" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "likes_count" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "likes" ALTER COLUMN "post_id" DROP NOT NULL;
ALTER TABLE "likes" ADD COLUMN IF NOT EXISTS "product_id" TEXT;

DO $$ BEGIN
  ALTER TABLE "likes" ADD CONSTRAINT "likes_product_id_fkey"
    FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS "likes_user_id_product_id_key" ON "likes"("user_id", "product_id");
CREATE INDEX IF NOT EXISTS "likes_post_id_idx" ON "likes"("post_id");
CREATE INDEX IF NOT EXISTS "likes_product_id_idx" ON "likes"("product_id");
CREATE INDEX IF NOT EXISTS "comments_parent_id_idx" ON "comments"("parent_id");
CREATE INDEX IF NOT EXISTS "comments_user_id_idx" ON "comments"("user_id");

ALTER TABLE "notifications" ADD COLUMN IF NOT EXISTS "post_id" TEXT;
ALTER TABLE "notifications" ADD COLUMN IF NOT EXISTS "product_id" TEXT;
ALTER TABLE "notifications" ADD COLUMN IF NOT EXISTS "designer_id" TEXT;
ALTER TABLE "notifications" ADD COLUMN IF NOT EXISTS "actor_user_id" TEXT;
