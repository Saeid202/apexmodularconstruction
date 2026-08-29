/**
 * Page Builder starter templates.
 *
 * A template is nothing more than an ordered recipe of the SAME pre-built
 * blocks the page builder already offers (`BLOCK_LIBRARY` in
 * `types/page-builder.ts`). Applying one produces a plain `PageLayout`, so the
 * editor, the live studio page and the renderer all keep working unchanged —
 * there is no new block type, no schema change and no new persistence path.
 *
 * Each template block only declares the props that differ from the block's
 * library defaults; the rest are inherited at instantiation time so a template
 * never goes stale when a new field is added to a block definition.
 */

import { getBlockDefinition } from "./page-builder";
import type { Block, BlockType, PageLayout } from "./page-builder";

export interface TemplateBlock {
  type: BlockType;
  /** Props merged over the block definition's defaults. All values are strings. */
  props?: Record<string, string>;
}

export interface PageTemplate {
  /** Stable slug, used for React keys and preview ids. */
  id: string;
  name: string;
  /** One-line positioning shown under the template name. */
  tagline: string;
  /** Short paragraph describing who the layout suits. */
  description: string;
  /** Small chips on the card, e.g. "Portfolio-led". */
  bestFor: string[];
  blocks: TemplateBlock[];
}

/* ------------------------------------------------------------------ */
/* Shared image sets (Unsplash, matching the rest of the app).        */
/* ------------------------------------------------------------------ */

const HERO = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&q=80&w=1600`;
const TILE = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&q=80&w=800`;

/**
 * Curated image pool. Every id is verified to resolve on images.unsplash.com
 * AND has been checked visually, so the key names describe the actual subject.
 * Some ids used elsewhere in this repo now 404 upstream and are avoided here.
 *
 * If you add an id: request it (dead ids 404) and look at it (ids reused from
 * elsewhere in this repo turned out to be a stock photo of a developer at a
 * monitor and a warehouse, neither of which belongs in an architect's gallery).
 */
const PHOTO = {
  /** Modern white/brick house with an infinity pool. */
  poolVilla: "photo-1580587771525-78b9dba3b914",
  /** Dark timber contemporary house lit at dusk. */
  modularHome: "photo-1600585154340-be6161a56a0c",
  /** Suburban family home at dusk, warm windows. */
  suburbanHome: "photo-1549517045-bc93de075e53",
  /** Small red house alone on a green hill. */
  ruralHome: "photo-1518780664697-55e3ad937233",
  /** Aerial of a timber-frame structure under construction. */
  timberFrame: "photo-1556156653-e5a7c69cc263",
  /** Site crew working with rebar and services. */
  constructionSite: "photo-1504307651254-35680f356dfd",
  /** Aerial grid of stacked shipping containers. */
  containerYard: "photo-1494412519320-aa613dfb7738",
  /** Pared-back interior: sofa, plant, soft daylight. */
  interiorMinimal: "photo-1513694203232-719a280e022f",
  /** Bright formal living room with large windows. */
  interiorLounge: "photo-1598928506311-c55ded91a20c",
  /** Modern kitchen with island and stools. */
  kitchen: "photo-1556912167-f556f1f39fdf",
  /** Modern bathroom, glass shower and twin vanity. */
  bathroom: "photo-1584622650111-993a426fbf0a",
  /** Hands drafting on paper — hero use only, reads wrong in a gallery grid. */
  drafting: "photo-1450101499163-c8848c66ca85",
} as const;

/** Gallery blocks take one URL per line, so build the string explicitly. */
const gallery = (...ids: string[]) => ids.map(TILE).join("\n");

/* ------------------------------------------------------------------ */
/* The template library.                                              */
/* ------------------------------------------------------------------ */

export const PAGE_TEMPLATES: PageTemplate[] = [
  {
    id: "studio-showcase",
    name: "Studio Showcase",
    tagline: "Hero, story, work, enquiry — the dependable studio homepage.",
    description:
      "A balanced four-section page that introduces the studio, explains the approach and closes with a contact prompt. The safest starting point if you are not sure which layout you want.",
    bestFor: ["Established studios", "Balanced", "4 blocks"],
    blocks: [
      {
        type: "hero",
        props: {
          badge: "Certified Apex Architect Partner",
          heading: "Modular architecture, built with intent",
          subheading:
            "We design and deliver factory-built homes that arrive faster, perform better and still feel unmistakably custom.",
          imageUrl: HERO(PHOTO.poolVilla),
          primaryLabel: "View Our Work",
          primaryHref: "#portfolio",
          secondaryLabel: "Start a Project",
          secondaryHref: "#contact",
        },
      },
      {
        type: "text",
        props: {
          heading: "About the Studio",
          body:
            "We are an architecture practice specialising in modular and prefabricated construction. Every project starts with the site, the climate and the way our clients actually live — then we resolve it into a system that a factory can build precisely and repeatedly.\n\nThat discipline means fewer surprises on site, tighter budgets and a finished building that holds its detail. We work with Apex Modular's manufacturing network so the drawings we issue are the drawings that get built.",
        },
      },
      {
        type: "gallery",
        props: {
          heading: "Selected Work",
          images: gallery(
            PHOTO.modularHome,
            PHOTO.poolVilla,
            PHOTO.ruralHome,
            PHOTO.interiorLounge,
            PHOTO.timberFrame,
            PHOTO.kitchen
          ),
        },
      },
      {
        type: "cta",
        props: {
          heading: "Let's talk about your site",
          subtext:
            "Send over your lot details and we will come back with a feasible modular approach, a rough footprint and an honest budget range.",
          buttonLabel: "Request a Consultation",
          buttonHref: "#contact",
        },
      },
    ],
  },
  {
    id: "minimal-portfolio",
    name: "Minimal Portfolio",
    tagline: "Let the photography do the talking.",
    description:
      "A stripped-back, image-first page: a dark typographic hero, a large gallery grid and a single closing prompt. Ideal when your work is stronger than any paragraph about it.",
    bestFor: ["Image-first", "Fast to fill in", "3 blocks"],
    blocks: [
      {
        type: "hero",
        props: {
          badge: "Selected Works",
          heading: "Quiet buildings, precisely made",
          subheading: "An architecture studio working in modular timber and light steel.",
          imageUrl: "",
          primaryLabel: "See the Portfolio",
          primaryHref: "#portfolio",
          secondaryLabel: "",
          secondaryHref: "",
        },
      },
      {
        type: "gallery",
        props: {
          heading: "Portfolio",
          images: gallery(
            PHOTO.poolVilla,
            PHOTO.modularHome,
            PHOTO.timberFrame,
            PHOTO.suburbanHome,
            PHOTO.ruralHome,
            PHOTO.interiorMinimal,
            PHOTO.interiorLounge,
            PHOTO.kitchen,
            PHOTO.bathroom
          ),
        },
      },
      {
        type: "cta",
        props: {
          heading: "Enquiries welcome",
          subtext: "Residential, ADU and small commercial commissions.",
          buttonLabel: "Contact the Studio",
          buttonHref: "#contact",
        },
      },
    ],
  },
  {
    id: "design-build-firm",
    name: "Design & Build Firm",
    tagline: "Services up front, process explained, work as proof.",
    description:
      "Written for practices that sell an end-to-end service. Leads with what you offer, shows completed projects, then walks through your process so clients know exactly what working with you looks like.",
    bestFor: ["Service-led", "Full-service firms", "5 blocks"],
    blocks: [
      {
        type: "hero",
        props: {
          badge: "Design · Engineering · Delivery",
          heading: "One team from sketch to handover",
          subheading:
            "Architecture, structural coordination and modular delivery under a single contract — so nothing falls between consultants.",
          imageUrl: HERO(PHOTO.constructionSite),
          primaryLabel: "Our Services",
          primaryHref: "#about",
          secondaryLabel: "Book a Call",
          secondaryHref: "#contact",
        },
      },
      {
        type: "text",
        props: {
          heading: "What We Do",
          body:
            "Feasibility and zoning review. We assess what your lot allows before you spend money on design, including setbacks, coverage and permitted use.\n\nArchitectural design and permit sets. Concept through to stamped construction documents, coordinated with the modular manufacturer from day one.\n\nModular delivery and site coordination. Factory scheduling, transport logistics, foundation coordination and on-site assembly oversight through to occupancy.",
        },
      },
      {
        type: "gallery",
        props: {
          heading: "Recent Projects",
          images: gallery(
            PHOTO.modularHome,
            PHOTO.timberFrame,
            PHOTO.constructionSite,
            PHOTO.containerYard,
            PHOTO.poolVilla,
            PHOTO.ruralHome
          ),
        },
      },
      {
        type: "text",
        props: {
          heading: "How It Works",
          body:
            "1. Discovery — a paid feasibility study covering site constraints, zoning envelope and a realistic budget band.\n\n2. Design — two concept directions, one developed to permit stage with fixed modular dimensions.\n\n3. Fabrication — your building is manufactured off site while foundations and services go in, typically in parallel.\n\n4. Assembly — modules are set, stitched and finished on site, then handed over with warranties and as-built documentation.",
        },
      },
      {
        type: "cta",
        props: {
          heading: "Start with a feasibility review",
          subtext: "The fastest way to find out whether your project works before committing to full design.",
          buttonLabel: "Book a Feasibility Review",
          buttonHref: "#contact",
        },
      },
    ],
  },
  {
    id: "project-launch",
    name: "Project Launch",
    tagline: "Put one flagship building at the centre of the page.",
    description:
      "A single-project landing page: a full-bleed hero of the building, the story behind it, a detail gallery and the specification. Useful for launching a new model or a development you are taking enquiries on.",
    bestFor: ["One flagship project", "New model launch", "5 blocks"],
    blocks: [
      {
        type: "hero",
        props: {
          badge: "Now Taking Reservations",
          heading: "The Nordic Canopy",
          subheading:
            "An 850 sq ft modular cabin engineered for heavy snow loads, long winters and very low running costs.",
          imageUrl: HERO(PHOTO.modularHome),
          primaryLabel: "See the Details",
          primaryHref: "#portfolio",
          secondaryLabel: "Reserve a Build Slot",
          secondaryHref: "#contact",
        },
      },
      {
        type: "text",
        props: {
          heading: "The Brief",
          body:
            "The Canopy started as a question: how do you put a warm, generous cabin on a difficult northern site without a two-year build programme? The answer was to stop treating the building as bespoke and treat it as a system.\n\nTwo modules, one shared spine, a deep roof overhang doing the work of a porch, a snow shelf and shading all at once. Everything else follows from that move — which is why it can be built in a factory in weeks and set on site in a single day.",
        },
      },
      {
        type: "gallery",
        props: {
          heading: "Inside the Build",
          images: gallery(
            PHOTO.interiorMinimal,
            PHOTO.interiorLounge,
            PHOTO.kitchen,
            PHOTO.bathroom,
            PHOTO.timberFrame,
            PHOTO.constructionSite
          ),
        },
      },
      {
        type: "text",
        props: {
          heading: "Specification",
          body:
            "Footprint 850 sq ft · 2 bedrooms · 1 bathroom · 2 modules\n\nStructure: light steel frame with engineered timber floor cassettes. Envelope: 8 in mineral wool with a continuous exterior insulation layer and taped air barrier. Glazing: triple-glazed, argon filled, thermally broken frames.\n\nDelivery: 12–16 weeks in factory, one day to set, four to six weeks of site finishing. Certified to CSA A277.",
        },
      },
      {
        type: "cta",
        props: {
          heading: "Reserve a build slot",
          subtext: "Factory capacity is allocated by deposit order. Tell us your target occupancy date and we will confirm availability.",
          buttonLabel: "Enquire About Availability",
          buttonHref: "#contact",
        },
      },
    ],
  },
  {
    id: "consultation-first",
    name: "Consultation First",
    tagline: "Built to convert enquiries, not to browse.",
    description:
      "A short, text-forward page aimed squarely at generating leads. No gallery to maintain — just a clear offer, credentials that build trust and a strong closing prompt.",
    bestFor: ["Lead generation", "No photos needed", "4 blocks"],
    blocks: [
      {
        type: "hero",
        props: {
          badge: "Accepting New Commissions",
          heading: "Find out what your lot can actually take",
          subheading:
            "A fixed-fee feasibility review that tells you the buildable envelope, the modular options and the realistic budget — before you commit to design.",
          imageUrl: HERO(PHOTO.drafting),
          primaryLabel: "Request a Review",
          primaryHref: "#contact",
          secondaryLabel: "How It Works",
          secondaryHref: "#about",
        },
      },
      {
        type: "text",
        props: {
          heading: "What You Get",
          body:
            "A zoning summary in plain language: what the bylaw permits, what it restricts and where the variances would be.\n\nA buildable envelope sketch showing footprint, setbacks, height limits and where the modules can land given site access.\n\nA costed modular direction — which configurations fit, what each would cost delivered, and the programme to occupancy.\n\nA written recommendation you can take to a lender, a partner or another architect. It is yours either way.",
        },
      },
      {
        type: "text",
        props: {
          heading: "Why Work With Us",
          body:
            "Licensed architecture practice with modular delivery experience across residential, ADU and small commercial work.\n\nWe design to manufacturing tolerances from the first sketch, so what gets drawn is what the factory can actually build — no redesign when the shop drawings land.\n\nFixed fees, defined deliverables and a single point of contact for the whole engagement.",
        },
      },
      {
        type: "cta",
        props: {
          heading: "Book your feasibility review",
          subtext: "Send your address and a short note about what you want to build. We reply within two business days.",
          buttonLabel: "Get Started",
          buttonHref: "#contact",
        },
      },
    ],
  },
  {
    id: "sustainable-studio",
    name: "Sustainable Studio",
    tagline: "Lead with performance, back it with numbers.",
    description:
      "For practices whose pitch is energy performance and low-carbon construction. Pairs the environmental story with hard figures so the claims stay credible.",
    bestFor: ["Passive house", "Low-carbon", "5 blocks"],
    blocks: [
      {
        type: "hero",
        props: {
          badge: "Low-Carbon Modular Design",
          heading: "Buildings that cost almost nothing to run",
          subheading:
            "Airtight, heavily insulated, factory-built homes designed to a measured energy target rather than a marketing claim.",
          imageUrl: HERO(PHOTO.ruralHome),
          primaryLabel: "See the Numbers",
          primaryHref: "#about",
          secondaryLabel: "Talk to Us",
          secondaryHref: "#contact",
        },
      },
      {
        type: "text",
        props: {
          heading: "Our Approach",
          body:
            "Performance is a design decision, not a product you add at the end. We fix the energy target at concept stage and let it drive form, orientation, glazing ratio and envelope build-up.\n\nOff-site manufacture is what makes it achievable. Airtightness that is difficult to hit in the rain on a site is routine in a controlled factory, and the offcuts get recycled rather than skipped.",
        },
      },
      {
        type: "gallery",
        props: {
          heading: "Built Work",
          images: gallery(
            PHOTO.ruralHome,
            PHOTO.poolVilla,
            PHOTO.modularHome,
            PHOTO.timberFrame,
            PHOTO.interiorLounge,
            PHOTO.suburbanHome
          ),
        },
      },
      {
        type: "text",
        props: {
          heading: "Measured Performance",
          body:
            "Airtightness: 0.6 air changes per hour at 50 Pa, blower-door tested on every completed build.\n\nEnvelope: continuous exterior insulation with thermal-bridge-free detailing, verified by modelling before fabrication.\n\nEnergy: space heating demand at or below 15 kWh/m² per year, with mechanical ventilation and heat recovery as standard.\n\nEmbodied carbon: timber-first structure where the span allows, with a whole-building carbon estimate issued at permit stage.",
        },
      },
      {
        type: "cta",
        props: {
          heading: "Design to a real energy target",
          subtext: "Tell us the performance standard you are aiming for and we will tell you what it takes to get there.",
          buttonLabel: "Start a Conversation",
          buttonHref: "#contact",
        },
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

export function getPageTemplate(id: string): PageTemplate | undefined {
  return PAGE_TEMPLATES.find((t) => t.id === id);
}

function buildBlock(templateBlock: TemplateBlock, id: string): Block {
  const def = getBlockDefinition(templateBlock.type);
  return {
    id,
    type: templateBlock.type,
    props: { ...(def?.defaults ?? {}), ...(templateBlock.props ?? {}) },
  } as Block;
}

/**
 * Deterministic layout for rendering a preview. Ids are derived from the
 * template so server and client markup agree; never persist this — use
 * `instantiateTemplate` when the architect actually applies a template.
 */
export function buildTemplatePreview(template: PageTemplate): PageLayout {
  return template.blocks.map((block, i) => buildBlock(block, `${template.id}-preview-${i}`));
}

/**
 * Fresh, saveable layout with unique block ids — matches the shape the page
 * builder's own `createBlock` produces.
 */
export function instantiateTemplate(template: PageTemplate): PageLayout {
  return template.blocks.map((block, i) => {
    const id =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${block.type}-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 8)}`;
    return buildBlock(block, id);
  });
}
