"use client";

import { useEffect, useState } from "react";
import { Bell, Shield, CreditCard, Globe, Smartphone, Mail, Save, Eye, EyeOff, Loader2 } from "lucide-react";
import { createBrowserClient } from "@/lib/supabase/client";
import { LuxuryButton } from "@/components/seller/LuxuryButton";

const PURPLE = "#4B1D8F";

const tabs = [
  { id: "general", label: "General", icon: Globe },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: Shield },
  { id: "payment", label: "Payment", icon: CreditCard },
];

const inputClass =
  "w-full px-3.5 py-2.5 border border-gray-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#4B1D8F] transition-shadow";

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-sm font-semibold uppercase tracking-wide mb-4" style={{ color: PURPLE }}>
      {children}
    </h3>
  );
}

function ToggleRow({
  icon: Icon, title, description, checked, onChange,
}: { icon: any; title: string; description: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between p-4 rounded-xl border border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ backgroundColor: "#EDE9F6" }}>
          <Icon className="h-4 w-4" style={{ color: PURPLE }} />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">{title}</p>
          <p className="text-xs text-gray-400">{description}</p>
        </div>
      </div>
      <div
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${checked ? "" : "bg-gray-200"}`}
        style={checked ? { backgroundColor: PURPLE } : {}}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${checked ? "translate-x-4" : "translate-x-0.5"}`}
        />
      </div>
    </label>
  );
}

export default function SellerSettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const [accountEmail, setAccountEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [notifications, setNotifications] = useState({
    emailOrders: true, emailCustomers: true, emailMarketing: false,
    pushOrders: true, pushCustomers: false,
  });

  useEffect(() => {
    const supabase = createBrowserClient();

    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user?.email) {
        setAccountEmail(data.session.user.email);
      }
    });
  }, []);

  const toggle = (key: keyof typeof notifications) =>
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);

    if (!currentPassword) {
      setPasswordError("Please enter your current password.");
      return;
    }
    if (!newPassword) {
      setPasswordError("Please enter a new password.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }
    if (!accountEmail) {
      setPasswordError("Unable to determine account email.");
      return;
    }

    setPasswordSaving(true);
    const supabase = createBrowserClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: accountEmail,
      password: currentPassword,
    });

    if (signInError) {
      setPasswordSaving(false);
      setPasswordError(signInError.message);
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
    setPasswordSaving(false);

    if (updateError) {
      setPasswordError(updateError.message);
      return;
    }

    setPasswordSuccess(true);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  }

  return (
    <div className="p-6">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden max-w-3xl">
        {/* Tab bar */}
        <div className="flex border-b border-gray-100 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id ? "border-[#4B1D8F] text-[#4B1D8F]" : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {activeTab === "general" && (
            <>
              <SectionTitle>Store Information</SectionTitle>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Store Name</label>
                  <input type="text" defaultValue="My Store" className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Account Email</label>
                  <input type="email" value={accountEmail} disabled className={`${inputClass} bg-gray-50 cursor-not-allowed`} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
                  <input type="tel" defaultValue="+1 234 567 8900" className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Currency</label>
                  <select className={inputClass}>
                    <option>CAD - Canadian Dollar</option>
                    <option>USD - US Dollar</option>
                    <option>EUR - Euro</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Time Zone</label>
                <select className={inputClass}>
                  <option>UTC-05:00 Eastern Time</option>
                  <option>UTC-06:00 Central Time</option>
                  <option>UTC-07:00 Mountain Time</option>
                  <option>UTC-08:00 Pacific Time</option>
                </select>
              </div>
            </>
          )}

          {activeTab === "notifications" && (
            <>
              <SectionTitle>Email Notifications</SectionTitle>
              <div className="space-y-2">
                <ToggleRow icon={Mail} title="New Orders" description="Get notified when you receive new orders" checked={notifications.emailOrders} onChange={() => toggle("emailOrders")} />
                <ToggleRow icon={Mail} title="Customer Messages" description="Get notified when customers contact you" checked={notifications.emailCustomers} onChange={() => toggle("emailCustomers")} />
                <ToggleRow icon={Mail} title="Marketing Updates" description="Receive marketing tips and platform updates" checked={notifications.emailMarketing} onChange={() => toggle("emailMarketing")} />
              </div>
              <SectionTitle>Push Notifications</SectionTitle>
              <div className="space-y-2">
                <ToggleRow icon={Smartphone} title="New Orders" description="Push notifications for new orders" checked={notifications.pushOrders} onChange={() => toggle("pushOrders")} />
                <ToggleRow icon={Smartphone} title="Customer Messages" description="Push notifications for customer messages" checked={notifications.pushCustomers} onChange={() => toggle("pushCustomers")} />
              </div>
            </>
          )}

          {activeTab === "security" && (
            <>
              <SectionTitle>Change Password</SectionTitle>
              {passwordSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700">
                  Password changed successfully.
                </div>
              )}
              {passwordError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                  {passwordError}
                </div>
              )}
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Current Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className={`${inputClass} pr-10`}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className={`${inputClass} pr-10`}
                    />
                    <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm New Password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`${inputClass} pr-10`}
                    />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={passwordSaving}
                  className="flex items-center gap-2 px-5 py-2 bg-[#4B1D8F] text-white text-sm font-semibold rounded-xl hover:bg-[#3e176f] disabled:opacity-60 transition-colors"
                >
                  {passwordSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                  Update Password
                </button>
              </form>
              <SectionTitle>Two-Factor Authentication</SectionTitle>
              <div className="flex items-center justify-between p-4 rounded-xl border border-gray-100">
                <div>
                  <p className="text-sm font-medium text-gray-900">Enable 2FA</p>
                  <p className="text-xs text-gray-400">Add an extra layer of security to your account</p>
                </div>
                <button className="px-4 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-90" style={{ backgroundColor: "#16a34a" }}>
                  Enable
                </button>
              </div>
            </>
          )}

          {activeTab === "payment" && (
            <>
              <SectionTitle>Payment Methods</SectionTitle>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 rounded-xl border border-gray-100">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Stripe</p>
                    <p className="text-xs text-gray-400">Credit card payments</p>
                  </div>
                  <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">Connected</span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl border border-gray-100">
                  <div>
                    <p className="text-sm font-medium text-gray-900">PayPal</p>
                    <p className="text-xs text-gray-400">PayPal payments</p>
                  </div>
                      <LuxuryButton size="sm">Connect</LuxuryButton>
                </div>
              </div>
              <SectionTitle>Payout Settings</SectionTitle>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Bank Account</label>
                  <input type="text" placeholder="Account number" className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Routing Number</label>
                  <input type="text" placeholder="Routing number" className={inputClass} />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100" style={{ backgroundColor: "#F5F4F7" }}>
          <LuxuryButton size="md">
            <Save className="h-4 w-4" /> Save Changes
          </LuxuryButton>
        </div>
      </div>
    </div>
  );
}
