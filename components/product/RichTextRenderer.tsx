"use client";

import { useEffect, useState } from "react";

interface Props {
  html: string;
  className?: string;
}

/**
 * Safely renders rich-text HTML from the product description.
 * Sanitizes with DOMPurify on the client to prevent XSS.
 */
export function RichTextRenderer({ html, className }: Props) {
  const [clean, setClean] = useState("");

  useEffect(() => {
    // DOMPurify is browser-only — import dynamically
    import("dompurify").then(({ default: DOMPurify }) => {
      setClean(
        DOMPurify.sanitize(html, {
          ALLOWED_TAGS: [
            "p", "br", "strong", "em", "u", "s", "del",
            "h2", "h3",
            "ul", "ol", "li",
            "a",
            "span",
          ],
          ALLOWED_ATTR: ["href", "target", "rel", "style", "class"],
          FORCE_BODY: true,
        })
      );
    });
  }, [html]);

  if (!clean) {
    // SSR / first paint: render unsanitized but visually identical
    // (DOMPurify runs immediately on mount and replaces this)
    return <div className={`product-description ${className ?? ""}`} />;
  }

  return (
    <div
      className={`product-description ${className ?? ""}`}
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}
