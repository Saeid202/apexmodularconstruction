"use client";

import { useState } from "react";
import { BarChart3, TrendingUp, DollarSign, Package, Users, ShoppingCart, Calendar, Download } from "lucide-react";
import { LuxuryButton } from "@/components/seller/LuxuryButton";

const PURPLE = "#1F2937";
const GOLD = "#D4AF37";

const stats = [
  { title: "Total Revenue", value: "$24,580", change: "+12.5%", icon: DollarSign, bg: "#FEF3C7", color: PURPLE },
  { title: "Total Orders", value: "1,247", change: "+8.2%", icon: ShoppingCart, bg: "#dcfce7", color: "#16a34a" },
  { title: "Products Sold", value: "3,842", change: "+15.3%", icon: Package, bg: "#fef9c3", color: "#ca8a04" },
  { title: "Active Customers", value: "892", change: "+5.7%", icon: Users, bg: "#fce7f3", color: "#be185d" },
];

const topProducts = [
  { name: "Wireless Headphones", sales: 245, revenue: "$12,250" },
  { name: "Smart Watch", sales: 189, revenue: "$9,450" },
  { name: "Laptop Stand", sales: 156, revenue: "$4,680" },
  { name: "USB-C Hub", sales: 134, revenue: "$2,680" },
  { name: "Phone Case", sales: 98, revenue: "$1,470" },
];

const recentActivity = [
  { date: "2024-01-15", orders: 45, revenue: "$2,340" },
  { date: "2024-01-14", orders: 38, revenue: "$1,890" },
  { date: "2024-01-13", orders: 52, revenue: "$2,780" },
  { date: "2024-01-12", orders: 41, revenue: "$2,150" },
  { date: "2024-01-11", orders: 36, revenue: "$1,920" },
];

export default function SellerAnalyticsPage() {
  const [timeRange, setTimeRange] = useState("30days");

  return (
    <div className="p-6 space-y-6">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">Track your store performance</p>
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1F2937] bg-white"
          >
            <option value="7days">Last 7 days</option>
            <option value="30days">Last 30 days</option>
            <option value="90days">Last 90 days</option>
            <option value="1year">Last year</option>
          </select>
          <LuxuryButton size="md">
            <Download className="h-4 w-4" /> Export
          </LuxuryButton>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.title} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: s.bg }}>
                <s.icon className="h-5 w-5" style={{ color: s.color }} />
              </div>
              <span className="flex items-center gap-1 text-xs font-semibold text-green-600">
                <TrendingUp className="h-3.5 w-3.5" /> {s.change}
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.title}</p>
          </div>
        ))}
      </div>

      {/* Charts placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {[{ icon: BarChart3, label: "Revenue Overview" }, { icon: TrendingUp, label: "Orders Trend" }].map(({ icon: Icon, label }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-semibold text-gray-900 mb-4">{label}</h3>
            <div className="h-52 flex flex-col items-center justify-center rounded-xl" style={{ backgroundColor: "#F5F4F7" }}>
              <Icon className="h-10 w-10 mb-2" style={{ color: PURPLE, opacity: 0.4 }} />
              <p className="text-sm text-gray-400">Chart coming soon</p>
            </div>
          </div>
        ))}
      </div>

      {/* Top products + activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Top products */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Top Products</h3>
          <div className="space-y-2">
            {topProducts.map((p, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: "#F5F4F7" }}>
                <div
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{ backgroundColor: i === 0 ? GOLD : PURPLE }}
                >
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                  <p className="text-xs text-gray-400">{p.sales} sold</p>
                </div>
                <p className="text-sm font-semibold text-gray-900">{p.revenue}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent activity */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-2">
            {recentActivity.map((a, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: "#F5F4F7" }}>
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: "#FEF3C7" }}>
                  <Calendar className="h-4 w-4" style={{ color: PURPLE }} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{a.date}</p>
                  <p className="text-xs text-gray-400">{a.orders} orders</p>
                </div>
                <p className="text-sm font-semibold text-gray-900">{a.revenue}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
