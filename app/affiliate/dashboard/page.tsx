import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAffiliateDashboardData } from "@/app/actions/affiliate";
import { AffiliateDashboardClient } from "./AffiliateDashboardClient";

export const metadata: Metadata = {
  title: "Affiliate Partner Dashboard | Apex",
  description: "Track your sales referrals, discount codes, payouts, and marketing resources.",
};

export const dynamic = "force-dynamic";

export default async function AffiliateDashboardPage() {
  const { profile, error } = await getAffiliateDashboardData();

  if (error || !profile) {
    redirect("/affiliate/login");
  }

  return <AffiliateDashboardClient initialProfile={profile} />;
}
