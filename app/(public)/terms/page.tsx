import { Metadata } from "next";
import { createServerClient } from "@/lib/supabase/server";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of Service for Apex Modular Construction e-commerce platform. Read our terms and conditions for using our services.",
};

export default async function TermsPage() {
  let cmsContent: string | null = null;
  try {
    const supabase = await createServerClient();
    const { data } = await supabase
      .from("page_contents" as any)
      .select("content")
      .eq("slug", "terms")
      .single();
    const row = data as { content: string } | null;
    if (row?.content && row.content.trim() !== "" && row.content !== "<p></p>") {
      cmsContent = row.content;
    }
  } catch { /* fall through */ }

  if (cmsContent) {
    return (
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
        <div className="prose prose-lg max-w-3xl" dangerouslySetInnerHTML={{ __html: cmsContent }} />
      </div>
    );
  }

  return TermsPageStatic();
}

function TermsPageStatic() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
      <p className="text-muted-foreground mb-8">Last updated: January 2025</p>

      <div className="prose prose-lg max-w-3xl">
        <h2>1. Acceptance of Terms</h2>
        <p>
          By accessing and using the Apex Modular Construction website and services, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
        </p>

        <h2>2. Description of Service</h2>
        <p>
          Apex Modular Construction is an e-commerce marketplace that connects Canadian customers with Chinese suppliers of construction materials and industrial robots. We facilitate the purchase, shipping, and delivery of products from verified sellers to customers in Canada.
        </p>

        <h2>3. User Accounts</h2>
        <p>
          To access certain features of our platform, you may be required to create an account. You are responsible for:
        </p>
        <ul>
          <li>Providing accurate and complete registration information</li>
          <li>Maintaining the confidentiality of your account credentials</li>
          <li>All activities that occur under your account</li>
          <li>Notifying us immediately of any unauthorized use of your account</li>
        </ul>

        <h2>4. Orders and Payments</h2>
        <p>
          All orders are subject to acceptance and availability. We reserve the right to refuse or cancel any order for any reason. Prices are displayed in Canadian Dollars (CAD) and include applicable taxes (HST/GST) calculated based on your shipping province.
        </p>
        <p>
          Payment methods accepted include credit cards processed through Stripe and bank transfers for large orders. Payment must be received before orders are processed for shipping.
        </p>

        <h2>5. Shipping and Delivery</h2>
        <p>
          Products are shipped from China to Canada. Delivery times vary based on product availability and shipping method. Estimated delivery times are provided at checkout but are not guaranteed. Risk of loss passes to you upon delivery to the carrier.
        </p>

        <h2>6. Returns and Refunds</h2>
        <p>
          Due to the nature of imported construction materials and industrial equipment, returns are accepted only for:
        </p>
        <ul>
          <li>Defective products received</li>
          <li>Products that do not match the order description</li>
          <li>Damaged products (must be reported within 48 hours of delivery)</li>
        </ul>
        <p>
          Refund requests must be submitted within 14 days of receiving your order. Shipping costs for returns are the responsibility of the customer unless the return is due to our error.
        </p>

        <h2>7. Product Information</h2>
        <p>
          We strive to provide accurate product descriptions, images, and specifications. However, we do not warrant that product descriptions or other content is accurate, complete, or error-free. Actual products may vary slightly from images shown.
        </p>

        <h2>8. Seller Conduct</h2>
        <p>
          Sellers on our platform must:
        </p>
        <ul>
          <li>Provide accurate product information and pricing</li>
          <li>Maintain adequate inventory levels</li>
          <li>Ship products within stated timeframes</li>
          <li>Comply with all applicable Canadian regulations</li>
          <li>Respond to customer inquiries within 48 hours</li>
        </ul>

        <h2>9. Intellectual Property</h2>
        <p>
          All content on the Apex Modular Construction website, including text, graphics, logos, and software, is the property of Apex Modular Construction or its content suppliers and is protected by Canadian and international copyright laws.
        </p>

        <h2>10. Limitation of Liability</h2>
        <p>
          Apex Modular Construction shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of our services. Our total liability shall not exceed the amount paid by you for the specific product or service giving rise to the claim.
        </p>

        <h2>11. Governing Law</h2>
        <p>
          These Terms of Service shall be governed by and construed in accordance with the laws of the Province of Ontario and the federal laws of Canada. Any disputes shall be resolved in the courts of Toronto, Ontario.
        </p>

        <h2>12. Changes to Terms</h2>
        <p>
          We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting to our website. Your continued use of our services after changes constitutes acceptance of the modified terms.
        </p>

        <h2>13. Contact Information</h2>
        <p>
          For questions about these Terms of Service, please contact us at:
        </p>
        <ul>
          <li>Email: legal@cargoplus.ca</li>
          <li>Phone: +1-888-CARGOPLUS</li>
          <li>Address: 123 Commerce Street, Toronto, Ontario M5V 1A1, Canada</li>
        </ul>
      </div>
    </div>
  );
}
