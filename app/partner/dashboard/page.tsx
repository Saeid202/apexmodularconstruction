import { AlertCircle, FolderOpen, Clock, CheckCircle, ArrowRight, Zap } from "lucide-react";
import { getPartnerDashboardStats, getPartnerProfile } from "@/app/actions/partner";
import Link from "next/link";

export default async function PartnerDashboardPage() {
  const [statsResult, profileResult] = await Promise.all([
    getPartnerDashboardStats(),
    getPartnerProfile(),
  ]);

  const stats = statsResult.data;
  const partner = profileResult.data;

  return (
    <div className="space-y-6">

      {/* Hero welcome banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-600 p-8 text-white shadow-xl shadow-blue-500/20">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNCI+PHBhdGggZD0iTTM2IDM0djZoNnYtNmgtNnptMCAwdi02aC02djZoNnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-40" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="text-blue-100 text-sm font-medium">Partner Portal</span>
          </div>
          <h1 className="text-3xl font-bold mb-1">
            Welcome back, {partner?.company_name ?? "Partner"} 👋
          </h1>
          <p className="text-blue-100 text-sm">
            {partner?.country} · {partner?.contact_name}
          </p>
        </div>
        {/* Decorative circles */}
        <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/5" />
        <div className="absolute -right-4 -bottom-12 h-56 w-56 rounded-full bg-white/5" />
      </div>

      {/* Suspension banner */}
      {partner?.status === "suspended" && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
          <div>
            <h3 className="font-semibold text-red-800">Account Suspended</h3>
            <p className="text-sm text-red-600 mt-0.5">Your partner account has been suspended. Please contact Apex Modular Construction support.</p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 p-6 text-white shadow-lg shadow-indigo-500/20">
          <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10" />
          <FolderOpen className="h-6 w-6 text-indigo-200 mb-3" />
          <p className="text-4xl font-bold">{stats?.total ?? 0}</p>
          <p className="text-indigo-100 text-sm mt-1 font-medium">Total Projects</p>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 p-6 text-white shadow-lg shadow-amber-500/20">
          <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10" />
          <Clock className="h-6 w-6 text-amber-100 mb-3" />
          <p className="text-4xl font-bold">{stats?.pending ?? 0}</p>
          <p className="text-amber-100 text-sm mt-1 font-medium">Awaiting Response</p>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-6 text-white shadow-lg shadow-emerald-500/20">
          <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10" />
          <CheckCircle className="h-6 w-6 text-emerald-100 mb-3" />
          <p className="text-4xl font-bold">{stats?.responded ?? 0}</p>
          <p className="text-emerald-100 text-sm mt-1 font-medium">Quotes Submitted</p>
        </div>
      </div>

      {/* Quick action */}
      <Link
        href="/partner/projects"
        className="flex items-center justify-between p-5 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all group"
      >
        <div className="flex items-center gap-4">
          <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-md shadow-blue-500/30">
            <FolderOpen className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">View All Projects</p>
            <p className="text-sm text-gray-500">Review submissions and submit quotes</p>
          </div>
        </div>
        <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
      </Link>
    </div>
  );
}
