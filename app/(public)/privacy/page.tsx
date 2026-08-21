import { Metadata } from "next";
import { createServerClient } from "@/lib/supabase/server";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for Apex Modular Construction. Learn how we collect, use, and protect your personal information in compliance with PIPEDA.",
};

export default async function PrivacyPage() {
  let cmsContent: string | null = null;
  try {
    const supabase = await createServerClient();
    const { data } = await supabase
      .from("page_contents" as any)
      .select("content")
      .eq("slug", "privacy")
      .single();
    const row = data as { content: string } | null;
    if (row?.content && row.content.trim() !== "" && row.content !== "<p></p>") {
      cmsContent = row.content;
    }
  } catch { /* fall through */ }

  if (cmsContent) {
    return (
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
        <div className="prose prose-lg max-w-3xl" dangerouslySetInnerHTML={{ __html: cmsContent }} />
      </div>
    );
  }

  return PrivacyPageStatic();
}

function PrivacyPageStatic() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
      <p className="text-muted-foreground mb-8">Last updated: January 2025</p>

      <div className="prose prose-lg max-w-3xl">
        <h2>1. Introduction</h2>
        <p>
          Apex Modular Construction (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our services. We comply with the Personal Information Protection and Electronic Documents Act (PIPEDA) and applicable provincial privacy laws.
        </p>

        <h2>2. Information We Collect</h2>
        <h3>Personal Information</h3>
        <p>We may collect the following personal information:</p>
        <ul>
          <li><strong>Account Information:</strong> Name, email address, phone number, company name</li>
          <li><strong>Shipping Information:</strong> Delivery address, postal code, province</li>
          <li><strong>Payment Information:</strong> Credit card details (processed securely via Stripe), billing address</li>
          <li><strong>Order History:</strong> Products purchased, order dates, order values</li>
          <li><strong>Communication Data:</strong> Messages sent through our contact form or customer support</li>
        </ul>

        <h3>Automatically Collected Information</h3>
        <ul>
          <li>IP address and browser type</li>
          <li>Device information and operating system</li>
          <li>Pages visited and time spent on our website</li>
          <li>Referring website addresses</li>
          <li>Cookies and similar tracking technologies</li>
        </ul>

        <h2>3. How We Use Your Information</h2>
        <p>We use your personal information to:</p>
        <ul>
          <li>Process and fulfill your orders</li>
          <li>Communicate with you about your orders and account</li>
          <li>Send promotional emails (with your consent)</li>
          <li>Improve our website and services</li>
          <li>Prevent fraud and enhance security</li>
          <li>Comply with legal obligations</li>
          <li>Calculate applicable taxes (HST/GST) based on your province</li>
        </ul>

        <h2>4. Information Sharing</h2>
        <p>We may share your information with:</p>
        <ul>
          <li><strong>Sellers:</strong> To fulfill your orders, sellers receive your shipping address and order details</li>
          <li><strong>Payment Processors:</strong> Stripe processes your payments securely</li>
          <li><strong>Shipping Partners:</strong> Logistics companies for delivery</li>
          <li><strong>Service Providers:</strong> Third parties who assist in operating our website</li>
          <li><strong>Legal Authorities:</strong> When required by law or to protect our rights</li>
        </ul>
        <p>We do not sell your personal information to third parties.</p>

        <h2>5. Cookies and Tracking</h2>
        <p>We use cookies and similar technologies to:</p>
        <ul>
          <li>Remember your preferences and login status</li>
          <li>Understand how you use our website</li>
          <li>Personalize your experience</li>
          <li>Enable shopping cart functionality</li>
        </ul>
        <p>You can control cookies through your browser settings. Disabling cookies may affect website functionality.</p>

        <h2>6. Data Security</h2>
        <p>
          We implement appropriate technical and organizational measures to protect your personal information, including:
        </p>
        <ul>
          <li>SSL/TLS encryption for data transmission</li>
          <li>Secure data storage with encryption at rest</li>
          <li>Regular security assessments</li>
          <li>Access controls and authentication</li>
        </ul>
        <p>
          However, no method of transmission over the internet is 100% secure. We cannot guarantee absolute security.
        </p>

        <h2>7. Data Retention</h2>
        <p>
          We retain your personal information for as long as necessary to:
        </p>
        <ul>
          <li>Provide our services to you</li>
          <li>Comply with legal obligations (tax records for 7 years)</li>
          <li>Resolve disputes and enforce agreements</li>
        </ul>
        <p>
          You can request deletion of your account, though some data may be retained for legal compliance.
        </p>

        <h2>8. Your Rights</h2>
        <p>Under PIPEDA, you have the right to:</p>
        <ul>
          <li><strong>Access:</strong> Request a copy of your personal information</li>
          <li><strong>Correction:</strong> Request correction of inaccurate information</li>
          <li><strong>Withdrawal:</strong> Withdraw consent for marketing communications</li>
          <li><strong>Complaint:</strong> File a complaint with the Privacy Commissioner of Canada</li>
        </ul>

        <h2>9. Third-Party Links</h2>
        <p>
          Our website may contain links to third-party websites. We are not responsible for the privacy practices of these sites. We encourage you to read their privacy policies.
        </p>

        <h2>10. Children&apos;s Privacy</h2>
        <p>
          Our services are not intended for individuals under 18 years of age. We do not knowingly collect personal information from children.
        </p>

        <h2>11. Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy periodically. Changes will be posted on this page with an updated revision date. Continued use of our services constitutes acceptance of changes.
        </p>

        <h2>12. Contact Us</h2>
        <p>
          For privacy-related inquiries or to exercise your rights, contact our Privacy Officer:
        </p>
        <ul>
          <li>Email: privacy@cargoplus.ca</li>
          <li>Phone: +1-888-CARGOPLUS</li>
          <li>Address: 123 Commerce Street, Toronto, Ontario M5V 1A1, Canada</li>
        </ul>
        <p>
          If you are not satisfied with our response, you may contact the Office of the Privacy Commissioner of Canada at <a href="https://www.priv.gc.ca" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">www.priv.gc.ca</a>.
        </p>
      </div>
    </div>
  );
}
