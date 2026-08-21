"use client";

import { useState, useEffect } from "react";
import { Menu, X, Package, DollarSign, TrendingUp, Users, ShoppingCart, Settings, Bell, Search, Filter, Plus, ChevronDown, ChevronRight, Home, Package2, BarChart3, Eye, Edit, Trash2, Download, Upload, Star } from "lucide-react";
import Link from "next/link";

export default function SellerDashboardNewPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState("dashboard");

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: Home,
      href: "/seller/dashboard-new",
    },
    {
      id: "profile",
      label: "Profile",
      icon: Users,
      href: "/seller/profile",
    },
    {
      id: "products",
      label: "Products",
      icon: Package,
      href: "/seller/products",
    },
    {
      id: "orders",
      label: "Orders",
      icon: ShoppingCart,
      href: "/seller/orders",
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: BarChart3,
      href: "/seller/analytics",
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      href: "/seller/settings",
    },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return <DashboardOverview />;
      case "profile":
        return <ProfileSection />;
      case "products":
        return <ProductsSection />;
      case "orders":
        return <OrdersSection />;
      case "analytics":
        return <AnalyticsSection />;
      case "settings":
        return <SettingsSection />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Apex Modular Construction</h2>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeSection === item.id
                  ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-sm"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <item.icon className="h-5 w-5 mr-3" />
              {item.label}
              {activeSection === item.id && (
                <ChevronRight className="h-4 w-4 ml-auto" />
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="fixed inset-0 bg-black bg-opacity-50" />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 lg:ml-64">
        {/* Top Navigation */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-semibold text-gray-900">
                {menuItems.find(item => item.id === activeSection)?.label || "Dashboard"}
              </h1>
              
              {/* Mobile menu button */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

// Dashboard Overview Component
function DashboardOverview() {
  return (
    <div className="p-6 space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Welcome to Your Dashboard</h2>
            <p className="text-blue-100">Here's what's happening with your store today</p>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-3">
            <TrendingUp className="h-8 w-8 text-white" />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">$12,450</p>
              <p className="text-xs text-green-600">+12.5% from last month</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <Package className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Products</p>
              <p className="text-2xl font-bold text-gray-900">248</p>
              <p className="text-xs text-green-600">+18 this month</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-full">
              <ShoppingCart className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">1,247</p>
              <p className="text-xs text-green-600">+8.2% from last month</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-full">
              <Users className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Active Customers</p>
              <p className="text-2xl font-bold text-gray-900">3,842</p>
              <p className="text-xs text-green-600">+15.3% from last month</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              <div>
                <p className="text-sm font-medium">New order received</p>
                <p className="text-xs text-gray-500">Order #12345 - 2 minutes ago</p>
              </div>
            </div>
            <Eye className="h-4 w-4 text-gray-400" />
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
              <div>
                <p className="text-sm font-medium">Product updated</p>
                <p className="text-xs text-gray-500">Wireless Headphones - 15 minutes ago</p>
              </div>
            </div>
            <Star className="h-4 w-4 text-gray-400" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Import the ProfileSection component
import ProfileSection from "@/components/seller/ProfileSection";

function ProductsSection() {
  return (
    <div className="p-6">
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Products Management</h3>
        <p className="text-gray-600">Advanced product management coming soon...</p>
      </div>
    </div>
  );
}

function OrdersSection() {
  return (
    <div className="p-6">
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Orders Management</h3>
        <p className="text-gray-600">Order management system coming soon...</p>
      </div>
    </div>
  );
}

function AnalyticsSection() {
  return (
    <div className="p-6">
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Analytics</h3>
        <p className="text-gray-600">Advanced analytics coming soon...</p>
      </div>
    </div>
  );
}

function SettingsSection() {
  return (
    <div className="p-6">
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Settings</h3>
        <p className="text-gray-600">Settings panel coming soon...</p>
      </div>
    </div>
  );
}
