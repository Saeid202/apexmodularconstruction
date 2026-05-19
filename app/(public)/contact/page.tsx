import { Metadata } from "next";
import { ContactForm } from "./ContactForm";
import { createServerClient } from "@/lib/supabase/server";
import { WhatsAppLink } from "@/components/layout/WhatsAppLink";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with Apex Modular Construction. We're here to help with your construction materials and robot sourcing needs.",
};

export default async function ContactPage() {
  let cmsContent: string | null = null;
  try {
    const supabase = await createServerClient();
    const { data } = await supabase
      .from("page_contents" as any)
      .select("content")
      .eq("slug", "contact")
      .single();
    const row = data as { content: string } | null;
    if (row?.content && row.content.trim() !== "" && row.content !== "<p></p>") {
      cmsContent = row.content;
    }
  } catch { /* fall through */ }

  if (cmsContent) {
    return (
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8">Contact Us</h1>
        <div className="prose prose-lg max-w-3xl" dangerouslySetInnerHTML={{ __html: cmsContent }} />
      </div>
    );
  }

  // Static fallback
  return ContactPageStatic();
}

function ContactPageStatic() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
      <p className="text-muted-foreground mb-8 max-w-2xl">
        Have questions about our products, shipping, or bulk orders? Fill out the form below and our team will get back to you within 24 hours.
      </p>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Contact Form */}
        <div>
          <ContactForm />
        </div>

        {/* Contact Info */}
        <div className="space-y-8">
          <div>
            <h2 className="font-semibold mb-2">Address</h2>
            <p className="text-muted-foreground">
              9131 Keele Street<br />
              Vaughan, Ontario, L4K 0G7<br />
              Canada
            </p>
          </div>

          <div>
            <h2 className="font-semibold mb-2">Phone</h2>
            <p className="text-muted-foreground">
              <a href="tel:+14168825015" className="hover:text-primary">
                +1 416 882 5015
              </a>
            </p>
          </div>

          <div>
            <h2 className="font-semibold mb-2">Email</h2>
            <p className="text-muted-foreground">
              <a href="mailto:info@cargoplus.site" className="hover:text-primary">
                info@cargoplus.site
              </a>
            </p>
          </div>

          <div>
            <h2 className="font-semibold mb-2">Business Hours</h2>
            <p className="text-muted-foreground">
              Monday - Friday: 9:00 AM - 6:00 PM EST<br />
              Saturday: 10:00 AM - 4:00 PM EST<br />
              Sunday: Closed
            </p>
          </div>

          <div>
            <h2 className="font-semibold mb-2">WhatsApp</h2>
            <p className="text-muted-foreground mb-3">
              For quick responses, message us directly on WhatsApp:
            </p>
            <WhatsAppLink
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-white text-sm font-semibold transition-colors"
              style={{ backgroundColor: '#25D366' }}
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Chat on WhatsApp
            </WhatsAppLink>
          </div>
        </div>
      </div>
    </div>
  );
}
