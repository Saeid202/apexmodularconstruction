import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSellerDashboardData } from "@/app/actions/seller";
import { Package, ShoppingBag, ClipboardList, UserCircle, ArrowRight, Clock, AlertCircle } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = { title: "Seller Dashboard | Apex Modular Construction" };

const PURPLE = "#4B1D8F";
const GOLD = "#D4AF37";

export default async function SellerDashboardPage() {
  let profile: any = null;
  let error: string | null = null;

  try {
    const result = await getSellerDashboardData();
    profile = result.profile;
    error = result.error;
  } catch {
    error = "Failed to load";
  }

  if (!profile && !error) redirect("/seller/login");

  const quickLinks = [
    { href: "/seller/products",     icon: Package,       label: "My Products",  description: "Manage your listings" },
    { href: "/seller/products/new", icon: ShoppingBag,   label: "Add Product",  description: "List a new item" },
    { href: "/seller/orders",       icon: ClipboardList, label: "Orders",       description: "Track your orders" },
    { href: "/seller/profile",      icon: UserCircle,    label: "Profile",      description: "Edit business info" },
  ];

  return (
    <div className="min-h-full flex flex-col">

      {/* ── Hero ── */}
      <div className="relative overflow-hidden" style={{ minHeight: 340 }}>
        {/* Background image */}
        <img
          src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1400&q=80"
          alt="Warehouse"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Overlay */}
        <div
          className="absolute inset-0"
          style={{ background: `linear-gradient(135deg, ${PURPLE}ee 0%, #1a0a3c99 60%, transparent 100%)` }}
        />

        {/* Corner frames */}
        <span className="absolute top-5 left-5 h-7 w-7 border-t-2 border-l-2 border-yellow-400 rounded-tl-md z-10" />
        <span className="absolute top-5 right-5 h-7 w-7 border-t-2 border-r-2 border-yellow-400 rounded-tr-md z-10" />
        <span className="absolute bottom-5 left-5 h-7 w-7 border-b-2 border-l-2 border-yellow-400 rounded-bl-md z-10" />
        <span className="absolute bottom-5 right-5 h-7 w-7 border-b-2 border-r-2 border-yellow-400 rounded-br-md z-10" />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-8 py-16">
          <p
            className="text-xs font-bold uppercase tracking-[0.35em] mb-3 opacity-90"
            style={{ color: GOLD }}
          >
            Seller Centre
          </p>
          <h1
            className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-lg"
            style={{
              color: GOLD,
              fontFamily: "Georgia, 'Times New Roman', serif",
              textShadow: "0 2px 16px rgba(212,175,55,0.5)",
            }}
          >
            Shanghai Apex Modular Construction
          </h1>
          <p className="text-white/80 text-base max-w-md leading-relaxed">
            Welcome back,{" "}
            <span className="text-white font-semibold">
              {profile?.business_name || "Seller"}
            </span>
            . Your global marketplace is ready.
          </p>
        </div>
      </div>

      {/* ── Status banners ── */}
      <div className="px-6 pt-5 space-y-3">
        {profile?.status === "pending" && (
          <div className="flex items-start gap-3 p-4 rounded-xl border" style={{ backgroundColor: "#fef9c3", borderColor: "#fde047" }}>
            <Clock className="h-5 w-5 text-yellow-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-yellow-800 text-sm">Account Pending Approval</p>
              <p className="text-xs text-yellow-700 mt-0.5">Your account is under review. Products won't be visible until approved.</p>
            </div>
          </div>
        )}
        {profile?.status === "suspended" && (
          <div className="flex items-start gap-3 p-4 rounded-xl border border-red-200" style={{ backgroundColor: "#fef2f2" }}>
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-red-800 text-sm">Account Suspended</p>
              <p className="text-xs text-red-700 mt-0.5">Contact support for more information.</p>
            </div>
          </div>
        )}
      </div>

      {/* ── Quick access grid ── */}
      <div className="px-6 pt-5 pb-8">
        <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: PURPLE }}>
          Quick Access
        </p>
        <div className="grid grid-cols-2 gap-4">
          {quickLinks.map(({ href, icon: Icon, label, description }) => (
            <Link
              key={href}
              href={href}
              className="group flex flex-col gap-3 p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
            >
              <div
                className="flex h-11 w-11 items-center justify-center rounded-xl"
                style={{ backgroundColor: "#EDE9F6" }}
              >
                <Icon className="h-5 w-5" style={{ color: PURPLE }} />
              </div>
              <div>
                <p className="font-bold text-sm text-gray-900">{label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{description}</p>
              </div>
              <ArrowRight
                className="h-4 w-4 mt-auto self-end text-gray-300 group-hover:text-purple-500 transition-colors"
              />
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}
