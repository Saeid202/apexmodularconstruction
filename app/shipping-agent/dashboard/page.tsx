import { Truck, Clock, TrendingUp, CheckCircle, ArrowRight } from "lucide-react";
import { getShippingAgentStats } from "@/app/actions/shipping-agent";
import Link from "next/link";

export default async function ShippingAgentDashboard() {
  const stats = await getShippingAgentStats();

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div
        className="relative overflow-hidden rounded-2xl p-8 text-white"
        style={{
          background: "linear-gradient(135deg, #4B1D8F 0%, #3a1570 100%)",
          boxShadow: "0 0 0 1px #4B1D8F, 0 0 0 4px #D4AF37, 0 0 0 5px #4B1D8F",
        }}
      >
        <span className="absolute top-3 left-3 h-5 w-5 border-t-2 border-l-2 border-yellow-400 rounded-tl-md" />
        <span className="absolute top-3 right-3 h-5 w-5 border-t-2 border-r-2 border-yellow-400 rounded-tr-md" />
        <span className="absolute bottom-3 left-3 h-5 w-5 border-b-2 border-l-2 border-yellow-400 rounded-bl-md" />
        <span className="absolute bottom-3 right-3 h-5 w-5 border-b-2 border-r-2 border-yellow-400 rounded-br-md" />
        <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/5" />
        <div className="relative flex items-center gap-5">
          <div className="h-16 w-16 rounded-2xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: "rgba(212,175,55,0.2)", border: "1px solid rgba(212,175,55,0.4)" }}>
            <Truck className="h-8 w-8 text-yellow-300" />
          </div>
          <div>
            <span className="inline-block mb-2 rounded-full border border-yellow-400/50 bg-yellow-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-yellow-300">
              Shipping Portal
            </span>
            <h1 className="text-3xl font-extrabold text-white">Shipping Requests</h1>
            <p className="text-purple-200 text-base mt-1">Review and manage client shipping requests.</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total",       value: stats.total,       icon: Truck,        color: "#4B1D8F" },
          { label: "Pending",     value: stats.pending,     icon: Clock,        color: "#6B7280" },
          { label: "In Progress", value: stats.in_progress, icon: TrendingUp,   color: "#3B82F6" },
          { label: "Completed",   value: stats.completed,   icon: CheckCircle,  color: "#059669" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="relative bg-white rounded-2xl p-5 overflow-hidden"
            style={{ boxShadow: "0 0 0 1px #4B1D8F, 0 0 0 3px #D4AF37, 0 0 0 4px #4B1D8F" }}>
            <span className="absolute top-1.5 left-1.5 h-3 w-3 border-t-2 border-l-2 border-yellow-400 rounded-tl-sm" />
            <span className="absolute top-1.5 right-1.5 h-3 w-3 border-t-2 border-r-2 border-yellow-400 rounded-tr-sm" />
            <span className="absolute bottom-1.5 left-1.5 h-3 w-3 border-b-2 border-l-2 border-yellow-400 rounded-bl-sm" />
            <span className="absolute bottom-1.5 right-1.5 h-3 w-3 border-b-2 border-r-2 border-yellow-400 rounded-br-sm" />
            <div className="flex h-10 w-10 items-center justify-center rounded-xl mb-3" style={{ backgroundColor: `${color}18` }}>
              <Icon className="h-5 w-5" style={{ color }} />
            </div>
            <p className="text-3xl font-black text-gray-900">{value}</p>
            <p className="text-sm text-gray-500 font-semibold mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Quick action */}
      <Link href="/shipping-agent/requests"
        className="group relative flex items-center justify-between p-6 rounded-2xl bg-white overflow-hidden transition-all hover:shadow-lg"
        style={{ boxShadow: "0 0 0 1px #4B1D8F, 0 0 0 3px #D4AF37, 0 0 0 4px #4B1D8F" }}>
        <span className="absolute top-2 left-2 h-4 w-4 border-t-2 border-l-2 border-yellow-400 rounded-tl-sm" />
        <span className="absolute top-2 right-2 h-4 w-4 border-t-2 border-r-2 border-yellow-400 rounded-tr-sm" />
        <span className="absolute bottom-2 left-2 h-4 w-4 border-b-2 border-l-2 border-yellow-400 rounded-bl-sm" />
        <span className="absolute bottom-2 right-2 h-4 w-4 border-b-2 border-r-2 border-yellow-400 rounded-br-sm" />
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: "#EDE9F6" }}>
            <Truck className="h-6 w-6" style={{ color: "#4B1D8F" }} />
          </div>
          <div>
            <p className="text-lg font-bold text-gray-900">View All Requests</p>
            <p className="text-base text-gray-500">Review and respond to client shipping requests</p>
          </div>
        </div>
        <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform shrink-0" style={{ color: "#4B1D8F" }} />
      </Link>
    </div>
  );
}
