import { EditorialRepository } from "@/server/repositories/editorial-repository";
import { isDatabaseEnabled } from "@/server/utils/env";
import { NotFoundError, ValidationError } from "@/server/errors";
import {
  DEMO_CAMPAIGNS,
  DEMO_COLLECTIONS,
  DEMO_ARTICLES,
  DEMO_FEATURED_SECTIONS,
} from "@/lib/phase9-demo";
import type {
  EditorialCampaignData,
  EditorialCollectionData,
  EditorialArticleData,
  FeaturedSectionData,
  ArticleBlock,
  SectionTypeId,
} from "@/lib/types";

export class EditorialService {
  constructor(private readonly repo = new EditorialRepository()) {}

  async getHomePayload() {
    if (!isDatabaseEnabled()) {
      return {
        campaign: DEMO_CAMPAIGNS[0] ?? null,
        collections: DEMO_COLLECTIONS,
        articles: DEMO_ARTICLES,
        sections: DEMO_FEATURED_SECTIONS,
      };
    }

    const [activeCampaign, collections, articles, sections] = await Promise.all([
      this.repo.findActiveCampaign(),
      this.repo.listCollections(),
      this.repo.listArticles(6),
      this.repo.listActiveFeaturedSections(),
    ]);

    const mappedCampaign: EditorialCampaignData | null = activeCampaign
      ? {
          id: activeCampaign.id,
          title: activeCampaign.title,
          slug: activeCampaign.slug,
          subtitle: activeCampaign.subtitle ?? undefined,
          heroImage: activeCampaign.heroImage,
          heroVideoUrl: activeCampaign.heroVideoUrl ?? undefined,
          headline: activeCampaign.headline,
          body: activeCampaign.body,
          badge: activeCampaign.badge ?? undefined,
          featuredDesignerId: activeCampaign.featuredDesignerId ?? undefined,
          featuredDesignerName: activeCampaign.featuredDesigner?.name ?? undefined,
          ctaLabel: activeCampaign.ctaLabel ?? undefined,
          ctaLink: activeCampaign.ctaLink ?? undefined,
          sortOrder: activeCampaign.sortOrder,
        }
      : DEMO_CAMPAIGNS[0] ?? null;

    const mappedCollections: EditorialCollectionData[] = collections.length
      ? collections.map((c) => ({
          id: c.id,
          title: c.title,
          slug: c.slug,
          tagline: c.tagline ?? undefined,
          coverImage: c.coverImage,
          description: c.description ?? undefined,
          curatorNotes: c.curatorNotes ?? undefined,
          sortOrder: c.sortOrder,
          items: c.items.map((item) => ({
            id: item.id,
            productId: item.productId,
            displayOrder: item.displayOrder,
            editorialNote: item.editorialNote ?? undefined,
          })),
        }))
      : DEMO_COLLECTIONS;

    const mappedArticles: EditorialArticleData[] = articles.length
      ? articles.map((a) => ({
          id: a.id,
          title: a.title,
          slug: a.slug,
          category: a.category,
          excerpt: a.excerpt,
          coverImage: a.coverImage,
          contentJson: (a.contentJson as unknown as ArticleBlock[]) || [],
          authorName: a.authorName ?? undefined,
          authorRole: a.authorRole ?? undefined,
          designerId: a.designerId ?? undefined,
          designerName: a.designer?.name ?? undefined,
          publishedAt: a.publishedAt.toISOString(),
        }))
      : DEMO_ARTICLES;

    const mappedSections: FeaturedSectionData[] = sections.length
      ? sections.map((s) => ({
          id: s.id,
          title: s.title,
          subtitle: s.subtitle ?? undefined,
          type: s.type as SectionTypeId,
          targetSlug: s.targetSlug ?? undefined,
          sortOrder: s.sortOrder,
          active: s.active,
        }))
      : DEMO_FEATURED_SECTIONS;

    return {
      campaign: mappedCampaign,
      collections: mappedCollections,
      articles: mappedArticles,
      sections: mappedSections,
    };
  }

  async getCollectionBySlug(slug: string): Promise<EditorialCollectionData> {
    if (!isDatabaseEnabled()) {
      const found = DEMO_COLLECTIONS.find((c) => c.slug === slug);
      if (!found) throw new NotFoundError(`Collection '${slug}' not found`);
      return found;
    }

    const row = await this.repo.findCollectionBySlug(slug);
    if (!row) {
      const fallback = DEMO_COLLECTIONS.find((c) => c.slug === slug);
      if (!fallback) throw new NotFoundError(`Collection '${slug}' not found`);
      return fallback;
    }

    return {
      id: row.id,
      title: row.title,
      slug: row.slug,
      tagline: row.tagline ?? undefined,
      coverImage: row.coverImage,
      description: row.description ?? undefined,
      curatorNotes: row.curatorNotes ?? undefined,
      sortOrder: row.sortOrder,
      items: row.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        displayOrder: item.displayOrder,
        editorialNote: item.editorialNote ?? undefined,
      })),
    };
  }

  async getArticleBySlug(slug: string): Promise<EditorialArticleData> {
    if (!isDatabaseEnabled()) {
      const found = DEMO_ARTICLES.find((a) => a.slug === slug);
      if (!found) throw new NotFoundError(`Article '${slug}' not found`);
      return found;
    }

    const row = await this.repo.findArticleBySlug(slug);
    if (!row) {
      const fallback = DEMO_ARTICLES.find((a) => a.slug === slug);
      if (!fallback) throw new NotFoundError(`Article '${slug}' not found`);
      return fallback;
    }

    return {
      id: row.id,
      title: row.title,
      slug: row.slug,
      category: row.category,
      excerpt: row.excerpt,
      coverImage: row.coverImage,
      contentJson: (row.contentJson as unknown as ArticleBlock[]) || [],
      authorName: row.authorName ?? undefined,
      authorRole: row.authorRole ?? undefined,
      designerId: row.designerId ?? undefined,
      designerName: row.designer?.name ?? undefined,
      publishedAt: row.publishedAt.toISOString(),
    };
  }

  // ── CMS Admin CRUD Methods ──────────────────────
  async createCampaign(input: Partial<EditorialCampaignData>) {
    if (!isDatabaseEnabled()) return input as EditorialCampaignData;
    if (!input.title || !input.slug || !input.heroImage || !input.headline || !input.body) {
      throw new ValidationError("Missing required campaign fields");
    }
    return this.repo.createCampaign({
      title: input.title,
      slug: input.slug,
      subtitle: input.subtitle,
      heroImage: input.heroImage,
      heroVideoUrl: input.heroVideoUrl,
      headline: input.headline,
      body: input.body,
      badge: input.badge,
      featuredDesigner: input.featuredDesignerId
        ? { connect: { id: input.featuredDesignerId } }
        : undefined,
      ctaLabel: input.ctaLabel,
      ctaLink: input.ctaLink,
      sortOrder: input.sortOrder ?? 0,
    });
  }

  async createCollection(input: Partial<EditorialCollectionData>) {
    if (!isDatabaseEnabled()) return input as EditorialCollectionData;
    if (!input.title || !input.slug || !input.coverImage) {
      throw new ValidationError("Missing required collection fields");
    }
    return this.repo.createCollection({
      title: input.title,
      slug: input.slug,
      tagline: input.tagline,
      coverImage: input.coverImage,
      description: input.description,
      curatorNotes: input.curatorNotes,
      sortOrder: input.sortOrder ?? 0,
    });
  }

  async createArticle(input: Partial<EditorialArticleData>) {
    if (!isDatabaseEnabled()) return input as EditorialArticleData;
    if (!input.title || !input.slug || !input.category || !input.excerpt || !input.coverImage) {
      throw new ValidationError("Missing required article fields");
    }
    return this.repo.createArticle({
      title: input.title,
      slug: input.slug,
      category: input.category,
      excerpt: input.excerpt,
      coverImage: input.coverImage,
      contentJson: (input.contentJson || []) as unknown as object,
      authorName: input.authorName,
      authorRole: input.authorRole,
      designer: input.designerId ? { connect: { id: input.designerId } } : undefined,
    });
  }

  async upsertFeaturedSection(input: Partial<FeaturedSectionData>) {
    if (!isDatabaseEnabled()) return input as FeaturedSectionData;
    if (!input.title || !input.type) {
      throw new ValidationError("Missing section title or type");
    }
    return this.repo.upsertFeaturedSection({
      id: input.id,
      title: input.title,
      subtitle: input.subtitle,
      type: input.type,
      targetSlug: input.targetSlug,
      sortOrder: input.sortOrder ?? 0,
      active: input.active ?? true,
    });
  }
}
