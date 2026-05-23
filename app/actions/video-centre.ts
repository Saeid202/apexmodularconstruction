"use server";

import { createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface VideoItem {
  id: string;
  title: string;
  description: string | null;
  youtube_url: string;
  youtube_id: string;
  is_featured: boolean;
  position: number;
  created_at: string;
  updated_at: string;
}

/**
 * Helper to extract YouTube Video ID from any standard or mobile URL.
 */
function extractYoutubeId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

/**
 * Check if the active session is from an administrator.
 */
async function verifyAdmin(): Promise<{ isAdmin: boolean; error: string | null }> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { isAdmin: false, error: "Authentication required" };

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return { isAdmin: false, error: "Access denied: Administrative privileges required" };
    }

    return { isAdmin: true, error: null };
  } catch (err) {
    return { isAdmin: false, error: "Authorization error" };
  }
}

/**
 * Fetch all videos for public viewing, ordered by featured status first,
 * then custom sorting position, then date.
 */
export async function getVideos(): Promise<{ data: VideoItem[] | null; error: string | null }> {
  try {
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from("video_centre")
      .select("*")
      .order("is_featured", { ascending: false })
      .order("position", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) return { data: null, error: error.message };
    return { data: data as VideoItem[], error: null };
  } catch (err) {
    console.error("getVideos unexpected error:", err);
    return { data: null, error: "Failed to fetch videos" };
  }
}

/**
 * Add a new video to the repository (Admin only).
 */
export async function addVideo(input: {
  title: string;
  description: string;
  youtubeUrl: string;
  isFeatured: boolean;
  position?: number;
}): Promise<{ success: boolean; error: string | null }> {
  try {
    const { isAdmin, error: adminErr } = await verifyAdmin();
    if (!isAdmin) return { success: false, error: adminErr };

    if (!input.title.trim() || !input.youtubeUrl.trim()) {
      return { success: false, error: "Title and YouTube URL are required fields." };
    }

    const videoId = extractYoutubeId(input.youtubeUrl);
    if (!videoId) {
      return { success: false, error: "Invalid YouTube URL format. Could not extract video ID." };
    }

    const supabase = await createServerClient();

    // If setting this video as featured, turn off featured status for all other videos
    if (input.isFeatured) {
      await supabase
        .from("video_centre")
        .update({ is_featured: false })
        .eq("is_featured", true);
    }

    const { error } = await supabase.from("video_centre").insert({
      title: input.title.trim(),
      description: input.description.trim() || null,
      youtube_url: input.youtubeUrl.trim(),
      youtube_id: videoId,
      is_featured: input.isFeatured,
      position: input.position ?? 0,
    });

    if (error) return { success: false, error: error.message };

    revalidatePath("/video-centre");
    return { success: true, error: null };
  } catch (err) {
    console.error("addVideo unexpected error:", err);
    return { success: false, error: "An unexpected error occurred." };
  }
}

/**
 * Update an existing video record (Admin only).
 */
export async function updateVideo(
  id: string,
  input: {
    title: string;
    description: string;
    youtubeUrl: string;
    isFeatured: boolean;
    position?: number;
  }
): Promise<{ success: boolean; error: string | null }> {
  try {
    const { isAdmin, error: adminErr } = await verifyAdmin();
    if (!isAdmin) return { success: false, error: adminErr };

    if (!input.title.trim() || !input.youtubeUrl.trim()) {
      return { success: false, error: "Title and YouTube URL are required." };
    }

    const videoId = extractYoutubeId(input.youtubeUrl);
    if (!videoId) {
      return { success: false, error: "Invalid YouTube URL format. Could not extract video ID." };
    }

    const supabase = await createServerClient();

    // If setting this video as featured, turn off featured status for all other videos
    if (input.isFeatured) {
      await supabase
        .from("video_centre")
        .update({ is_featured: false })
        .eq("is_featured", true);
    }

    const { error } = await supabase
      .from("video_centre")
      .update({
        title: input.title.trim(),
        description: input.description.trim() || null,
        youtube_url: input.youtubeUrl.trim(),
        youtube_id: videoId,
        is_featured: input.isFeatured,
        position: input.position ?? 0,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) return { success: false, error: error.message };

    revalidatePath("/video-centre");
    return { success: true, error: null };
  } catch (err) {
    console.error("updateVideo unexpected error:", err);
    return { success: false, error: "An unexpected error occurred." };
  }
}

/**
 * Delete a video from the repository (Admin only).
 */
export async function deleteVideo(id: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const { isAdmin, error: adminErr } = await verifyAdmin();
    if (!isAdmin) return { success: false, error: adminErr };

    const supabase = await createServerClient();
    const { error } = await supabase
      .from("video_centre")
      .delete()
      .eq("id", id);

    if (error) return { success: false, error: error.message };

    revalidatePath("/video-centre");
    return { success: true, error: null };
  } catch (err) {
    console.error("deleteVideo unexpected error:", err);
    return { success: false, error: "An unexpected error occurred." };
  }
}
