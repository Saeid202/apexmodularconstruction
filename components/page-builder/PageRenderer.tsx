/**
 * Renders a full PageLayout (array of blocks) into a page body.
 * Used by both the public studio page and the editor's live preview.
 */
import type { PageLayout } from "@/types/page-builder";
import { BlockRenderer } from "./blocks";

export function PageRenderer({
  layout,
  primaryColor = "#10B981",
}: {
  layout: PageLayout;
  primaryColor?: string;
}) {
  return (
    <>
      {layout.map((block) => (
        <BlockRenderer key={block.id} block={block} primaryColor={primaryColor} />
      ))}
    </>
  );
}
