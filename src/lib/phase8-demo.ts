import type { LookbookData, Product, DesignerHouse } from "@/lib/types";

/** Demo lookbooks for Phase 8 (mock / seed baseline). */
export const DEMO_LOOKBOOKS: LookbookData[] = [
  {
    id: "lb-1",
    designerId: "dh-1",
    title: "Riviera Couture SS26",
    slug: "riviera-couture-ss26",
    kind: "seasonal",
    season: "SS26",
    coverImage:
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&q=80",
    description:
      "Architectural lehengas and cocktail drapes from the Mumbai atelier.",
    items: [
      {
        id: "lbi-1",
        mediaUrl:
          "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=900&q=80",
        mediaKind: "image",
        caption: "Structured lehenga in rose dust",
        productId: "prod-1",
      },
      {
        id: "lbi-2",
        mediaUrl:
          "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=900&q=80",
        mediaKind: "image",
        caption: "Atelier fittings",
        productId: "prod-2",
      },
    ],
  },
  {
    id: "lb-2",
    designerId: "dh-2",
    title: "Kishangarh Miniatures",
    slug: "kishangarh-miniatures",
    kind: "editorial",
    season: "AW25",
    coverImage:
      "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=1200&q=80",
    description: "Heritage indigo and lac dye campaign from Jaipur.",
    items: [
      {
        id: "lbi-3",
        mediaUrl:
          "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=900&q=80",
        mediaKind: "image",
        productId: "prod-5",
      },
    ],
  },
  {
    id: "lb-3",
    designerId: "dh-3",
    title: "Pashmina Opera",
    slug: "pashmina-opera",
    kind: "campaign",
    coverImage:
      "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=1200&q=80",
    description: "Opera coats and evening layers in cashmere.",
    items: [
      {
        id: "lbi-4",
        mediaUrl:
          "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=900&q=80",
        mediaKind: "image",
        productId: "prod-7",
      },
    ],
  },
];

export function getLookbooksByDesigner(designerId: string): LookbookData[] {
  return DEMO_LOOKBOOKS.filter((l) => l.designerId === designerId);
}

export function getLookbookBySlug(
  designerId: string,
  slug: string
): LookbookData | undefined {
  return DEMO_LOOKBOOKS.find(
    (l) => l.designerId === designerId && l.slug === slug
  );
}

/** Enrich mock products with Phase 8 luxury fields (idempotent). */
export function withLuxuryProductFields(products: Product[]): Product[] {
  return products.map((p, i) => {
    if (p.editionTotal != null || p.careInstructions) return p;
    const limited = Boolean(p.limitedEdition);
    const remaining = p.piecesRemaining ?? (limited ? 4 + (i % 6) : undefined);
    const total = limited
      ? p.editionTotal ?? Math.max(remaining ?? 10, 24 + (i % 40))
      : undefined;
    const sold =
      limited && total != null
        ? Math.max(0, total - (remaining ?? Math.floor(total * 0.2)))
        : 0;
    return {
      ...p,
      limitedEdition: limited || (i % 7 === 0),
      editionTotal: total,
      editionSold: sold,
      piecesRemaining: remaining,
      careInstructions:
        p.careInstructions ||
        "Dry clean only. Store in breathable garment bag away from direct light.",
      designerInspiration:
        p.designerInspiration ||
        "Drawn from atelier archives and seasonal craft residencies.",
      editorsPick: p.editorsPick ?? i % 5 === 0,
      handcrafted: p.handcrafted ?? true,
      madeToOrder: p.madeToOrder ?? Boolean(p.customizable),
      sustainable: p.sustainable ?? i % 4 === 0,
      recentPurchaseCount: p.recentPurchaseCount ?? (i % 9),
      badges: p.badges?.length
        ? p.badges
        : [
            ...(i % 5 === 0 ? ["editors_pick"] : []),
            ...(limited ? ["limited_edition"] : []),
          ],
    };
  });
}

export function withLuxuryDesignerFields(
  designers: DesignerHouse[]
): DesignerHouse[] {
  return designers.map((d, i) => ({
    ...d,
    designPhilosophy:
      d.designPhilosophy ||
      "Quiet luxury through material integrity and precise construction.",
    yearsExperience:
      d.yearsExperience ??
      (d.founded ? Math.max(3, new Date().getFullYear() - Number(d.founded)) : 8 + (i % 12)),
    studioLocation: d.studioLocation || d.location,
    awards: d.awards?.length
      ? d.awards
      : i % 2 === 0
        ? ["FDCI Showcase", "Vogue Talents Mention"]
        : ["Elle Style Award Nominee"],
    pressMentions: d.pressMentions?.length
      ? d.pressMentions
      : [
          {
            title: "The new language of ceremony",
            outlet: "Vogue India",
            year: "2025",
          },
          {
            title: "Atelier visits",
            outlet: "Harper's Bazaar",
            year: "2024",
          },
        ],
    editorialGallery: d.editorialGallery?.length
      ? d.editorialGallery
      : [d.banner, d.logo].filter(Boolean),
  }));
}

/** Apply luxury enrichments onto live mock arrays once. */
export function applyPhase8DemoEnrichment(
  products: Product[],
  designers: DesignerHouse[]
) {
  const enrichedProducts = withLuxuryProductFields(products);
  products.splice(0, products.length, ...enrichedProducts);
  const enrichedDesigners = withLuxuryDesignerFields(designers);
  designers.splice(0, designers.length, ...enrichedDesigners);
}
