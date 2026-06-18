import { getSellerProfile } from "@/app/actions/seller";
import { SellerProfileClient } from "./SellerProfileClient";

export const dynamic = 'force-dynamic';

export default async function SellerProfilePage() {
  const { data: profile } = await getSellerProfile();

  return (
    <SellerProfileClient
      initialProfile={{
        businessName: profile?.business_name ?? "",
        email: profile?.business_email ?? "",
        phone: profile?.business_phone ?? "",
        address: profile?.business_address ?? "",
        description: profile?.description ?? "",
      }}
    />
  );
}
