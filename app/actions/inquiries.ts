"use server";

import { createAdminClient } from "@/lib/supabase/admin";

export interface ProjectEstimateInput {
  name: string;
  email: string;
  projectType: string;
  projectSize: string;
  location: string;
  budget: string;
  notes?: string;
}

export async function submitProjectEstimate(
  input: ProjectEstimateInput
): Promise<{ success: boolean; error: string | null }> {
  try {
    // Validate required fields
    if (!input.name.trim() || !input.email.trim() || !input.projectType || !input.projectSize || !input.location.trim() || !input.budget) {
      return { success: false, error: "Please fill in all required fields." };
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(input.email)) {
      return { success: false, error: "Please enter a valid email address." };
    }

    // Serialize estimate details into the message field
    const message = [
      `Project Type: ${input.projectType}`,
      `Project Size: ${input.projectSize}`,
      `Location: ${input.location}`,
      `Budget Range: ${input.budget}`,
      input.notes?.trim() ? `Additional Notes: ${input.notes.trim()}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    const admin = createAdminClient();

    const { error } = await admin.from("inquiries").insert({
      name: input.name.trim(),
      email: input.email.trim().toLowerCase(),
      subject: "Project Cost Estimate Request",
      message,
      status: "new",
    });

    if (error) {
      console.error("submitProjectEstimate insert error:", error.message);
      return { success: false, error: "Failed to submit. Please try again or contact us directly." };
    }

    return { success: true, error: null };
  } catch (err) {
    console.error("submitProjectEstimate unexpected error:", err);
    return { success: false, error: "An unexpected error occurred. Please try again." };
  }
}

export interface ContactInquiryInput {
  name: string;
  email: string;
  companyName?: string;
  phone?: string;
  subject: string;
  projectBudget?: string;
  projectLocation?: string;
  message: string;
}

export async function submitContactInquiry(
  input: ContactInquiryInput
): Promise<{ success: boolean; error: string | null }> {
  try {
    if (!input.name.trim() || !input.email.trim() || !input.subject.trim() || !input.message.trim()) {
      return { success: false, error: "Please fill in all required fields." };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(input.email)) {
      return { success: false, error: "Please enter a valid email address." };
    }

    // Format secure high-end corporate message body
    const formattedMessage = [
      input.companyName?.trim() ? `Company: ${input.companyName.trim()}` : null,
      input.phone?.trim() ? `Phone: ${input.phone.trim()}` : null,
      input.projectBudget ? `Estimated Project Budget: ${input.projectBudget}` : null,
      input.projectLocation?.trim() ? `Project Location: ${input.projectLocation.trim()}` : null,
      `\n--- Message Details ---`,
      input.message.trim()
    ]
      .filter(Boolean)
      .join("\n");

    const admin = createAdminClient();

    const { error } = await admin.from("inquiries").insert({
      name: input.name.trim(),
      email: input.email.trim().toLowerCase(),
      subject: input.subject.trim(),
      message: formattedMessage,
      status: "new",
    });

    if (error) {
      console.error("submitContactInquiry insert error:", error.message);
      return { success: false, error: "Failed to submit inquiry. Please try again." };
    }

    return { success: true, error: null };
  } catch (err) {
    console.error("submitContactInquiry unexpected error:", err);
    return { success: false, error: "An unexpected error occurred. Please try again." };
  }
}
