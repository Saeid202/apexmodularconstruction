// CMS-specific TypeScript types for the admin panel

export interface HeroSlideRow {
  id: string
  title: string
  subtitle: string | null
  image_url: string
  cta_text: string | null
  cta_link: string | null
  cta_enabled: boolean
  position: number
  is_active: boolean
  created_at: string
  updated_at: string
  // New fields for enhanced hero section
  headline: string | null
  subtext: string | null
  benefits: string[] | null
  cta_secondary_text: string | null
  cta_secondary_link: string | null
  layout_type: string
  background_overlay: boolean
  trust_line: string | null
}

export interface NavItemRow {
  id: string
  label: string
  href: string
  position: number
  is_active: boolean
  open_in_new_tab: boolean
  created_at: string
  updated_at: string
}

export interface PageContentRow {
  id: string
  slug: string
  title: string
  content: string
  parent_id: string | null
  show_in_nav: boolean
  nav_label: string | null
  nav_position: number | null
  is_protected: boolean
  created_at: string
  updated_at: string
}

export interface PageTreeNode extends PageContentRow {
  children: PageContentRow[]
}

// ─── Form input types ─────────────────────────────────────────────────────────

export interface SlideFormData {
  title: string
  subtitle: string
  image_url: string
  cta_enabled: boolean
  cta_text: string
  cta_link: string
  position: number
  is_active: boolean
  // New fields for enhanced hero section
  headline: string
  subtext: string
  benefits: string[]
  cta_secondary_text: string
  cta_secondary_link: string
  layout_type: string
  background_overlay: boolean
  trust_line: string
}

export interface NavItemFormData {
  label: string
  href: string
  position: number
  is_active: boolean
  open_in_new_tab: boolean
}

export interface PageFormData {
  title: string
  slug: string
  parent_id: string | null
}

export interface PageNavAssignment {
  show_in_nav: boolean
  nav_label: string | null
  nav_position: number | null
}

// ─── Unified nav entry (merged page + custom links) ───────────────────────────

export type NavEntryType = 'page' | 'custom'

export interface UnifiedNavEntry {
  type: NavEntryType
  id: string
  label: string
  href: string
  position: number
  is_active: boolean
  open_in_new_tab: boolean
  // page-specific
  slug?: string
  parent_id?: string | null
  show_in_nav?: boolean
  nav_label?: string | null
  nav_position?: number | null
  children?: UnifiedNavEntry[]
}

// ─── Server action response shape ─────────────────────────────────────────────

export interface ActionResult<T = null> {
  data: T | null
  error: string | null
}
