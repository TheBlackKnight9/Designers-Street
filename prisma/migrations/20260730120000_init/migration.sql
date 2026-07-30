-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('buyer', 'designer', 'admin');

-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('draft', 'active', 'suspended');

-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('draft', 'published', 'archived');

-- CreateEnum
CREATE TYPE "ProductGender" AS ENUM ('men', 'women', 'unisex');

-- CreateEnum
CREATE TYPE "PostType" AS ENUM ('category', 'designer_spotlight');

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('image', 'video');

-- CreateEnum
CREATE TYPE "MediaKind" AS ENUM ('image', 'video');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled');

-- CreateEnum
CREATE TYPE "CustomizationStatus" AS ENUM ('draft', 'submitted', 'in_review', 'quoted', 'closed');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT,
    "name" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'buyer',
    "avatar_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "designer_houses" (
    "id" TEXT NOT NULL,
    "owner_user_id" TEXT,
    "name" TEXT NOT NULL,
    "handle" TEXT NOT NULL,
    "logo" TEXT NOT NULL,
    "banner" TEXT NOT NULL,
    "bio" TEXT NOT NULL,
    "founding_story" TEXT NOT NULL,
    "founded" TEXT,
    "location" TEXT NOT NULL,
    "signature_techniques" TEXT[],
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "exclusive" BOOLEAN NOT NULL DEFAULT false,
    "offers_bespoke" BOOLEAN NOT NULL DEFAULT false,
    "followers_count" TEXT,
    "following_count" TEXT,
    "posts_count" INTEGER,
    "website" TEXT,
    "account_status" "AccountStatus" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "designer_houses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "designer_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "designer_name" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "mrp" INTEGER,
    "best_price" INTEGER,
    "category" TEXT NOT NULL,
    "subcategory" TEXT,
    "gender" "ProductGender" NOT NULL,
    "images" TEXT[],
    "sizes" TEXT[],
    "colors" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "description" TEXT NOT NULL,
    "story" TEXT,
    "craft_origin" TEXT,
    "material" TEXT,
    "technique" TEXT,
    "fit" TEXT,
    "occasion" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "pieces_remaining" INTEGER,
    "limited_edition" BOOLEAN NOT NULL DEFAULT false,
    "customizable" BOOLEAN NOT NULL DEFAULT false,
    "rating" DOUBLE PRECISION,
    "delivery_text" TEXT,
    "status" "ProductStatus" NOT NULL DEFAULT 'published',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "caption" TEXT,
    "parent_id" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "posts" (
    "id" TEXT NOT NULL,
    "type" "PostType" NOT NULL,
    "designer_id" TEXT,
    "designer_name" TEXT NOT NULL,
    "designer_logo" TEXT NOT NULL,
    "designer_verified" BOOLEAN NOT NULL DEFAULT false,
    "category_slug" TEXT,
    "tag" TEXT,
    "image" TEXT NOT NULL,
    "video_url" TEXT,
    "media_type" "MediaType" NOT NULL DEFAULT 'image',
    "caption" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "likes_count" INTEGER NOT NULL DEFAULT 0,
    "product_tag" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stories" (
    "id" TEXT NOT NULL,
    "designer_id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3),

    CONSTRAINT "stories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "story_slides" (
    "id" TEXT NOT NULL,
    "story_id" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "image" TEXT NOT NULL,
    "video_url" TEXT,
    "caption" TEXT,
    "cta_label" TEXT,
    "cta_link" TEXT,

    CONSTRAINT "story_slides_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media_assets" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "public_id" TEXT,
    "kind" "MediaKind" NOT NULL DEFAULT 'image',
    "width" INTEGER,
    "height" INTEGER,
    "duration_ms" INTEGER,
    "uploaded_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "media_assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "likes" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "post_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "likes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comments" (
    "id" TEXT NOT NULL,
    "post_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "parent_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "follows" (
    "id" TEXT NOT NULL,
    "follower_user_id" TEXT NOT NULL,
    "designer_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "follows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'pending',
    "subtotal" INTEGER NOT NULL,
    "total" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "shipping_address" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_items" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "product_id" TEXT,
    "name" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "size" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "customization_json" JSONB,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customization_requests" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "product_id" TEXT,
    "designer_id" TEXT,
    "base_design" TEXT,
    "fabric" TEXT,
    "color" TEXT,
    "embellishment" TEXT,
    "size" TEXT,
    "notes" TEXT,
    "measurement_session_booked" BOOLEAN NOT NULL DEFAULT false,
    "status" "CustomizationStatus" NOT NULL DEFAULT 'draft',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customization_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wishlist_items" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wishlist_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_token_hash_key" ON "sessions"("token_hash");

-- CreateIndex
CREATE INDEX "sessions_user_id_idx" ON "sessions"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "designer_houses_owner_user_id_key" ON "designer_houses"("owner_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "designer_houses_handle_key" ON "designer_houses"("handle");

-- CreateIndex
CREATE INDEX "products_designer_id_idx" ON "products"("designer_id");

-- CreateIndex
CREATE INDEX "products_category_idx" ON "products"("category");

-- CreateIndex
CREATE INDEX "products_status_idx" ON "products"("status");

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");

-- CreateIndex
CREATE INDEX "categories_parent_id_idx" ON "categories"("parent_id");

-- CreateIndex
CREATE INDEX "posts_designer_id_idx" ON "posts"("designer_id");

-- CreateIndex
CREATE INDEX "posts_created_at_idx" ON "posts"("created_at");

-- CreateIndex
CREATE INDEX "stories_designer_id_idx" ON "stories"("designer_id");

-- CreateIndex
CREATE INDEX "story_slides_story_id_idx" ON "story_slides"("story_id");

-- CreateIndex
CREATE INDEX "media_assets_uploaded_by_idx" ON "media_assets"("uploaded_by");

-- CreateIndex
CREATE UNIQUE INDEX "likes_user_id_post_id_key" ON "likes"("user_id", "post_id");

-- CreateIndex
CREATE INDEX "comments_post_id_idx" ON "comments"("post_id");

-- CreateIndex
CREATE UNIQUE INDEX "follows_follower_user_id_designer_id_key" ON "follows"("follower_user_id", "designer_id");

-- CreateIndex
CREATE INDEX "orders_user_id_idx" ON "orders"("user_id");

-- CreateIndex
CREATE INDEX "order_items_order_id_idx" ON "order_items"("order_id");

-- CreateIndex
CREATE INDEX "customization_requests_user_id_idx" ON "customization_requests"("user_id");

-- CreateIndex
CREATE INDEX "wishlist_items_user_id_idx" ON "wishlist_items"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "wishlist_items_user_id_product_id_key" ON "wishlist_items"("user_id", "product_id");

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "designer_houses" ADD CONSTRAINT "designer_houses_owner_user_id_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_designer_id_fkey" FOREIGN KEY ("designer_id") REFERENCES "designer_houses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_designer_id_fkey" FOREIGN KEY ("designer_id") REFERENCES "designer_houses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stories" ADD CONSTRAINT "stories_designer_id_fkey" FOREIGN KEY ("designer_id") REFERENCES "designer_houses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "story_slides" ADD CONSTRAINT "story_slides_story_id_fkey" FOREIGN KEY ("story_id") REFERENCES "stories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "likes" ADD CONSTRAINT "likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "likes" ADD CONSTRAINT "likes_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "follows" ADD CONSTRAINT "follows_follower_user_id_fkey" FOREIGN KEY ("follower_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "follows" ADD CONSTRAINT "follows_designer_id_fkey" FOREIGN KEY ("designer_id") REFERENCES "designer_houses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customization_requests" ADD CONSTRAINT "customization_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customization_requests" ADD CONSTRAINT "customization_requests_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customization_requests" ADD CONSTRAINT "customization_requests_designer_id_fkey" FOREIGN KEY ("designer_id") REFERENCES "designer_houses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wishlist_items" ADD CONSTRAINT "wishlist_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
