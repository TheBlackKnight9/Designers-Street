-- Phase 8 Luxury Marketplace

-- Product luxury / edition fields
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "edition_total" INTEGER;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "edition_sold" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "care_instructions" TEXT;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "designer_inspiration" TEXT;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "badges" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "editors_pick" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "made_to_order" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "sustainable" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "handcrafted" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "recent_purchase_count" INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS "products_limited_edition_idx" ON "products"("limited_edition");
CREATE INDEX IF NOT EXISTS "products_editors_pick_idx" ON "products"("editors_pick");

-- Designer profile enrichment
ALTER TABLE "designer_houses" ADD COLUMN IF NOT EXISTS "design_philosophy" TEXT;
ALTER TABLE "designer_houses" ADD COLUMN IF NOT EXISTS "years_experience" INTEGER;
ALTER TABLE "designer_houses" ADD COLUMN IF NOT EXISTS "studio_location" TEXT;
ALTER TABLE "designer_houses" ADD COLUMN IF NOT EXISTS "awards" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "designer_houses" ADD COLUMN IF NOT EXISTS "press_mentions" JSONB;
ALTER TABLE "designer_houses" ADD COLUMN IF NOT EXISTS "editorial_gallery" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

-- Customization / bespoke extensions
ALTER TABLE "customization_requests" ADD COLUMN IF NOT EXISTS "measurements" JSONB;
ALTER TABLE "customization_requests" ADD COLUMN IF NOT EXISTS "reference_images" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "customization_requests" ADD COLUMN IF NOT EXISTS "budget" INTEGER;
ALTER TABLE "customization_requests" ADD COLUMN IF NOT EXISTS "occasion" TEXT;
ALTER TABLE "customization_requests" ADD COLUMN IF NOT EXISTS "status_notes" TEXT;

CREATE INDEX IF NOT EXISTS "customization_requests_designer_id_idx" ON "customization_requests"("designer_id");
CREATE INDEX IF NOT EXISTS "customization_requests_status_idx" ON "customization_requests"("status");

-- Appointment status enum
DO $$ BEGIN
  CREATE TYPE "AppointmentStatus" AS ENUM ('pending', 'accepted', 'rejected', 'completed', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Lookbook kind enum
DO $$ BEGIN
  CREATE TYPE "LookbookKind" AS ENUM ('seasonal', 'collection', 'campaign', 'editorial');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Extend CustomizationStatus with new values
DO $$ BEGIN
  ALTER TYPE "CustomizationStatus" ADD VALUE IF NOT EXISTS 'accepted';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TYPE "CustomizationStatus" ADD VALUE IF NOT EXISTS 'rejected';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TYPE "CustomizationStatus" ADD VALUE IF NOT EXISTS 'completed';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "lookbooks" (
  "id" TEXT NOT NULL,
  "designer_id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "kind" "LookbookKind" NOT NULL DEFAULT 'seasonal',
  "season" TEXT,
  "cover_image" TEXT NOT NULL,
  "description" TEXT,
  "published" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "lookbooks_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "lookbooks_designer_id_slug_key" ON "lookbooks"("designer_id", "slug");
CREATE INDEX IF NOT EXISTS "lookbooks_designer_id_idx" ON "lookbooks"("designer_id");
CREATE INDEX IF NOT EXISTS "lookbooks_published_idx" ON "lookbooks"("published");

DO $$ BEGIN
  ALTER TABLE "lookbooks" ADD CONSTRAINT "lookbooks_designer_id_fkey"
    FOREIGN KEY ("designer_id") REFERENCES "designer_houses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "lookbook_items" (
  "id" TEXT NOT NULL,
  "lookbook_id" TEXT NOT NULL,
  "media_url" TEXT NOT NULL,
  "media_kind" "MediaKind" NOT NULL DEFAULT 'image',
  "caption" TEXT,
  "product_id" TEXT,
  "display_order" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "lookbook_items_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "lookbook_items_lookbook_id_idx" ON "lookbook_items"("lookbook_id");
CREATE INDEX IF NOT EXISTS "lookbook_items_product_id_idx" ON "lookbook_items"("product_id");

DO $$ BEGIN
  ALTER TABLE "lookbook_items" ADD CONSTRAINT "lookbook_items_lookbook_id_fkey"
    FOREIGN KEY ("lookbook_id") REFERENCES "lookbooks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "lookbook_items" ADD CONSTRAINT "lookbook_items_product_id_fkey"
    FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "appointment_requests" (
  "id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "designer_id" TEXT NOT NULL,
  "preferred_date" TEXT NOT NULL,
  "preferred_time" TEXT NOT NULL,
  "purpose" TEXT NOT NULL,
  "message" TEXT,
  "status" "AppointmentStatus" NOT NULL DEFAULT 'pending',
  "status_notes" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "appointment_requests_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "appointment_requests_user_id_idx" ON "appointment_requests"("user_id");
CREATE INDEX IF NOT EXISTS "appointment_requests_designer_id_idx" ON "appointment_requests"("designer_id");
CREATE INDEX IF NOT EXISTS "appointment_requests_status_idx" ON "appointment_requests"("status");

DO $$ BEGIN
  ALTER TABLE "appointment_requests" ADD CONSTRAINT "appointment_requests_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "appointment_requests" ADD CONSTRAINT "appointment_requests_designer_id_fkey"
    FOREIGN KEY ("designer_id") REFERENCES "designer_houses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
