"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidateHome } from "./cms-revalidate";
import type { SlideFormData, ActionResult, HeroSlideRow } from "@/types/cms";

export async function getSlides(): Promise<ActionResult<HeroSlideRow[]>> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("hero_slides")
      .select("*")
      .order("position", { ascending: true });
    if (error) return { data: null, error: error.message };
    return { data: data as HeroSlideRow[], error: null };
  } catch (err) {
    return { data: null, error: "Failed to fetch slides" };
  }
}

export async function createSlide(formData: SlideFormData): Promise<ActionResult<HeroSlideRow>> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("hero_slides")
      .insert({
        title: formData.title,
        subtitle: formData.subtitle || null,
        image_url: formData.image_url,
        cta_enabled: formData.cta_enabled,
        cta_text: formData.cta_text || null,
        cta_link: formData.cta_link || null,
        position: formData.position,
        is_active: formData.is_active,
        // New fields for enhanced hero section
        headline: formData.headline || null,
        subtext: formData.subtext || null,
        benefits: formData.benefits || [],
        cta_secondary_text: formData.cta_secondary_text || null,
        cta_secondary_link: formData.cta_secondary_link || null,
        layout_type: formData.layout_type,
        background_overlay: formData.background_overlay,
        trust_line: formData.trust_line || null,
      })
      .select()
      .single();
    if (error) return { data: null, error: error.message };
    await revalidateHome();
    return { data: data as HeroSlideRow, error: null };
  } catch (err: any) {
    return { data: null, error: err.message ?? "Failed to create slide" };
  }
}

export async function updateSlide(id: string, formData: SlideFormData): Promise<ActionResult<HeroSlideRow>> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("hero_slides")
      .update({
        title: formData.title,
        subtitle: formData.subtitle || null,
        image_url: formData.image_url,
        cta_enabled: formData.cta_enabled,
        cta_text: formData.cta_text || null,
        cta_link: formData.cta_link || null,
        position: formData.position,
        is_active: formData.is_active,
        // New fields for enhanced hero section
        headline: formData.headline || null,
        subtext: formData.subtext || null,
        benefits: formData.benefits || [],
        cta_secondary_text: formData.cta_secondary_text || null,
        cta_secondary_link: formData.cta_secondary_link || null,
        layout_type: formData.layout_type,
        background_overlay: formData.background_overlay,
        trust_line: formData.trust_line || null,
      })
      .eq("id", id)
      .select()
      .single();
    if (error) return { data: null, error: error.message };
    await revalidateHome();
    return { data: data as HeroSlideRow, error: null };
  } catch (err: any) {
    return { data: null, error: err.message ?? "Failed to update slide" };
  }
}

export async function deleteSlide(id: string): Promise<ActionResult> {
  try {
    const supabase = createAdminClient();
    const { error } = await supabase.from("hero_slides").delete().eq("id", id);
    if (error) return { data: null, error: error.message };
    await revalidateHome();
    return { data: null, error: null };
  } catch (err: any) {
    return { data: null, error: err.message ?? "Failed to delete slide" };
  }
}

export async function reorderSlides(orderedIds: string[]): Promise<ActionResult> {
  try {
    const supabase = createAdminClient();
    await Promise.all(
      orderedIds.map((id, index) =>
        supabase.from("hero_slides").update({ position: index }).eq("id", id)
      )
    );
    await revalidateHome();
    return { data: null, error: null };
  } catch (err: any) {
    return { data: null, error: err.message ?? "Failed to reorder slides" };
  }
}

export async function toggleSlideActive(id: string, is_active: boolean): Promise<ActionResult> {
  try {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("hero_slides")
      .update({ is_active })
      .eq("id", id);
    if (error) return { data: null, error: error.message };
    await revalidateHome();
    return { data: null, error: null };
  } catch (err: any) {
    return { data: null, error: err.message ?? "Failed to toggle slide" };
  }
}
