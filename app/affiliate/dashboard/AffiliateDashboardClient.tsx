"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  DollarSign,
  Briefcase,
  Copy,
  Check,
  TrendingUp,
  Tag,
  Coins,
  ArrowRight,
  Download,
  Users,
  AlertCircle,
  FileText,
  Video,
  Image,
  ChevronRight,
  Clock,
  User,
  Settings as SettingsIcon,
  CreditCard,
  CheckCircle2,
  Menu,
  X,
  LayoutDashboard,
  Link2,
  FolderOpen,
  Sparkles,
  BookOpen,
  ShoppingBag,
  Package,
  ExternalLink
} from "lucide-react";
import {
  updateAffiliateProfile,
  getAffiliateCommissions,
  requestAffiliatePayout,
  getAffiliateProducts,
  type AffiliateProduct
} from "@/app/actions/affiliate";
import { LogoutButton } from "../LogoutButton";

interface AffiliateDashboardClientProps {
  initialProfile: any;
}

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "products", label: "Product Library", icon: BookOpen },
  { id: "links", label: "My Referral Links", icon: Link2 },
  { id: "leads", label: "My Leads", icon: Users },
  { id: "orders", label: "Orders", icon: ShoppingBag },
  { id: "commissions", label: "Commissions", icon: Coins },
  { id: "marketing", label: "Marketing Assets", icon: FolderOpen },
  { id: "payouts", label: "Payouts", icon: CreditCard },
  { id: "settings", label: "Settings", icon: SettingsIcon },
];

export function AffiliateDashboardClient({ initialProfile }: AffiliateDashboardClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [profile, setProfile] = useState(initialProfile);
  const [commissions, setCommissions] = useState<any[]>([]);
  const [loadingCommissions, setLoadingCommissions] = useState(false);

  // Product Library states
  const [products, setProducts] = useState<AffiliateProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<AffiliateProduct | null>(null);

  // Copy states
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCoupon, setCopiedCoupon] = useState(false);

  // Profile Edit states
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [companyName, setCompanyName] = useState(profile?.company_name || "");
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Payout states
  const [payoutAmount, setPayoutAmount] = useState("");
  const [payoutMethod, setPayoutMethod] = useState("Bank Transfer");
  const [submittingPayout, setSubmittingPayout] = useState(false);
  const [payoutMessage, setPayoutMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Custom link builder state
  const [customPath, setCustomPath] = useState("/shop");
  const [generatedCustomLink, setGeneratedCustomLink] = useState("");
  const [referralLink, setReferralLink] = useState("");

  // Set referral link on client mount/profile change
  useEffect(() => {
    if (profile?.referral_code) {
      setReferralLink(`${window.location.origin}/?ref=${profile.referral_code}`);
    }
  }, [profile]);

  // Fetch commissions on mount and when tab changes
  useEffect(() => {
    if (activeTab === "commissions" || activeTab === "dashboard") {
      setLoadingCommissions(true);
      getAffiliateCommissions().then((res) => {
        if (res.commissions) {
          setCommissions(res.commissions);
        }
        setLoadingCommissions(false);
      });
    }
  }, [activeTab]);

  // Fetch affiliate products
  useEffect(() => {
    if (activeTab === "products" || activeTab === "dashboard") {
      setLoadingProducts(true);
      getAffiliateProducts().then((res) => {
        if (res.products) {
          setProducts(res.products);
        }
        setLoadingProducts(false);
      });
    }
  }, [activeTab]);

  // Handle custom link generation
  useEffect(() => {
    if (profile?.referral_code) {
      const origin = window.location.origin;
      const cleanPath = customPath.startsWith("/") ? customPath : `/${customPath}`;
      setGeneratedCustomLink(`${origin}${cleanPath}?ref=${profile.referral_code}`);
    }
  }, [customPath, profile]);

  const handleCopyLink = (text: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      }
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  const handleCopyCoupon = (text: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text);
        setCopiedCoupon(true);
        setTimeout(() => setCopiedCoupon(false), 2000);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        setCopiedCoupon(true);
        setTimeout(() => setCopiedCoupon(false), 2000);
      }
    } catch (err) {
      console.error("Failed to copy coupon:", err);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingProfile(true);
    setProfileMessage(null);

    const res = await updateAffiliateProfile({
      fullName,
      phone: phone || null,
      companyName: companyName || null,
    });

    if (res.success) {
      setProfileMessage({ type: "success", text: "Profile updated successfully!" });
      setProfile({
        ...profile,
        full_name: fullName,
        phone: phone,
        company_name: companyName,
      });
      router.refresh();
    } else {
      setProfileMessage({ type: "error", text: res.error || "Failed to update profile." });
    }
    setUpdatingProfile(false);
  };

  const handlePayoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(payoutAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setPayoutMessage({ type: "error", text: "Please enter a valid payout amount" });
      return;
    }

    if (amountNum > profile.available_balance) {
      setPayoutMessage({ type: "error", text: "Payout amount exceeds available balance" });
      return;
    }

    setSubmittingPayout(true);
    setPayoutMessage(null);

    const res = await requestAffiliatePayout({
      amount: amountNum,
      method: payoutMethod,
    });

    if (res.success) {
      setPayoutMessage({ type: "success", text: "Payout request submitted successfully!" });
      setProfile({
        ...profile,
        available_balance: parseFloat((profile.available_balance - amountNum).toFixed(2)),
      });
      setPayoutAmount("");
      router.refresh();
    } else {
      setPayoutMessage({ type: "error", text: res.error || "Failed to submit payout request." });
    }
    setSubmittingPayout(false);
  };

  // Helper values

  const totalEarned = profile?.total_earned || 0;
  const targetLevelValue = 2500;
  const levelProgress = Math.min((totalEarned / targetLevelValue) * 100, 100);

  return (
    <div className="h-screen flex bg-[#F4F6FA] overflow-hidden">
      {/* ── SIDEBAR NAVIGATION ── */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 flex flex-col transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 bg-[#0F172A] ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between px-5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: "#4B1D8F" }}>
              <Sparkles className="h-4 w-4 text-[#D4AF37]" />
            </div>
            <span className="text-white font-bold text-lg tracking-tight">
              APEX<span style={{ color: "#D4AF37" }}>.</span> PARTNERS
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-300 hover:bg-white/10"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer text-left ${
                  isActive
                    ? "text-white shadow-md shadow-purple-950/20"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                }`}
                style={isActive ? { backgroundColor: "#4B1D8F" } : {}}
              >
                <item.icon className="h-5 w-5 shrink-0" style={isActive ? { color: "#D4AF37" } : {}} />
                <span className="flex-1">{item.label}</span>
                {isActive && <ChevronRight className="h-4 w-4 text-[#D4AF37]" />}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <a
            href="/"
            className="flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors"
          >
            ← Back to Store
          </a>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setSidebarOpen(false)}>
          <div className="fixed inset-0 bg-black/50" />
        </div>
      )}

      {/* ── MAIN CONTENT CONTAINER ── */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-base font-semibold text-gray-800 lg:text-lg capitalize">
              {menuItems.find((i) => i.id === activeTab)?.label ?? "Dashboard"}
            </h1>
          </div>
          <LogoutButton />
        </header>

        <main className="flex-1 overflow-auto bg-[#F4F6FA]">
          <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* ────────────────── OVERVIEW DASHBOARD TAB ────────────────── */}
            {activeTab === "dashboard" && (
              <div className="space-y-6 animate-fade-in">
                {/* Top Banner welcome */}
                <div className="bg-gradient-to-r from-[#4B1D8F] to-[#3a1570] rounded-2xl p-6 md:p-8 text-white shadow-glow relative overflow-hidden flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                  <div className="space-y-2 relative z-10">
                    <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                      Welcome back, {profile?.full_name}!
                    </h2>
                    <p className="text-purple-200 text-sm md:text-base max-w-xl">
                      Track your real-time modular home and component referrals. Build your partner level to earn higher commission rates.
                    </p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10 shrink-0 text-center md:text-left z-10">
                    <span className="text-xs uppercase tracking-widest text-[#D4AF37] font-semibold">Partner Tier</span>
                    <p className="text-xl font-bold">{profile?.partner_level || "Bronze"} Member</p>
                    <p className="text-xs text-purple-200 mt-1">Rank: {profile?.partner_rank || "Newcomer"}</p>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-soft hover:shadow-md transition-shadow relative overflow-hidden group">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Earned</span>
                      <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform">
                        <TrendingUp className="h-5 w-5" />
                      </div>
                    </div>
                    <p className="text-2xl font-extrabold text-gray-900 mt-3">
                      ${profile?.total_earned?.toFixed(2) || "0.00"}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">All-time accumulated earnings</p>
                  </div>

                  <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-soft hover:shadow-md transition-shadow relative overflow-hidden group">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Available Balance</span>
                      <div className="p-2 rounded-lg bg-purple-50 text-[#4B1D8F] group-hover:scale-110 transition-transform">
                        <DollarSign className="h-5 w-5" />
                      </div>
                    </div>
                    <p className="text-2xl font-extrabold text-gray-900 mt-3">
                      ${profile?.available_balance?.toFixed(2) || "0.00"}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-gray-400">Ready for cashout</p>
                      <button
                        onClick={() => setActiveTab("payouts")}
                        className="text-xs font-bold text-[#4B1D8F] hover:underline flex items-center gap-0.5 cursor-pointer"
                      >
                        Withdraw <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-soft hover:shadow-md transition-shadow relative overflow-hidden group">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Sales</span>
                      <div className="p-2 rounded-lg bg-blue-50 text-blue-600 group-hover:scale-110 transition-transform">
                        <Briefcase className="h-5 w-5" />
                      </div>
                    </div>
                    <p className="text-2xl font-extrabold text-gray-900 mt-3">
                      ${profile?.total_sales?.toFixed(2) || "0.00"}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">Referred purchase volume</p>
                  </div>

                  <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-soft hover:shadow-md transition-shadow relative overflow-hidden group">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Orders</span>
                      <div className="p-2 rounded-lg bg-amber-50 text-amber-600 group-hover:scale-110 transition-transform">
                        <Coins className="h-5 w-5" />
                      </div>
                    </div>
                    <p className="text-2xl font-extrabold text-gray-900 mt-3">{profile?.total_orders || 0}</p>
                    <p className="text-xs text-gray-400 mt-2">Successful checkouts tracked</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Col: Referral Tools & Level Info */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Referral Tools Card */}
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-soft space-y-6">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">Your Sharing Arsenal</h3>
                        <p className="text-sm text-gray-500 mt-1">Share these with your audience to track purchases automatically.</p>
                      </div>

                      <div className="space-y-4">
                        {/* Link box */}
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Referral Link</label>
                          <div className="flex items-center justify-between border border-gray-200 rounded-xl p-3 bg-gray-50/50">
                            <span className="text-sm text-gray-800 break-all select-all font-mono mr-3">
                              {referralLink}
                            </span>
                            <button
                              onClick={() => handleCopyLink(referralLink)}
                              className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white transition-all cursor-pointer select-none shrink-0"
                              style={{ backgroundColor: copiedLink ? "#10B981" : "#4B1D8F" }}
                            >
                              {copiedLink ? (
                                <>
                                  <Check className="h-3.5 w-3.5" /> Copied!
                                </>
                              ) : (
                                <>
                                  <Copy className="h-3.5 w-3.5" /> Copy Link
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Coupon box */}
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Coupon Discount Code</label>
                          <div className="flex items-center justify-between border border-gray-200 rounded-xl p-3 bg-gray-50/50">
                            <div>
                              <span className="text-sm font-bold text-gray-800 mr-2 font-mono">
                                {profile?.coupon_code || "APEX-PARTNER"}
                              </span>
                              <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">
                                5% Customer Discount
                              </span>
                            </div>
                            <button
                              onClick={() => handleCopyCoupon(profile?.coupon_code || "APEX-PARTNER")}
                              className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white transition-all cursor-pointer select-none shrink-0"
                              style={{ backgroundColor: copiedCoupon ? "#10B981" : "#4B1D8F" }}
                            >
                              {copiedCoupon ? (
                                <>
                                  <Check className="h-3.5 w-3.5" /> Copied!
                                </>
                              ) : (
                                <>
                                  <Copy className="h-3.5 w-3.5" /> Copy Code
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Commission History Table */}
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-soft">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">Recent Commission Sales</h3>
                          <p className="text-sm text-gray-500 mt-1">Status of your referred customers.</p>
                        </div>
                        <button
                          onClick={() => setActiveTab("commissions")}
                          className="text-sm font-semibold text-[#4B1D8F] hover:underline cursor-pointer"
                        >
                          View All
                        </button>
                      </div>

                      <div className="overflow-x-auto">
                        {loadingCommissions ? (
                          <div className="flex justify-center items-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4B1D8F]" />
                          </div>
                        ) : commissions.length === 0 ? (
                          <div className="text-center py-10 border border-dashed border-gray-200 rounded-xl space-y-2">
                            <Clock className="mx-auto h-8 w-8 text-gray-400" />
                            <p className="text-sm text-gray-500 font-medium">No sales recorded yet</p>
                            <p className="text-xs text-gray-400">Share your referral link to drive checkouts!</p>
                          </div>
                        ) : (
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="border-b border-gray-100 text-xs font-bold text-gray-400 uppercase">
                                <th className="pb-3">Customer</th>
                                <th className="pb-3">Product</th>
                                <th className="pb-3">Sale Amount</th>
                                <th className="pb-3">Commission</th>
                                <th className="pb-3 text-right">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 text-sm">
                              {commissions.slice(0, 5).map((row) => (
                                <tr key={row.id} className="hover:bg-gray-50/50 transition-colors">
                                  <td className="py-3.5 font-medium text-gray-900">{row.customer_name}</td>
                                  <td className="py-3.5 text-gray-500 max-w-[180px] truncate">{row.product_name}</td>
                                  <td className="py-3.5 font-semibold">${row.sale_amount?.toFixed(2)}</td>
                                  <td className="py-3.5 text-[#4B1D8F] font-bold">${row.commission_amount?.toFixed(2)}</td>
                                  <td className="py-3.5 text-right">
                                    <span
                                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                                        row.status === "paid"
                                          ? "bg-green-50 text-green-700 border-green-200"
                                          : row.status === "pending"
                                          ? "bg-amber-50 text-amber-700 border-amber-200"
                                          : "bg-red-50 text-red-700 border-red-200"
                                      }`}
                                    >
                                      {row.status}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Col: Level Progression & Fast Actions */}
                  <div className="space-y-6">
                    {/* Gamified Level Card */}
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-soft space-y-5">
                      <div className="flex items-center justify-between">
                        <h3 className="text-base font-bold text-gray-900">Partner Tier Upgrade</h3>
                        <span className="text-xs font-bold text-[#D4AF37] bg-[#F3EEFB] px-2 py-0.5 rounded-full">
                          {Math.round(levelProgress)}% Complete
                        </span>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500 font-medium">Current: Bronze</span>
                          <span className="text-gray-900 font-semibold">Target: Silver</span>
                        </div>
                        <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${levelProgress}%`,
                              background: "linear-gradient(90deg, #4B1D8F 0%, #D4AF37 100%)"
                            }}
                          />
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          Earn ${targetLevelValue - totalEarned > 0 ? (targetLevelValue - totalEarned).toFixed(0) : 0} more to unlock Silver level benefits (e.g. 8% commission rate).
                        </p>
                      </div>

                      <div className="border-t border-gray-100 pt-4 space-y-2 text-xs">
                        <div className="flex justify-between text-gray-500">
                          <span>Active Commission Rate</span>
                          <span className="font-semibold text-gray-800">5.0% Default</span>
                        </div>
                        <div className="flex justify-between text-gray-500">
                          <span>Rank Eligibility</span>
                          <span className="font-semibold text-gray-800">100% Eligible</span>
                        </div>
                      </div>
                    </div>

                    {/* Resources shortcuts */}
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-soft space-y-4">
                      <h3 className="text-base font-bold text-gray-900">Resources Shortcuts</h3>
                      <div className="space-y-2">
                        <button
                          onClick={() => setActiveTab("marketing")}
                          className="w-full flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:bg-gray-50 text-left text-sm font-medium text-gray-700 transition-colors cursor-pointer"
                        >
                          <span className="flex items-center gap-2">
                            <Image className="h-4 w-4 text-[#4B1D8F]" /> Product Designs
                          </span>
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        </button>
                        <button
                          onClick={() => setActiveTab("marketing")}
                          className="w-full flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:bg-gray-50 text-left text-sm font-medium text-gray-700 transition-colors cursor-pointer"
                        >
                          <span className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-[#4B1D8F]" /> Sales brochures
                          </span>
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ────────────────── PRODUCT LIBRARY TAB ────────────────── */}
            {activeTab === "products" && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Product Library</h2>
                    <p className="text-sm text-gray-500 mt-1">
                      Browse all available modular construction structures and components eligible for affiliate promotion.
                    </p>
                  </div>
                  <div className="bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-xs font-semibold text-gray-600">
                      {products.length} Active Affiliate Products
                    </span>
                  </div>
                </div>

                {loadingProducts ? (
                  <div className="flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#4B1D8F]" />
                  </div>
                ) : products.length === 0 ? (
                  <div className="text-center py-20 border border-dashed border-gray-200 rounded-3xl bg-white space-y-4">
                    <BookOpen className="mx-auto h-12 w-12 text-gray-300" />
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">No products available</h3>
                      <p className="text-sm text-gray-400 mt-1">
                        Sellers haven't enabled affiliate marketing for any products yet.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((product) => {
                      // Calculate exact commission to show
                      let commissionDisplay = "";
                      if (product.affiliate_commission_type === "percentage") {
                        const estimatedAmount = (product.price * product.affiliate_commission_value) / 100;
                        commissionDisplay = `${product.affiliate_commission_value}% (~$${estimatedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} CAD)`;
                      } else {
                        commissionDisplay = `$${product.affiliate_commission_value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} CAD`;
                      }

                      return (
                        <div
                          key={product.id}
                          className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-soft hover:shadow-lg transition-all duration-300 flex flex-col group"
                        >
                          {/* Image Container */}
                          <div className="h-48 w-full bg-gray-100 relative overflow-hidden shrink-0">
                            {product.image_url ? (
                              <img
                                src={product.image_url}
                                alt={product.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-purple-50 text-purple-300">
                                <Package className="h-12 w-12" />
                              </div>
                            )}
                            <div className="absolute top-3 left-3">
                              <span className="bg-[#4B1D8F] text-[#D4AF37] text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
                                {product.category?.name || "Prefab"}
                              </span>
                            </div>
                            <div className="absolute top-3 right-3">
                              <a
                                href={`/products/${product.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-white/95 backdrop-blur-sm text-gray-600 hover:text-[#4B1D8F] h-7 w-7 rounded-full flex items-center justify-center shadow-sm transition-all border border-gray-100 hover:scale-105 cursor-pointer"
                                title="View Product on Website"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                              </a>
                            </div>
                          </div>

                          {/* Content */}
                          <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                            <div className="space-y-2">
                              <h3 className="font-bold text-gray-900 text-base line-clamp-1 group-hover:text-[#4B1D8F] transition-colors">
                                {product.name}
                              </h3>
                              <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed h-8">
                                {product.description || "No description provided."}
                              </p>
                            </div>

                            <div className="pt-3 border-t border-gray-50 flex items-center justify-between">
                              <div>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Price</p>
                                <p className="text-sm font-extrabold text-gray-900">
                                  ${product.price.toLocaleString()} CAD
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">Commission</p>
                                <p className="text-sm font-extrabold text-[#4B1D8F]">
                                  {commissionDisplay}
                                </p>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="grid grid-cols-2 gap-2 pt-2">
                              <button
                                onClick={() => setSelectedProduct(product)}
                                className="h-9 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                              >
                                View Details
                              </button>
                              <button
                                onClick={() => {
                                  setCustomPath(`/products/${product.slug}`);
                                  setActiveTab("links");
                                }}
                                className="h-9 rounded-xl text-xs font-bold text-white transition-all flex items-center justify-center gap-1 cursor-pointer hover:opacity-95 shadow-sm"
                                style={{ backgroundColor: "#4B1D8F" }}
                              >
                                <Link2 className="h-3 w-3 text-[#D4AF37]" /> Create Link
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ────────────────── REFERRAL LINKS TAB ────────────────── */}
            {activeTab === "links" && (
              <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-soft space-y-8 animate-fade-in">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Custom Referral Link Builder</h2>
                  <p className="text-sm text-gray-500 mt-1">Direct referred customers to any page on our catalog, such as product detail pages, rather than only the home page.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Target Page Path
                      </label>
                      <input
                        type="text"
                        value={customPath}
                        onChange={(e) => setCustomPath(e.target.value)}
                        placeholder="/shop/cottage-cabin"
                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#4B1D8F] transition-shadow"
                      />
                      <p className="text-xs text-gray-400 mt-1.5">
                        Enter paths like `/shop`, `/about`, or `/customization`. Keep leading slash.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Generated Tracking URL
                      </label>
                      <div className="flex items-center justify-between border border-gray-200 rounded-xl p-3 bg-gray-50 font-mono text-xs text-gray-800 break-all select-all">
                        {generatedCustomLink}
                      </div>
                    </div>

                    <button
                      onClick={() => handleCopyLink(generatedCustomLink)}
                      className="w-full h-11 flex items-center justify-center gap-1.5 rounded-xl text-white text-sm font-semibold hover:opacity-95 transition-opacity cursor-pointer"
                      style={{ backgroundColor: copiedLink ? "#10B981" : "#4B1D8F" }}
                    >
                      {copiedLink ? (
                        <>
                          <Check className="h-4 w-4" /> Copied custom link!
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" /> Copy Custom Link
                        </>
                      )}
                    </button>
                  </div>

                  <div className="bg-[#F3EEFB] border border-purple-100 rounded-2xl p-6 space-y-4">
                    <h4 className="font-bold text-[#4B1D8F] flex items-center gap-1.5">
                      <AlertCircle className="h-4 w-4" /> How to use custom links
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-600 list-disc list-inside">
                      <li>Drive higher conversion rates by linking directly to modular homes.</li>
                      <li>Share custom links on social posts, YouTube video bios, and blogs.</li>
                      <li>Purchases on custom links are tracked in cookies for up to 30 days.</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* ────────────────── COUPONS TAB ────────────────── */}
            {activeTab === "coupons" && (
              <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-soft space-y-6 animate-fade-in">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Your Coupon Code</h2>
                  <p className="text-sm text-gray-500 mt-1">Customers who checkout using your coupon get an immediate discount, and you earn full commissions.</p>
                </div>

                <div className="max-w-xl border border-gray-200 rounded-2xl p-6 space-y-6 bg-gradient-to-br from-white to-[#F3EEFB]">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-xs uppercase tracking-widest text-[#D4AF37] font-bold">Active Coupon</span>
                      <h3 className="text-2xl font-black font-mono mt-1 text-gray-900">
                        {profile?.coupon_code || "APEX-PARTNER"}
                      </h3>
                    </div>
                    <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200">
                      5% Customer Discount
                    </span>
                  </div>

                  <p className="text-sm text-gray-600">
                    This code provides a 5% discount at checkout on modular cabins and home packages. You will receive credit for the purchase value.
                  </p>

                  <button
                    onClick={() => handleCopyCoupon(profile?.coupon_code || "APEX-PARTNER")}
                    className="w-full h-11 flex items-center justify-center gap-1.5 rounded-xl text-white text-sm font-semibold hover:opacity-95 transition-opacity cursor-pointer"
                    style={{ backgroundColor: copiedCoupon ? "#10B981" : "#4B1D8F" }}
                  >
                    {copiedCoupon ? (
                      <>
                        <Check className="h-4 w-4" /> Copied coupon code!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" /> Copy Coupon Code
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* ────────────────── MY LEADS TAB ────────────────── */}
            {activeTab === "leads" && (
              <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-soft space-y-6 animate-fade-in">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">My Leads Log</h2>
                  <p className="text-sm text-gray-500 mt-1">Track prospective buyers registered with your referral cookie.</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100 text-xs font-bold text-gray-400 uppercase">
                        <th className="pb-3">Date Joined</th>
                        <th className="pb-3">Lead Email</th>
                        <th className="pb-3">Current Status</th>
                        <th className="pb-3 text-right">Referral Source</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-sm">
                      <tr className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-4 text-gray-500 font-mono text-xs">2026-07-28</td>
                        <td className="py-4 font-semibold text-gray-900">john.miller@example.com</td>
                        <td className="py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-green-50 text-green-700 border-green-200">
                            Purchased
                          </span>
                        </td>
                        <td className="py-4 text-right text-gray-500 text-xs">120m² Villa Page</td>
                      </tr>
                      <tr className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-4 text-gray-500 font-mono text-xs">2026-07-29</td>
                        <td className="py-4 font-semibold text-gray-900">alice.smith@outlook.com</td>
                        <td className="py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-amber-50 text-amber-700 border-amber-200">
                            Browsing Catalog
                          </span>
                        </td>
                        <td className="py-4 text-right text-gray-500 text-xs">Home Page Ref</td>
                      </tr>
                      <tr className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-4 text-gray-500 font-mono text-xs">2026-07-29</td>
                        <td className="py-4 font-semibold text-gray-900">david.lee@techcorp.com</td>
                        <td className="py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-purple-50 text-purple-700 border-purple-200">
                            Contacted Sales
                          </span>
                        </td>
                        <td className="py-4 text-right text-gray-500 text-xs">Custom Suite Link</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ────────────────── ORDERS TAB ────────────────── */}
            {activeTab === "orders" && (
              <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-soft space-y-6 animate-fade-in">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Referred Orders</h2>
                  <p className="text-sm text-gray-500 mt-1">Status of checkouts completed by your referred customers.</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100 text-xs font-bold text-gray-400 uppercase">
                        <th className="pb-3">Order ID</th>
                        <th className="pb-3">Product</th>
                        <th className="pb-3">Customer</th>
                        <th className="pb-3">Order Total</th>
                        <th className="pb-3">Commission Status</th>
                        <th className="pb-3 text-right">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-sm">
                      <tr className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-4 font-mono text-xs text-gray-400">ORD-90218</td>
                        <td className="py-4 font-semibold text-gray-900">Elite Modular Cabin A-15</td>
                        <td className="py-4 text-gray-600">John Miller</td>
                        <td className="py-4 font-semibold text-gray-800">$45,000.00</td>
                        <td className="py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-green-50 text-green-700 border-green-200">
                            Approved & Paid
                          </span>
                        </td>
                        <td className="py-4 text-right text-gray-500 text-xs">2026-07-26</td>
                      </tr>
                      <tr className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-4 font-mono text-xs text-gray-400">ORD-89311</td>
                        <td className="py-4 font-semibold text-gray-900">Modern Garden Suite ADU</td>
                        <td className="py-4 text-gray-600">Sarah Jenkins</td>
                        <td className="py-4 font-semibold text-gray-800">$68,000.00</td>
                        <td className="py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-amber-50 text-amber-700 border-amber-200">
                            Pending Validation
                          </span>
                        </td>
                        <td className="py-4 text-right text-gray-500 text-xs">2026-07-28</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ────────────────── ORDERS & COMMISSIONS TAB ────────────────── */}
            {activeTab === "commissions" && (
              <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-soft space-y-6 animate-fade-in">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Full Commissions Log</h2>
                  <p className="text-sm text-gray-500 mt-1">Audit trail of all purchases tracked through your referrals.</p>
                </div>

                <div className="overflow-x-auto">
                  {loadingCommissions ? (
                    <div className="flex justify-center items-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4B1D8F]" />
                    </div>
                  ) : commissions.length === 0 ? (
                    <div className="text-center py-16 space-y-2 border border-dashed border-gray-200 rounded-xl">
                      <Clock className="mx-auto h-10 w-10 text-gray-300" />
                      <p className="text-sm text-gray-500 font-semibold">No commissions found</p>
                      <p className="text-xs text-gray-400">Share links or coupon codes to record referrals.</p>
                    </div>
                  ) : (
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-gray-100 text-xs font-bold text-gray-400 uppercase">
                          <th className="pb-3">Date</th>
                          <th className="pb-3">Customer</th>
                          <th className="pb-3">Product Name</th>
                          <th className="pb-3">Sale Amount</th>
                          <th className="pb-3">Commission Earned</th>
                          <th className="pb-3 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50 text-sm">
                        {commissions.map((row) => (
                          <tr key={row.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="py-4 text-gray-500 font-mono text-xs">
                              {row.created_at ? new Date(row.created_at).toLocaleDateString() : "-"}
                            </td>
                            <td className="py-4 font-semibold text-gray-900">{row.customer_name}</td>
                            <td className="py-4 text-gray-600">{row.product_name}</td>
                            <td className="py-4 font-semibold text-gray-800">${row.sale_amount?.toFixed(2)}</td>
                            <td className="py-4 text-[#4B1D8F] font-extrabold">${row.commission_amount?.toFixed(2)}</td>
                            <td className="py-4 text-right">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                                  row.status === "paid"
                                    ? "bg-green-50 text-green-700 border-green-200"
                                    : row.status === "pending"
                                    ? "bg-amber-50 text-amber-700 border-amber-200"
                                    : "bg-red-50 text-red-700 border-red-200"
                                }`}
                              >
                                {row.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}

            {/* ────────────────── MARKETING ASSETS TAB ────────────────── */}
            {activeTab === "marketing" && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Marketing & Promotion Resources</h2>
                  <p className="text-sm text-gray-500 mt-1">Download high-quality assets to promote Apex Modular Construction packages.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-soft space-y-4 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
                      <Image className="h-6 w-6 text-[#4B1D8F]" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Product Image Assets</h3>
                    <p className="text-sm text-gray-500">Includes render mockups, exterior layouts, and custom floor plans for marketing posts.</p>
                    <button
                      onClick={() => alert("Downloading Zip containing mock design image packs...")}
                      className="w-full h-11 flex items-center justify-center gap-1.5 border border-purple-200 rounded-xl text-xs font-semibold text-[#4B1D8F] hover:bg-purple-50 transition-colors cursor-pointer"
                    >
                      <Download className="h-4 w-4" /> Download Images (.ZIP)
                    </button>
                  </div>

                  <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-soft space-y-4 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
                      <Video className="h-6 w-6 text-[#4B1D8F]" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Product Video Clips</h3>
                    <p className="text-sm text-gray-500">Short video loops of modular houses assembling and 3D walkthroughs for social media.</p>
                    <button
                      onClick={() => alert("Downloading marketing short clips package...")}
                      className="w-full h-11 flex items-center justify-center gap-1.5 border border-purple-200 rounded-xl text-xs font-semibold text-[#4B1D8F] hover:bg-purple-50 transition-colors cursor-pointer"
                    >
                      <Download className="h-4 w-4" /> Download Videos (.MP4)
                    </button>
                  </div>

                  <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-soft space-y-4 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
                      <FileText className="h-6 w-6 text-[#4B1D8F]" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Sales Sheets & Catalog</h3>
                    <p className="text-sm text-gray-500">Standard brochures with technical specifications, pricing details, and warranty terms.</p>
                    <button
                      onClick={() => alert("Opening Apex Modular brochure package...")}
                      className="w-full h-11 flex items-center justify-center gap-1.5 border border-purple-200 rounded-xl text-xs font-semibold text-[#4B1D8F] hover:bg-purple-50 transition-colors cursor-pointer"
                    >
                      <Download className="h-4 w-4" /> View Catalog PDF
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ────────────────── PAYOUTS TAB ────────────────── */}
            {activeTab === "payouts" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
                <div className="lg:col-span-2 bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-soft space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Request Earnings Cashout</h2>
                    <p className="text-sm text-gray-500 mt-1">Submit cashout requests directly to bank details or PayPal.</p>
                  </div>

                  {payoutMessage && (
                    <div
                      className="p-3.5 rounded-xl text-sm"
                      style={{
                        backgroundColor: payoutMessage.type === "success" ? "#ecfdf5" : "#fef2f2",
                        color: payoutMessage.type === "success" ? "#065f46" : "#b91c1c"
                      }}
                    >
                      {payoutMessage.text}
                    </div>
                  )}

                  <form onSubmit={handlePayoutSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="payout-amount" className="block text-sm font-semibold text-gray-700 mb-1.5">
                          Withdrawal Amount ($)
                        </label>
                        <input
                          id="payout-amount"
                          type="number"
                          step="0.01"
                          min="10.00"
                          required
                          value={payoutAmount}
                          onChange={(e) => setPayoutAmount(e.target.value)}
                          placeholder="100.00"
                          className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#4B1D8F]"
                        />
                        <p className="text-xs text-gray-400 mt-1">Minimum payout is $10.00</p>
                      </div>

                      <div>
                        <label htmlFor="payout-method" className="block text-sm font-semibold text-gray-700 mb-1.5">
                          Payout Destination
                        </label>
                        <select
                          id="payout-method"
                          value={payoutMethod}
                          onChange={(e) => setPayoutMethod(e.target.value)}
                          className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#4B1D8F]"
                        >
                          <option value="Bank Transfer">Direct Bank Wire</option>
                          <option value="PayPal">PayPal Email Address</option>
                          <option value="Stripe Payout">Stripe Account</option>
                        </select>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={submittingPayout || !payoutAmount}
                      className="w-full h-11 flex items-center justify-center gap-1.5 rounded-xl text-white text-sm font-semibold hover:opacity-95 disabled:opacity-60 transition-opacity cursor-pointer"
                      style={{ backgroundColor: "#4B1D8F" }}
                    >
                      {submittingPayout ? "Processing Transfer Request..." : "Request Cashout Transfer"}
                    </button>
                  </form>
                </div>

                <div className="bg-[#F3EEFB] border border-purple-100 rounded-2xl p-6 shadow-soft space-y-4 h-fit">
                  <span className="text-xs uppercase tracking-widest text-[#D4AF37] font-bold">Your Wallet</span>
                  <div className="space-y-1">
                    <span className="text-xs text-gray-500">Available Balance</span>
                    <p className="text-3xl font-black text-gray-900">${profile?.available_balance?.toFixed(2) || "0.00"}</p>
                  </div>
                  <div className="border-t border-purple-200/50 pt-4 space-y-2 text-xs text-gray-600">
                    <p className="flex justify-between">
                      <span>Hold Period:</span>
                      <span className="font-semibold text-gray-800">None (Instantly cashable)</span>
                    </p>
                    <p className="flex justify-between">
                      <span>Total Payouts Done:</span>
                      <span className="font-semibold text-gray-800">
                        ${(profile.total_earned - profile.available_balance).toFixed(2)}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ────────────────── SETTINGS TAB ────────────────── */}
            {activeTab === "settings" && (
              <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-soft max-w-3xl space-y-8 animate-fade-in">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Affiliate Profile Settings</h2>
                  <p className="text-sm text-gray-500 mt-1">Maintain your professional and contact information.</p>
                </div>

                {profileMessage && (
                  <div
                    className="p-3.5 rounded-xl text-sm"
                    style={{
                      backgroundColor: profileMessage.type === "success" ? "#ecfdf5" : "#fef2f2",
                      color: profileMessage.type === "success" ? "#065f46" : "#b91c1c"
                    }}
                  >
                    {profileMessage.text}
                  </div>
                )}

                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="settings-fullName" className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Full Name
                      </label>
                      <input
                        id="settings-fullName"
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#4B1D8F]"
                      />
                    </div>

                    <div>
                      <label htmlFor="settings-phone" className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Phone Number
                      </label>
                      <input
                        id="settings-phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+1 (555) 123-4567"
                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#4B1D8F]"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label htmlFor="settings-company" className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Company / Website Name
                      </label>
                      <input
                        id="settings-company"
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="Apex Growth Marketing"
                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#4B1D8F]"
                      />
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-6 flex justify-between items-center">
                    <div className="text-xs text-gray-400">
                      Registered email: {profile?.email}
                    </div>
                    <button
                      type="submit"
                      disabled={updatingProfile}
                      className="h-11 px-6 rounded-xl text-white text-sm font-semibold hover:opacity-95 disabled:opacity-60 transition-opacity cursor-pointer"
                      style={{ backgroundColor: "#4B1D8F" }}
                    >
                      {updatingProfile ? "Saving Details..." : "Save Settings"}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </main>
      {/* ── PRODUCT DETAILS MODAL ── */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl overflow-hidden shadow-2xl max-w-2xl w-full border border-gray-100 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            {/* Modal Image Hero */}
            <div className="h-64 bg-gray-100 relative shrink-0">
              {selectedProduct.image_url ? (
                <img
                  src={selectedProduct.image_url}
                  alt={selectedProduct.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-purple-50 text-purple-300">
                  <Package className="h-16 w-16" />
                </div>
              )}
              <div className="absolute top-4 left-4">
                <span className="bg-[#4B1D8F] text-[#D4AF37] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-md border border-purple-900/10">
                  {selectedProduct.category?.name || "Prefab"}
                </span>
              </div>
              <button
                onClick={() => setSelectedProduct(null)}
                className="absolute top-4 right-4 h-8 w-8 rounded-full bg-black/50 hover:bg-black/75 text-white flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 md:p-8 overflow-y-auto space-y-6 flex-1">
              <div className="space-y-2">
                <h3 className="text-xl md:text-2xl font-black text-gray-900">
                  {selectedProduct.name}
                </h3>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-semibold text-gray-500">
                    Retail Price: <strong className="text-gray-900">${selectedProduct.price.toLocaleString()} CAD</strong>
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Product Description
                </h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {selectedProduct.description || "No description provided for this product."}
                </p>
              </div>

              {/* Commission Box */}
              <div className="bg-[#F3EEFB] border border-purple-100 rounded-2xl p-5 space-y-3">
                <h4 className="text-xs font-bold text-[#4B1D8F] uppercase tracking-widest flex items-center gap-1.5">
                  <Coins className="h-4 w-4 text-[#D4AF37]" /> Affiliate Commission Details
                </h4>
                <div className="grid grid-cols-2 gap-4 pt-1">
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Commission Structure</span>
                    <p className="text-sm font-bold text-gray-800 capitalize mt-0.5">
                      {selectedProduct.affiliate_commission_type.replace('_', ' ')}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Estimated Earning</span>
                    <p className="text-base font-black text-[#4B1D8F] mt-0.5">
                      {selectedProduct.affiliate_commission_type === "percentage"
                        ? `${selectedProduct.affiliate_commission_value}% (~$${((selectedProduct.price * selectedProduct.affiliate_commission_value) / 100).toLocaleString()} CAD)`
                        : `$${selectedProduct.affiliate_commission_value.toLocaleString()} CAD`
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-5 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3 shrink-0">
              <button
                onClick={() => setSelectedProduct(null)}
                className="h-11 px-5 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Close
              </button>
              <a
                href={`/products/${selectedProduct.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="h-11 px-5 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ExternalLink className="h-4 w-4 text-purple-700" /> View on Website
              </a>
              <button
                onClick={() => {
                  setCustomPath(`/products/${selectedProduct.slug}`);
                  setActiveTab("links");
                  setSelectedProduct(null);
                }}
                className="h-11 px-6 rounded-xl text-sm font-bold text-white transition-all flex items-center justify-center gap-1.5 hover:opacity-95 shadow-md cursor-pointer"
                style={{ backgroundColor: "#4B1D8F" }}
              >
                <Link2 className="h-4 w-4 text-[#D4AF37]" /> Create Referral Link
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
