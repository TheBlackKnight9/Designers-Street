import { createId } from "@/server/utils/ids";
import { ProductRepository } from "@/server/repositories/product-repository";
import { MediaRepository } from "@/server/repositories/media-repository";
import { DesignerRepository } from "@/server/repositories/designer-repository";
import { MediaService } from "@/server/services/media-service";
import {
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "@/server/errors";
import type { DashboardContext } from "@/server/auth/dashboard-session";
import type { Product } from "@/lib/types";
import type { MediaRecord } from "@/server/types/media";
import type { ProductGender, ProductStatus } from "@prisma/client";

function maxImages(): number {
  const n = Number(process.env.MEDIA_MAX_IMAGES_PER_PRODUCT || "10");
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 10;
}

function maxVideos(): number {
  const n = Number(process.env.MEDIA_MAX_VIDEOS_PER_PRODUCT || "3");
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 3;
}

export type DashboardProductInput = {
  name: string;
  description: string;
  category: string;
  subcategory?: string | null;
  price: number;
  mrp?: number | null;
  bestPrice?: number | null;
  gender?: ProductGender;
  sizes?: string[];
  colors?: string[];
  tags?: string[];
  story?: string | null;
  craftOrigin?: string | null;
  material?: string | null;
  technique?: string | null;
  fit?: string | null;
  occasion?: string | null;
  piecesRemaining?: number | null;
  limitedEdition?: boolean;
  customizable?: boolean;
  deliveryText?: string | null;
  status?: ProductStatus;
};

export type DashboardProductDetail = Product & {
  status: ProductStatus;
  media: MediaRecord[];
};

function parseProductInput(body: Record<string, unknown>): DashboardProductInput {
  const name = String(body.name || "").trim();
  const description = String(body.description || "").trim();
  const category = String(body.category || "").trim();
  const price = Number(body.price);

  if (!name) throw new ValidationError("Product title is required");
  if (!description) throw new ValidationError("Description is required");
  if (!category) throw new ValidationError("Category is required");
  if (!Number.isFinite(price) || price <= 0) {
    throw new ValidationError("Price must be a positive number");
  }

  const gender =
    body.gender === "men" || body.gender === "women" || body.gender === "unisex"
      ? body.gender
      : "unisex";

  const status =
    body.status === "draft" ||
    body.status === "published" ||
    body.status === "archived"
      ? body.status
      : undefined;

  const toStringArray = (v: unknown): string[] => {
    if (Array.isArray(v)) {
      return v.map((x) => String(x).trim()).filter(Boolean);
    }
    if (typeof v === "string" && v.trim()) {
      return v
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
    return [];
  };

  return {
    name,
    description,
    category,
    subcategory:
      typeof body.subcategory === "string" ? body.subcategory.trim() : null,
    price: Math.round(price),
    mrp:
      body.mrp === null || body.mrp === undefined || body.mrp === ""
        ? null
        : Math.round(Number(body.mrp)),
    bestPrice:
      body.bestPrice === null ||
      body.bestPrice === undefined ||
      body.bestPrice === ""
        ? null
        : Math.round(Number(body.bestPrice)),
    gender,
    sizes: toStringArray(body.sizes),
    colors: toStringArray(body.colors),
    tags: toStringArray(body.tags),
    story: typeof body.story === "string" ? body.story : null,
    craftOrigin: typeof body.craftOrigin === "string" ? body.craftOrigin : null,
    material: typeof body.material === "string" ? body.material : null,
    technique: typeof body.technique === "string" ? body.technique : null,
    fit: typeof body.fit === "string" ? body.fit : null,
    occasion: typeof body.occasion === "string" ? body.occasion : null,
    piecesRemaining:
      body.piecesRemaining === null ||
      body.piecesRemaining === undefined ||
      body.piecesRemaining === ""
        ? null
        : Math.max(0, Math.round(Number(body.piecesRemaining))),
    limitedEdition: Boolean(body.limitedEdition),
    customizable: Boolean(body.customizable),
    deliveryText:
      typeof body.deliveryText === "string" ? body.deliveryText.trim() : null,
    status,
  };
}

export class DashboardProductService {
  private products = new ProductRepository();
  private media = new MediaRepository();
  private designers = new DesignerRepository();
  private mediaService = new MediaService();

  private assertOwned(productDesignerId: string, ctx: DashboardContext) {
    if (productDesignerId !== ctx.designer.id && ctx.user.role !== "admin") {
      throw new ForbiddenError("You can only manage your own products");
    }
  }

  async syncProductImages(productId: string): Promise<string[]> {
    const media = await this.media.findByProductId(productId);
    const imageUrls = media
      .filter((m) => m.type === "image")
      .map((m) => m.secureUrl);
    await this.products.update(productId, { images: imageUrls });
    return imageUrls;
  }

  async list(
    ctx: DashboardContext,
    status?: ProductStatus
  ): Promise<(Product & { status: ProductStatus })[]> {
    return this.products.findByDesignerIdAll(ctx.designer.id, status);
  }

  async counts(ctx: DashboardContext) {
    return this.products.countByDesigner(ctx.designer.id);
  }

  async get(
    ctx: DashboardContext,
    productId: string
  ): Promise<DashboardProductDetail> {
    const raw = await this.products.findRawById(productId);
    if (!raw) throw new NotFoundError(`Product ${productId} not found`);
    this.assertOwned(raw.designerId, ctx);
    const media = await this.media.findByProductId(productId);
    const product = (await this.products.findById(productId))!;
    return { ...product, status: raw.status, media };
  }

  async create(
    ctx: DashboardContext,
    body: Record<string, unknown>
  ): Promise<DashboardProductDetail> {
    const input = parseProductInput(body);
    const id = createId("prod");
    await this.products.create({
      id,
      designerId: ctx.designer.id,
      designerName: ctx.designer.name,
      name: input.name,
      description: input.description,
      category: input.category,
      subcategory: input.subcategory,
      price: input.price,
      mrp: input.mrp,
      bestPrice: input.bestPrice,
      gender: input.gender ?? "unisex",
      sizes: input.sizes ?? [],
      colors: input.colors ?? [],
      tags: input.tags ?? [],
      story: input.story,
      craftOrigin: input.craftOrigin,
      material: input.material,
      technique: input.technique,
      fit: input.fit,
      occasion: input.occasion,
      piecesRemaining: input.piecesRemaining,
      limitedEdition: input.limitedEdition,
      customizable: input.customizable,
      deliveryText: input.deliveryText,
      status: input.status ?? "draft",
      images: [],
    });
    return this.get(ctx, id);
  }

  async update(
    ctx: DashboardContext,
    productId: string,
    body: Record<string, unknown>
  ): Promise<DashboardProductDetail> {
    const raw = await this.products.findRawById(productId);
    if (!raw) throw new NotFoundError(`Product ${productId} not found`);
    this.assertOwned(raw.designerId, ctx);
    const input = parseProductInput({ ...raw, ...body, name: body.name ?? raw.name });

    await this.products.update(productId, {
      name: input.name,
      description: input.description,
      category: input.category,
      subcategory: input.subcategory,
      price: input.price,
      mrp: input.mrp,
      bestPrice: input.bestPrice,
      gender: input.gender ?? raw.gender,
      sizes: input.sizes ?? [],
      colors: input.colors ?? [],
      tags: input.tags ?? [],
      story: input.story,
      craftOrigin: input.craftOrigin,
      material: input.material,
      technique: input.technique,
      fit: input.fit,
      occasion: input.occasion,
      piecesRemaining: input.piecesRemaining,
      limitedEdition: input.limitedEdition ?? false,
      customizable: input.customizable ?? false,
      deliveryText: input.deliveryText,
      ...(input.status ? { status: input.status } : {}),
      designerName: ctx.designer.name,
    });

    return this.get(ctx, productId);
  }

  async setStatus(
    ctx: DashboardContext,
    productId: string,
    status: ProductStatus
  ): Promise<DashboardProductDetail> {
    if (status !== "draft" && status !== "published" && status !== "archived") {
      throw new ValidationError("Invalid status");
    }
    const raw = await this.products.findRawById(productId);
    if (!raw) throw new NotFoundError(`Product ${productId} not found`);
    this.assertOwned(raw.designerId, ctx);

    if (status === "published") {
      const media = await this.media.findByProductId(productId);
      if (!media.some((m) => m.type === "image")) {
        throw new ValidationError("Publish requires at least one product image");
      }
    }

    await this.products.update(productId, { status });
    return this.get(ctx, productId);
  }

  async delete(ctx: DashboardContext, productId: string): Promise<void> {
    const raw = await this.products.findRawById(productId);
    if (!raw) throw new NotFoundError(`Product ${productId} not found`);
    this.assertOwned(raw.designerId, ctx);

    const media = await this.media.findByProductId(productId);
    for (const item of media) {
      try {
        await this.mediaService.delete(item.id);
      } catch {
        /* continue deleting others */
      }
    }
    await this.products.delete(productId);
  }

  async reorderMedia(
    ctx: DashboardContext,
    productId: string,
    orderedIds: string[]
  ): Promise<DashboardProductDetail> {
    const raw = await this.products.findRawById(productId);
    if (!raw) throw new NotFoundError(`Product ${productId} not found`);
    this.assertOwned(raw.designerId, ctx);

    const existing = await this.media.findByProductId(productId);
    const existingIds = new Set(existing.map((m) => m.id));
    if (
      orderedIds.length !== existing.length ||
      orderedIds.some((id) => !existingIds.has(id))
    ) {
      throw new ValidationError("Media order must include every gallery item once");
    }

    await this.media.setDisplayOrders(
      orderedIds.map((id, index) => ({ id, displayOrder: index }))
    );
    await this.syncProductImages(productId);
    return this.get(ctx, productId);
  }

  async registerOwnedMedia(
    ctx: DashboardContext,
    productId: string,
    input: {
      type: "image" | "video";
      cloudinaryPublicId: string;
      secureUrl: string;
      width?: number | null;
      height?: number | null;
      duration?: number | null;
      format?: string | null;
      bytes?: number | null;
      folder?: string | null;
      altText?: string | null;
      thumbnailUrl?: string | null;
    }
  ): Promise<DashboardProductDetail> {
    const raw = await this.products.findRawById(productId);
    if (!raw) throw new NotFoundError(`Product ${productId} not found`);
    this.assertOwned(raw.designerId, ctx);

    const counts = await this.media.countByProduct(productId);
    if (input.type === "image" && counts.images >= maxImages()) {
      throw new ValidationError(`Maximum ${maxImages()} images per product`);
    }
    if (input.type === "video" && counts.videos >= maxVideos()) {
      throw new ValidationError(`Maximum ${maxVideos()} videos per product`);
    }

    const duplicates = (await this.media.findByProductId(productId)).some(
      (m) => m.cloudinaryPublicId === input.cloudinaryPublicId
    );
    if (duplicates) {
      throw new ValidationError("This media was already uploaded to the product");
    }

    const displayOrder = await this.media.nextDisplayOrder(productId);
    await this.mediaService.registerUpload({
      ...input,
      productId,
      designerId: ctx.designer.id,
      ownerType: "product",
      displayOrder,
      uploadedById: ctx.user.id,
    });

    await this.syncProductImages(productId);
    return this.get(ctx, productId);
  }

  async deleteOwnedMedia(
    ctx: DashboardContext,
    productId: string,
    mediaId: string
  ): Promise<DashboardProductDetail> {
    const raw = await this.products.findRawById(productId);
    if (!raw) throw new NotFoundError(`Product ${productId} not found`);
    this.assertOwned(raw.designerId, ctx);

    const item = await this.media.findById(mediaId);
    if (!item || item.productId !== productId) {
      throw new NotFoundError("Media not found on this product");
    }

    await this.mediaService.delete(mediaId);
    const remaining = await this.media.findByProductId(productId);
    await this.media.setDisplayOrders(
      remaining.map((m, index) => ({ id: m.id, displayOrder: index }))
    );
    await this.syncProductImages(productId);
    return this.get(ctx, productId);
  }

  async updateProfile(
    ctx: DashboardContext,
    body: Record<string, unknown>
  ) {
    const name =
      typeof body.name === "string" && body.name.trim()
        ? body.name.trim()
        : ctx.designer.name;
    const bio =
      typeof body.bio === "string" ? body.bio.trim() : ctx.designer.bio;
    const foundingStory =
      typeof body.foundingStory === "string"
        ? body.foundingStory.trim()
        : ctx.designer.foundingStory;
    const location =
      typeof body.location === "string" && body.location.trim()
        ? body.location.trim()
        : ctx.designer.location;
    const website =
      typeof body.website === "string" ? body.website.trim() || null : ctx.designer.website;
    const logo =
      typeof body.logo === "string" && body.logo.trim()
        ? body.logo.trim()
        : ctx.designer.logo;
    const banner =
      typeof body.banner === "string" && body.banner.trim()
        ? body.banner.trim()
        : ctx.designer.banner;

    let handle = ctx.designer.handle;
    if (typeof body.handle === "string" && body.handle.trim()) {
      const next = body.handle
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9-]+/g, "-");
      const clash = await this.designers.findByHandle(next);
      if (clash && clash.id !== ctx.designer.id) {
        throw new ValidationError("Handle is already taken");
      }
      handle = next;
    }

    return this.designers.update(ctx.designer.id, {
      name,
      bio,
      foundingStory,
      location,
      website,
      logo,
      banner,
      handle,
      offersBespoke:
        body.offersBespoke === undefined
          ? ctx.designer.offersBespoke
          : Boolean(body.offersBespoke),
    });
  }
}
