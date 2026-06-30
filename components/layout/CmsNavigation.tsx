import { createServerClient } from "@/lib/supabase/server";
import Link from "next/link";

interface CmsNavItem {
  label: string;
  href: string;
  open_in_new_tab: boolean;
  children?: { label: string; href: string }[];
}

async function getCmsNavItems(): Promise<CmsNavItem[]> {
  try {
    const supabase = await createServerClient();

    const [pagesResult, navItemsResult] = await Promise.all([
      supabase
        .from("page_contents" as any)
        .select("id, slug, title, nav_label, nav_position, parent_id, show_in_nav")
        .eq("show_in_nav", true)
        .order("nav_position", { ascending: true, nullsFirst: false }),
      supabase
        .from("nav_items" as any)
        .select("label, href, position, open_in_new_tab")
        .eq("is_active", true)
        .order("position", { ascending: true }),
    ]);

    const pages = (pagesResult.data as Array<{
      id: string; slug: string; title: string; nav_label: string | null;
      nav_position: number | null; parent_id: string | null; show_in_nav: boolean;
    }>) ?? [];
    const customLinks = (navItemsResult.data as Array<{
      label: string; href: string; position: number; open_in_new_tab: boolean;
    }>) ?? [];

    // Build page nav entries — top-level only, with children
    const parentPages = pages.filter((p) => p.parent_id === null);
    const childPages = pages.filter((p) => p.parent_id !== null);

    const pageNavItems: CmsNavItem[] = parentPages.map((p) => ({
      label: p.nav_label ?? p.title,
      href: `/${p.slug}`,
      open_in_new_tab: false,
      children: childPages
        .filter((c) => c.parent_id === p.id)
        .map((c) => ({ label: c.nav_label ?? c.title, href: `/${c.slug}` })),
    }));

    // Merge with custom links (custom links don't have a position relative to pages,
    // so append them after page links, sorted by their own position)
    const customNavItems: CmsNavItem[] = customLinks.map((n) => ({
      label: n.label,
      href: n.href,
      open_in_new_tab: n.open_in_new_tab,
    }));

    // Filter out pages that are already hardcoded in Navigation.tsx to prevent duplication
    const hardcodedHrefs = ["/about", "/products", "/blog", "/contact", "/services", "/"];
    const filtered = [...pageNavItems, ...customNavItems].filter((item) => {
      const href = item.href.toLowerCase().trim();
      const normalizedHref = href.startsWith("/") ? href : `/${href}`;
      return !hardcodedHrefs.includes(normalizedHref);
    });

    return filtered;
  } catch {
    return [];
  }
}

export async function CmsNavigation() {
  const items = await getCmsNavItems();

  if (items.length === 0) return null;

  return (
    <nav>
      <ul className="flex items-center gap-1">
        {items.map((item) => (
          <li key={item.href} className="relative group">
            <Link
              href={item.href}
              target={item.open_in_new_tab ? "_blank" : undefined}
              rel={item.open_in_new_tab ? "noopener noreferrer" : undefined}
              className="relative text-sm font-semibold text-purple-100 transition-all hover:text-yellow-300 min-h-[44px] flex items-center px-4 py-2 rounded-xl hover:bg-white/10"
            >
              {item.label}
              <span className="absolute bottom-1 left-4 right-4 h-0.5 bg-[#D4AF37] scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-full" />
            </Link>

            {/* Dropdown for child pages */}
            {item.children && item.children.length > 0 && (
              <ul className="absolute left-0 top-full z-50 hidden group-hover:block min-w-[180px] rounded-xl border border-white/10 bg-[#4B1D8F] shadow-xl py-1">
                {item.children.map((child) => (
                  <li key={child.href}>
                    <Link
                      href={child.href}
                      className="block px-4 py-2 text-sm text-purple-100 hover:bg-white/10 hover:text-yellow-300 transition-colors"
                    >
                      {child.label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}
