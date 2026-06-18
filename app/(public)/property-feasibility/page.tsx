import { Metadata } from "next";
import { ADUChatbot } from "@/components/adu/ADUChatbot";

export const metadata: Metadata = {
  title: "Property Feasibility Analysis | Apex",
  description: "Analyze your property's zoning, permits, and feasibility for modular construction. Get a detailed report with recommendations.",
};

export default function PropertyFeasibilityPage() {
  return <ADUChatbot />;
}
