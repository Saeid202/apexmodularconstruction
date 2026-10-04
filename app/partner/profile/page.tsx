import { PartnerProfileForm } from "./PartnerProfileForm";
import { ChangePasswordForm } from "./ChangePasswordForm";
import { User, Lock } from "lucide-react";

export default function PartnerProfilePage() {
  return (
    <div className="space-y-6 max-w-2xl">

      {/* Profile card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-blue-100 flex items-center gap-2">
          <User className="h-4 w-4 text-blue-600" />
          <h2 className="text-sm font-bold text-blue-900 uppercase tracking-wide">Company Profile</h2>
        </div>
        <div className="p-6">
          <PartnerProfileForm />
        </div>
      </div>

      {/* Password card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-amber-50 to-pink-50 border-b border-amber-100 flex items-center gap-2">
          <Lock className="h-4 w-4 text-gray-800" />
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Change Password</h2>
        </div>
        <div className="p-6">
          <ChangePasswordForm />
        </div>
      </div>
    </div>
  );
}
