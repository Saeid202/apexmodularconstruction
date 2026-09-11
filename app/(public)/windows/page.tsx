import type { Metadata } from "next"
import { getProducts } from "@/app/actions/products"
import { WindowCenter } from "./WindowCenter"

export const metadata: Metadata = {
  title: "Window Center",
  description: "Browse seller-listed windows and import one into the building designer.",
}

export default async function WindowsPage({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string }>
}) {
  const params = await searchParams
  const returnTo = params.returnTo?.startsWith("/") ? params.returnTo : "/building-designer"
  const result = await getProducts({ categorySlug: "windows", limit: 100 })

  return <WindowCenter products={result.data ?? []} returnTo={returnTo} />
}
