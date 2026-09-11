import type { Metadata } from "next"
import { getProducts } from "@/app/actions/products"
import { DoorCenter } from "./DoorCenter"

export const metadata: Metadata = {
  title: "Door Center",
  description: "Browse seller-listed doors and import one into the building designer.",
}

export default async function DoorsPage({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string }>
}) {
  const params = await searchParams
  const returnTo = params.returnTo?.startsWith("/") ? params.returnTo : "/building-designer"
  const result = await getProducts({ categorySlug: "exterior-doors", limit: 100 })

  return <DoorCenter products={result.data ?? []} returnTo={returnTo} />
}
