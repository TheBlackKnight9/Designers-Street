"use client";

import type {
  FeaturedSectionData,
  EditorialCampaignData,
  EditorialCollectionData,
  EditorialArticleData,
  DesignerHouse,
  Product,
  LookbookData,
} from "@/lib/types";
import { HeroCampaignBanner } from "./HeroCampaignBanner";
import { DesignerSpotlight } from "./DesignerSpotlight";
import { EditorialCollectionShelf } from "./EditorialCollectionShelf";
import { ArticleCard } from "./ArticleCard";
import { ProductCard } from "@/components/ui/ProductCard";
import { LookbookCard } from "@/components/luxury/LookbookCard";

type FeaturedSectionRendererProps = {
  section: FeaturedSectionData;
  campaign?: EditorialCampaignData | null;
  collections?: EditorialCollectionData[];
  articles?: EditorialArticleData[];
  designers?: DesignerHouse[];
  products?: Product[];
  lookbooks?: LookbookData[];
};

export function FeaturedSectionRenderer({
  section,
  campaign,
  collections = [],
  articles = [],
  designers = [],
  products = [],
  lookbooks = [],
}: FeaturedSectionRendererProps) {
  if (!section.active) return null;

  switch (section.type) {
    case "hero_campaign": {
      if (!campaign) return null;
      return <HeroCampaignBanner campaign={campaign} className="mb-6" />;
    }

    case "designer_spotlight": {
      const spotlightDesigner = designers.find(
        (d) => d.handle === section.targetSlug || d.id === section.targetSlug
      ) || designers[0];
      if (!spotlightDesigner) return null;
      const designerProducts = products.filter(
        (p) => p.designerId === spotlightDesigner.id || p.designerName === spotlightDesigner.name
      );
      return (
        <DesignerSpotlight
          designer={spotlightDesigner}
          products={designerProducts}
          className="mb-6"
        />
      );
    }

    case "editorial_collection": {
      const collection = collections.find(
        (c) => c.slug === section.targetSlug
      ) || collections[0];
      if (!collection) return null;
      return <EditorialCollectionShelf collection={collection} className="mb-6" />;
    }

    case "article_rail": {
      if (!articles.length) return null;
      return (
        <section className="py-6 px-4">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <span className="ds-section-label">
                {section.subtitle || "Residencies & Features"}
              </span>
              <h2 className="ds-section-title mt-0.5">
                {section.title || "Editorial Stories"}
              </h2>
            </div>
          </div>
          <div className="space-y-4">
            {articles.map((art) => (
              <ArticleCard key={art.id} article={art} />
            ))}
          </div>
        </section>
      );
    }

    case "lookbook_rail": {
      if (!lookbooks.length) return null;
      return (
        <section className="py-6 px-4 bg-mist border-y border-[var(--border-subtle)]">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <span className="ds-section-label">
                {section.subtitle || "Runway & Lookbooks"}
              </span>
              <h2 className="ds-section-title mt-0.5">
                {section.title || "Campaign Lookbooks"}
              </h2>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {lookbooks.slice(0, 4).map((lb) => {
              const d = designers.find((house) => house.id === lb.designerId);
              return (
                <LookbookCard
                  key={lb.id}
                  lookbook={lb}
                  designerHandle={d?.handle || "maison"}
                />
              );
            })}
          </div>
        </section>
      );
    }

    case "limited_edition_shelf": {
      const limitedProducts = products.filter((p) => p.limitedEdition).slice(0, 4);
      if (!limitedProducts.length) return null;
      return (
        <section className="py-6 px-4">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <span className="ds-section-label">
                {section.subtitle || "Serialized Releases"}
              </span>
              <h2 className="ds-section-title mt-0.5">
                {section.title || "Limited Atelier Pieces"}
              </h2>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-5">
            {limitedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      );
    }

    case "editors_pick_shelf": {
      const editorsPicks = products.filter((p) => p.editorsPick).slice(0, 4);
      if (!editorsPicks.length) return null;
      return (
        <section className="py-6 px-4 bg-paper border-b border-[var(--border-subtle)]">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <span className="ds-section-label">
                {section.subtitle || "Handpicked Curation"}
              </span>
              <h2 className="ds-section-title mt-0.5">
                {section.title || "Editor's Pick"}
              </h2>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-5">
            {editorsPicks.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      );
    }

    default:
      return null;
  }
}
