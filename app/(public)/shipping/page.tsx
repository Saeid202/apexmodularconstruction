import { Metadata } from "next";
import { createServerClient } from "@/lib/supabase/server";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Shipping Policy",
  description: "Shipping Policy for Apex Modular Construction. Learn about our shipping methods, delivery times, and costs from China to Canada.",
};

export default async function ShippingPage() {
  let cmsContent: string | null = null;
  try {
    const supabase = await createServerClient();
    const { data } = await supabase
      .from("page_contents" as any)
      .select("content")
      .eq("slug", "shipping")
      .single();
    const row = data as { content: string } | null;
    if (row?.content && row.content.trim() !== "" && row.content !== "<p></p>") {
      cmsContent = row.content;
    }
  } catch { /* fall through */ }

  if (cmsContent) {
    return (
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-4">Shipping Policy</h1>
        <div className="prose prose-lg max-w-3xl" dangerouslySetInnerHTML={{ __html: cmsContent }} />
      </div>
    );
  }

  return ShippingPageStatic();
}

function ShippingPageStatic() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-4">Shipping Policy</h1>
      <p className="text-muted-foreground mb-8">Last updated: January 2025</p>

      <div className="prose prose-lg max-w-3xl">
        <h2>1. Shipping Overview</h2>
        <p>
          Apex Modular Construction ships construction materials and industrial robots from verified Chinese suppliers to customers across Canada. We partner with reliable international logistics providers to ensure your products arrive safely and on time.
        </p>

        <h2>2. Shipping Methods</h2>
        <h3>Standard Shipping (Sea Freight)</h3>
        <ul>
          <li><strong>Delivery Time:</strong> 30-45 business days</li>
          <li><strong>Cost:</strong> Calculated based on weight and dimensions</li>
          <li><strong>Best For:</strong> Large orders, heavy construction materials, non-urgent orders</li>
          <li><strong>Tracking:</strong> Available at major checkpoints</li>
        </ul>

        <h3>Express Shipping (Air Freight)</h3>
        <ul>
          <li><strong>Delivery Time:</strong> 7-14 business days</li>
          <li><strong>Cost:</strong> Premium rates apply</li>
          <li><strong>Best For:</strong> Urgent orders, smaller items, spare parts</li>
          <li><strong>Tracking:</strong> Full tracking from dispatch to delivery</li>
        </ul>

        <h3>Rail Freight (Available for Select Routes)</h3>
        <ul>
          <li><strong>Delivery Time:</strong> 18-25 business days</li>
          <li><strong>Cost:</strong> Mid-range pricing</li>
          <li><strong>Best For:</strong> Medium-sized orders, balance of speed and cost</li>
        </ul>

        <h2>3. Shipping Zones</h2>
        <p>We currently ship to all Canadian provinces and territories:</p>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-border">
            <thead>
              <tr className="bg-muted">
                <th className="border border-border px-4 py-2 text-left">Region</th>
                <th className="border border-border px-4 py-2 text-left">Provinces</th>
                <th className="border border-border px-4 py-2 text-left">Additional Transit</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-border px-4 py-2">Central Canada</td>
                <td className="border border-border px-4 py-2">Ontario, Quebec</td>
                <td className="border border-border px-4 py-2">+0 days</td>
              </tr>
              <tr className="bg-muted/50">
                <td className="border border-border px-4 py-2">Western Canada</td>
                <td className="border border-border px-4 py-2">BC, Alberta, Saskatchewan, Manitoba</td>
                <td className="border border-border px-4 py-2">+2-5 days</td>
              </tr>
              <tr>
                <td className="border border-border px-4 py-2">Atlantic Canada</td>
                <td className="border border-border px-4 py-2">NS, NB, PEI, NL</td>
                <td className="border border-border px-4 py-2">+3-5 days</td>
              </tr>
              <tr className="bg-muted/50">
                <td className="border border-border px-4 py-2">Northern Canada</td>
                <td className="border border-border px-4 py-2">YT, NT, NU</td>
                <td className="border border-border px-4 py-2">+7-14 days</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2>4. Shipping Costs</h2>
        <p>Shipping costs are calculated at checkout based on:</p>
        <ul>
          <li><strong>Weight:</strong> Total weight of all items in your order</li>
          <li><strong>Dimensions:</strong> Volume for large or bulky items</li>
          <li><strong>Destination:</strong> Shipping address postal code</li>
          <li><strong>Method:</strong> Standard, Express, or Rail freight</li>
        </ul>
        <p>
          Free shipping is available for orders over $5,000 CAD (standard shipping only, excludes Northern Canada).
        </p>

        <h2>5. Order Processing</h2>
        <ul>
          <li><strong>Processing Time:</strong> 2-5 business days after payment confirmation</li>
          <li><strong>Quality Check:</strong> Products are inspected before shipping</li>
          <li><strong>Documentation:</strong> Commercial invoice, packing list, and customs documents prepared</li>
          <li><strong>Notification:</strong> Email confirmation with tracking number once shipped</li>
        </ul>

        <h2>6. Customs and Duties</h2>
        <p>
          All products shipped from China to Canada are subject to customs clearance. Apex Modular Construction handles:
        </p>
        <ul>
          <li>Import documentation and customs declarations</li>
          <li>Payment of applicable duties and taxes (included in product pricing)</li>
          <li>Compliance with Canadian import regulations</li>
        </ul>
        <p>
          <strong>Note:</strong> Certain products may require additional certifications (CSA, UL) for electrical equipment. We ensure all products meet Canadian standards before shipping.
        </p>

        <h2>7. Tracking Your Order</h2>
        <p>
          Once your order ships, you will receive:
        </p>
        <ul>
          <li>Email notification with tracking number</li>
          <li>Link to track your shipment online</li>
          <li>Updates at major shipping milestones</li>
        </ul>
        <p>
          Track your order anytime by logging into your account and visiting the Orders section.
        </p>

        <h2>8. Delivery</h2>
        <ul>
          <li><strong>Signature Required:</strong> For orders over $500 CAD</li>
          <li><strong>Delivery Attempts:</strong> Carrier will attempt delivery 3 times</li>
          <li><strong>Safe Drop:</strong> Available for orders under $200 CAD at your request</li>
          <li><strong>Pickup:</strong> Option to pick up from carrier depot if preferred</li>
        </ul>

        <h2>9. Damaged or Lost Shipments</h2>
        <p>
          If your shipment arrives damaged:
        </p>
        <ul>
          <li>Document the damage with photos before opening</li>
          <li>Report to us within 48 hours of delivery</li>
          <li>Keep all packaging for inspection</li>
          <li>We will file a claim and arrange replacement or refund</li>
        </ul>
        <p>
          For lost shipments, we will investigate with the carrier and provide a full refund or replacement after 60 days from the expected delivery date.
        </p>

        <h2>10. Shipping Restrictions</h2>
        <p>
          We cannot ship to:
        </p>
        <ul>
          <li>PO Boxes (physical address required)</li>
          <li>Forwarding addresses</li>
          <li>Addresses outside Canada</li>
        </ul>
        <p>
          Some products may have additional shipping restrictions due to size, weight, or hazardous materials classification.
        </p>

        <h2>11. Contact Us</h2>
        <p>
          For shipping inquiries, contact our logistics team:
        </p>
        <ul>
          <li>Email: shipping@cargoplus.ca</li>
          <li>Phone: +1-888-CARGOPLUS</li>
          <li>Hours: Monday - Friday, 9:00 AM - 6:00 PM EST</li>
        </ul>
      </div>
    </div>
  );
}
