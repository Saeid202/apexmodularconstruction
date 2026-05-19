"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidateAllPublic } from "./cms-revalidate";

export interface SiteSettings {
  logo_style: "complete-banner" | "icon-and-text" | "text-only";
  logo_height: "h-12" | "h-16" | "h-20";
}

const DEFAULT_SETTINGS: SiteSettings = {
  logo_style: "complete-banner",
  logo_height: "h-16",
};

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("page_contents")
      .select("content")
      .eq("slug", "site-settings")
      .single();

    if (error || !data) {
      // If it doesn't exist, seed it automatically
      const { data: seedData } = await supabase
        .from("page_contents")
        .insert({
          slug: "site-settings",
          title: "Site Settings",
          content: JSON.stringify(DEFAULT_SETTINGS),
          is_protected: true,
        })
        .select("content")
        .single();
      
      if (seedData) {
        return JSON.parse(seedData.content) as SiteSettings;
      }
      return DEFAULT_SETTINGS;
    }

    return JSON.parse(data.content) as SiteSettings;
  } catch (err) {
    return DEFAULT_SETTINGS;
  }
}

export async function updateSiteSettings(settings: SiteSettings): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("page_contents")
      .update({ content: JSON.stringify(settings) })
      .eq("slug", "site-settings");

    if (error) return { success: false, error: error.message };
    await revalidateAllPublic();
    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: err.message ?? "Failed to save settings" };
  }
}
