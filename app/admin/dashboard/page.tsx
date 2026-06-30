import Link from "next/link";
import { Users, Package, MessageSquare, Settings } from "lucide-react";

const cards = [
  { title: "Partners",             description: "Create and manage partner accounts",       href: "/admin/partners",    icon: Users,        color: "bg-blue-50 text-blue-600" },
  { title: "Agents",               description: "Create and manage agent accounts",         href: "/admin/agents",      icon: Users,        color: "bg-orange-50 text-orange-600" },
  { title: "Engineering Projects", description: "View all submitted engineering projects",  href: "/admin/engineering", icon: Package,      color: "bg-green-50 text-green-600" },
  { title: "Inquiries",            description: "Manage customer inquiries",                href: "/admin/inquiries",   icon: MessageSquare,color: "bg-purple-50 text-purple-600" },
  { title: "Sellers",              description: "Manage seller accounts",                   href: "/admin/sellers",     icon: Settings,     color: "bg-amber-50 text-amber-600" },
];

export default function AdminDashboardPage() {
  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your Apex Modular Construction platform</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md hover:border-blue-200 transition-all"
          >
            <div className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${card.color} mb-4`}>
              <card.icon className="h-5 w-5" />
            </div>
            <h2 className="font-semibold text-gray-900">{card.title}</h2>
            <p className="text-sm text-gray-500 mt-1">{card.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
