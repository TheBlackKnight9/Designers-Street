# 11 — Design System & Visual Tokens

## 1. Color Palette & Design Tokens

Designers Street uses a curated, warm luxury color palette defined in `src/app/globals.css` and `tailwind.config.ts`.

| Token | CSS Variable / Hex | Usage |
|:---|:---:|:---|
| `charcoal` | `#1A1918` | Primary text, main CTA buttons, dark headings |
| `paper` | `#FAF8F5` | Primary application background (warm ivory) |
| `mist` | `#F2EFEA` | Secondary container fill, input background |
| `cloud` | `#E5E0D8` | Border lines, divider rules, neutral chips |
| `gold` | `#D4AF37` | Accent highlights, badges, active tabs |
| `gold-dark` | `#AA8625` | Gold text on light background for contrast compliance |
| `stone` | `#706C66` | Secondary body text, subheadings, captions |
| `emerald` | `#059669` | **"FREE SHIPPING"** badges, order confirmed status |

---

## 2. Typography System

- **Display Serif Font:** Playfair Display / Cormorant Garamond (Used for headers, brand names, and luxury callouts).
- **Body Sans-Serif Font:** Inter / System UI (Used for high legibility in product details, checkout forms, and tables).
- **Monospace Font:** JetBrains Mono / System Mono (Used for order IDs, tracking numbers, GSTIN, and IFSC codes).

---

## 3. Component Styling Standards

- **Buttons:** Rounded-full or rounded-xl, uppercase tracking-wider, high-contrast hover transitions (`hover:bg-black`).
- **Cards:** `bg-paper border border-cloud rounded-2xl shadow-xs hover:shadow-md transition-all`.
- **Badges:** Pill-shaped `rounded-full text-[10px] font-bold uppercase tracking-wider px-3 py-1`.
- **Inputs:** `rounded-xl border border-cloud bg-mist px-4 py-2.5 outline-none focus:ring-2 focus:ring-gold/40`.
