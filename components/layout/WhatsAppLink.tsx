"use client";
import { MessageSquare } from "lucide-react";

const WA_NUMBER = "14168825015";
const DEFAULT_TEXT = "Hi Apex Modular Construction, I have a question.";

export function WhatsAppLink({ className, style, children, text = DEFAULT_TEXT }: {
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
  text?: string;
}) {
  const encodedText = encodeURIComponent(text);
  
  function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    window.location.href = `whatsapp://send?phone=${WA_NUMBER}&text=${encodedText}`;
    setTimeout(() => {
      window.open(`https://wa.me/${WA_NUMBER}?text=${encodedText}`, "_blank");
    }, 1000);
  }

  return (
    <a
      href={`whatsapp://send?phone=${WA_NUMBER}&text=${encodedText}`}
      onClick={handleClick}
      aria-label="Chat with us on WhatsApp"
      className={className}
      style={style}
    >
      {children}
    </a>
  );
}
