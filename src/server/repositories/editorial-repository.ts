import { prisma } from "@/server/db";
import type { Prisma } from "@prisma/client";

export class EditorialRepository {
  // ── Public Queries ──────────────────────
  async findActiveCampaign() {
    return prisma.editorialCampaign.findFirst({
      where: { published: true },
      orderBy: { sortOrder: "asc" },
      include: {
        featuredDesigner: true,
      },
    });
  }

  async listCampaigns() {
    return prisma.editorialCampaign.findMany({
      where: { published: true },
      orderBy: { sortOrder: "asc" },
      include: {
        featuredDesigner: true,
      },
    });
  }

  async findCampaignBySlug(slug: string) {
    return prisma.editorialCampaign.findUnique({
      where: { slug },
      include: {
        featuredDesigner: true,
      },
    });
  }

  async listCollections() {
    return prisma.editorialCollection.findMany({
      where: { published: true },
      orderBy: { sortOrder: "asc" },
      include: {
        items: {
          orderBy: { displayOrder: "asc" },
          include: {
            product: {
              include: {
                designer: true,
              },
            },
          },
        },
      },
    });
  }

  async findCollectionBySlug(slug: string) {
    return prisma.editorialCollection.findUnique({
      where: { slug },
      include: {
        items: {
          orderBy: { displayOrder: "asc" },
          include: {
            product: {
              include: {
                designer: true,
              },
            },
          },
        },
      },
    });
  }

  async listArticles(limit = 10) {
    return prisma.editorialArticle.findMany({
      where: { published: true },
      take: limit,
      orderBy: { publishedAt: "desc" },
      include: {
        designer: true,
      },
    });
  }

  async findArticleBySlug(slug: string) {
    return prisma.editorialArticle.findUnique({
      where: { slug },
      include: {
        designer: true,
      },
    });
  }

  async listActiveFeaturedSections() {
    return prisma.featuredSection.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
    });
  }

  // ── CMS Admin CRUD ──────────────────────
  async createCampaign(data: Prisma.EditorialCampaignCreateInput) {
    return prisma.editorialCampaign.create({ data });
  }

  async updateCampaign(id: string, data: Prisma.EditorialCampaignUpdateInput) {
    return prisma.editorialCampaign.update({ where: { id }, data });
  }

  async deleteCampaign(id: string) {
    return prisma.editorialCampaign.delete({ where: { id } });
  }

  async createCollection(data: Prisma.EditorialCollectionCreateInput) {
    return prisma.editorialCollection.create({ data });
  }

  async updateCollection(id: string, data: Prisma.EditorialCollectionUpdateInput) {
    return prisma.editorialCollection.update({ where: { id }, data });
  }

  async deleteCollection(id: string) {
    return prisma.editorialCollection.delete({ where: { id } });
  }

  async createArticle(data: Prisma.EditorialArticleCreateInput) {
    return prisma.editorialArticle.create({ data });
  }

  async updateArticle(id: string, data: Prisma.EditorialArticleUpdateInput) {
    return prisma.editorialArticle.update({ where: { id }, data });
  }

  async deleteArticle(id: string) {
    return prisma.editorialArticle.delete({ where: { id } });
  }

  async upsertFeaturedSection(data: Prisma.FeaturedSectionCreateInput & { id?: string }) {
    if (data.id) {
      return prisma.featuredSection.update({
        where: { id: data.id },
        data,
      });
    }
    return prisma.featuredSection.create({ data });
  }
}
