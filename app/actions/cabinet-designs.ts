"use server";

import { createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { CabinetUnit } from "@/lib/cabinet-designer/types";

export interface CabinetQuoteRequestInput {
  units: CabinetUnit[];
  countertopId: string;
  totalPrice: number;
  name: string;
  email: string;
  phone?: string;
  message?: string;
}

export interface CabinetQuoteRequestResult {
  success: boolean;
  error: string | null;
  cabinetDesignId?: string;
}

function summarizeUnits(units: CabinetUnit[]): string {
  return units
    .map((unit, index) => `${index + 1}. ${unit.type} · ${unit.widthInches}"W x ${unit.heightInches}"H x ${unit.depthInches}"D · ${unit.doorCount} door(s), ${unit.doorStyle} style, ${unit.handleStyle} handles`)
    .join("\n");
}

/** Saves the cabinet run configuration and files a quote request lead against it. */
export async function requestCabinetQuote(
  input: CabinetQuoteRequestInput
): Promise<CabinetQuoteRequestResult> {
  try {
    if (!input.name.trim() || !input.email.trim()) {
      return { success: false, error: "Please provide your name and email." };
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(input.email)) {
      return { success: false, error: "Please enter a valid email address." };
    }
    if (!input.units.length) {
      return { success: false, error: "Add at least one cabinet before requesting a quote." };
    }

    const admin = createAdminClient();
    if (!admin) {
      return { success: false, error: "Quote requests are temporarily unavailable. Please try again later." };
    }

    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { data: design, error: designError } = await admin
      .from("cabinet_designs")
      .insert({
        user_id: user?.id ?? null,
        units: input.units,
        countertop_id: input.countertopId,
        total_price: input.totalPrice,
        status: "quoted",
      })
      .select("id")
      .single();

    if (designError || !design) {
      console.error("requestCabinetQuote design insert error:", designError?.message);
      return { success: false, error: "Failed to save your design. Please try again." };
    }

    const formattedMessage = [
      `Estimated Total: $${input.totalPrice.toLocaleString("en-CA")} CAD`,
      input.phone?.trim() ? `Phone: ${input.phone.trim()}` : null,
      `\n--- Cabinet Run (${input.units.length} unit${input.units.length === 1 ? "" : "s"}) ---`,
      summarizeUnits(input.units),
      input.message?.trim() ? `\n--- Notes ---\n${input.message.trim()}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    const { error: inquiryError } = await admin.from("inquiries").insert({
      name: input.name.trim(),
      email: input.email.trim().toLowerCase(),
      subject: "Cabinet Design Quote Request",
      message: formattedMessage,
      status: "new",
      cabinet_design_id: design.id,
    });

    if (inquiryError) {
      console.error("requestCabinetQuote inquiry insert error:", inquiryError.message);
      return { success: false, error: "Design saved, but the quote request failed to send. Please try again." };
    }

    return { success: true, error: null, cabinetDesignId: design.id };
  } catch (err) {
    console.error("requestCabinetQuote unexpected error:", err);
    return { success: false, error: "An unexpected error occurred. Please try again." };
  }
}
