/**
 * Page Builder types.
 *
 * An architect's landing page is stored as a `PageLayout` — an ordered list of
 * blocks — inside the existing `branding` JSON column on the `architects` table.
 * No schema/backend change is required: the builder only ever produces DATA that
 * is rendered by the fixed, pre-built block components in
 * `components/page-builder/blocks`.
 */

export type BlockType = "hero" | "text" | "gallery" | "cta" | "imageText";

export interface BlockBase {
  /** Stable id used as React key and for reordering. */
  id: string;
  type: BlockType;
}

export interface HeroBlock extends BlockBase {
  type: "hero";
  props: {
    badge?: string;
    heading: string;
    subheading?: string;
    imageUrl?: string;
    primaryLabel?: string;
    primaryHref?: string;
    secondaryLabel?: string;
    secondaryHref?: string;
  };
}

export interface TextBlock extends BlockBase {
  type: "text";
  props: {
    heading?: string;
    /** Plain text; blank lines separate paragraphs. */
    body: string;
  };
}

export interface GalleryBlock extends BlockBase {
  type: "gallery";
  props: {
    heading?: string;
    /** One image URL per line. */
    images: string;
  };
}

export interface CtaBlock extends BlockBase {
  type: "cta";
  props: {
    heading: string;
    subtext?: string;
    buttonLabel?: string;
    buttonHref?: string;
  };
}

/** Where the text sits relative to the image in an `imageText` block. */
export type TextPosition = "left" | "right" | "above" | "below";

export interface ImageTextBlock extends BlockBase {
  type: "imageText";
  props: {
    imageUrl?: string;
    /** Alt text for screen readers. Empty is treated as decorative. */
    imageAlt?: string;
    heading?: string;
    /** Plain text; blank lines separate paragraphs. */
    body: string;
    /**
     * "left"/"right" place the text beside the image in two columns.
     * "above"/"below" stack it, and "below" renders as a caption.
     * Stored as a string like every other prop; unknown values fall back to "right".
     */
    textPosition?: TextPosition;
  };
}

export type Block = HeroBlock | TextBlock | GalleryBlock | CtaBlock | ImageTextBlock;

export type PageLayout = Block[];

/* ------------------------------------------------------------------ */
/* Editor metadata — drives the generic property panel in the editor. */
/* ------------------------------------------------------------------ */

export type FieldType = "text" | "textarea" | "image" | "url" | "select";

export interface BlockField {
  key: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  /** Required for `select` fields; ignored otherwise. */
  options?: { value: string; label: string }[];
  /** Optional helper text rendered under the control in the editor. */
  hint?: string;
}

export interface BlockDefinition {
  type: BlockType;
  label: string;
  /** lucide-react icon name, resolved in the editor. */
  icon: string;
  description: string;
  fields: BlockField[];
  /** Default props used when the block is added. */
  defaults: Record<string, string>;
}

export const BLOCK_LIBRARY: BlockDefinition[] = [
  {
    type: "hero",
    label: "Hero",
    icon: "LayoutTemplate",
    description: "Large banner with headline and call-to-action buttons.",
    fields: [
      { key: "badge", label: "Badge", type: "text", placeholder: "Certified Apex Architect Partner" },
      { key: "heading", label: "Heading", type: "text", placeholder: "Your studio name" },
      { key: "subheading", label: "Subheading", type: "textarea", placeholder: "One line about what you do" },
      { key: "imageUrl", label: "Background image URL", type: "image" },
      { key: "primaryLabel", label: "Primary button label", type: "text", placeholder: "Browse Catalog" },
      { key: "primaryHref", label: "Primary button link", type: "url", placeholder: "#portfolio" },
      { key: "secondaryLabel", label: "Secondary button label", type: "text", placeholder: "Contact Studio" },
      { key: "secondaryHref", label: "Secondary button link", type: "url", placeholder: "#contact" },
    ],
    defaults: {
      badge: "Certified Apex Architect Partner",
      heading: "Your Studio Name",
      subheading: "Modular architecture, designed for how people actually live.",
      imageUrl: "",
      primaryLabel: "Browse Catalog",
      primaryHref: "#portfolio",
      secondaryLabel: "Contact Studio",
      secondaryHref: "#contact",
    },
  },
  {
    type: "text",
    label: "Text Section",
    icon: "Type",
    description: "A heading with one or more paragraphs of text.",
    fields: [
      { key: "heading", label: "Heading", type: "text", placeholder: "About the Studio" },
      { key: "body", label: "Body", type: "textarea", placeholder: "Write a few sentences. Leave a blank line to start a new paragraph." },
    ],
    defaults: {
      heading: "About the Studio",
      body: "We design modern architectural structures that push the boundaries of modularity, sustainability, and structural excellence.",
    },
  },
  {
    type: "gallery",
    label: "Image Gallery",
    icon: "Image",
    description: "A responsive grid of images.",
    fields: [
      { key: "heading", label: "Heading", type: "text", placeholder: "Selected Work" },
      { key: "images", label: "Image URLs (one per line)", type: "textarea", placeholder: "https://...\nhttps://..." },
    ],
    defaults: {
      heading: "Selected Work",
      images: "",
    },
  },
  {
    type: "imageText",
    label: "Image + Text",
    icon: "Columns2",
    description: "One image with text beside it, above it, or as a caption underneath.",
    fields: [
      { key: "imageUrl", label: "Image", type: "image" },
      {
        key: "imageAlt",
        label: "Image alt text",
        type: "text",
        placeholder: "Describe the image for screen readers",
        hint: "Leave blank only if the image is purely decorative.",
      },
      { key: "heading", label: "Heading", type: "text", placeholder: "A closer look" },
      {
        key: "body",
        label: "Text",
        type: "textarea",
        placeholder: "Write a few sentences. Leave a blank line to start a new paragraph.",
      },
      {
        key: "textPosition",
        label: "Text position",
        type: "select",
        options: [
          { value: "right", label: "Right of image" },
          { value: "left", label: "Left of image" },
          { value: "above", label: "Above image" },
          { value: "below", label: "Below image (caption)" },
        ],
      },
    ],
    defaults: {
      imageUrl: "",
      imageAlt: "",
      heading: "A closer look",
      body: "Describe the project, the material choice or the detail shown here. Leave a blank line to start a new paragraph.",
      textPosition: "right",
    },
  },
  {
    type: "cta",
    label: "Call to Action",
    icon: "Sparkles",
    description: "A centered prompt with a single button.",
    fields: [
      { key: "heading", label: "Heading", type: "text", placeholder: "Request a consultation" },
      { key: "subtext", label: "Subtext", type: "textarea", placeholder: "Short supporting line" },
      { key: "buttonLabel", label: "Button label", type: "text", placeholder: "Get in touch" },
      { key: "buttonHref", label: "Button link", type: "url", placeholder: "#contact" },
    ],
    defaults: {
      heading: "Request Custom Collaboration",
      subtext: "Get in touch to customize a modular template or design a new structure.",
      buttonLabel: "Get in Touch",
      buttonHref: "#contact",
    },
  },
];

export function getBlockDefinition(type: BlockType): BlockDefinition | undefined {
  return BLOCK_LIBRARY.find((b) => b.type === type);
}
