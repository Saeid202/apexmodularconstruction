import { redirect } from "next/navigation";
import { getSellerProfile } from "@/app/actions/seller";
import { getSellerOrderRequests } from "@/app/actions/order-requests";
import { SellerOrdersClient } from "./SellerOrdersClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function SellerOrdersPage() {
  const profileResult = await getSellerProfile();
  
  if (!profileResult.data && profileResult.error === "Not authenticated") {
    redirect("/seller/login");
  }

  const userId = profileResult.data?.id;
  const requestsResult = await getSellerOrderRequests(userId);
  const { data: requests, error } = requestsResult;

  return <SellerOrdersClient requests={requests ?? []} fetchError={error} />;
}
