import type { Metadata } from "next";
import { getProducts } from "@/app/actions/products";
import { WallPanelCenter } from "./WallPanelCenter";

export const metadata: Metadata = {
  title: "Wall Panel Center",
  description: "Browse wall panel systems from Cargoplus sellers and use them in your building design.",
};

export default async function WallPanelsPage({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string }>;
}) {
  const params = await searchParams;
  const returnTo = params.returnTo?.startsWith("/") ? params.returnTo : "/building-designer";
  const result = await getProducts({ categorySlug: "wall-panels", limit: 100 });

  return <WallPanelCenter products={result.data ?? []} returnTo={returnTo} />;
}
