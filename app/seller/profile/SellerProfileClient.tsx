"use client";

import { useState, useTransition } from "react";
import { User, Mail, Phone, MapPin, Building, Edit2, Save, X, CheckCircle, Clock } from "lucide-react";
import { updateSellerProfile } from "@/app/actions/seller";

const PURPLE = "#4B1D8F";
const GOLD = "#D4AF37";

interface ProfileData {
  businessName: string;
  email: string;
  phone: string;
  address: string;
  description: string;
}

interface Props {
  initialProfile: ProfileData;
}

export function SellerProfileClient({ initialProfile }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<ProfileData>(initialProfile);
  const [editProfile, setEditProfile] = useState<ProfileData>(initialProfile);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSave = () => {
    setError(null);
    startTransition(async () => {
      const result = await updateSellerProfile({
        business_name: editProfile.businessName,
        business_email: editProfile.email,
        business_phone: editProfile.phone,
        business_address: editProfile.address,
        description: editProfile.description,
      });
      if (result.success) {
        setProfile(editProfile);
        setIsEditing(false);
      } else {
        setError(result.error);
      }
    });
  };

  const handleCancel = () => {
    setEditProfile(profile);
    setIsEditing(false);
    setError(null);
  };

  const inputClass =
    "w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#4B1D8F] transition-shadow placeholder:text-gray-400";

  const verifications = [
    { label: "Email", status: "verified" },
    { label: "Phone", status: "verified" },
    { label: "Business", status: "verified" },
    { label: "Address", status: "pending" },
  ];

  return (
    <div className="p-6 space-y-6 max-w-3xl">

      {/* ── Banner Card ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div
          className="h-32 w-full relative"
          style={{ background: `linear-gradient(135deg, ${PURPLE} 0%, #3a1570 100%)` }}
        >
          <span className="absolute top-3 left-3 h-6 w-6 border-t-2 border-l-2 border-yellow-400 rounded-tl-md" />
          <span className="absolute top-3 right-3 h-6 w-6 border-t-2 border-r-2 border-yellow-400 rounded-tr-md" />
          <span className="absolute bottom-3 left-3 h-6 w-6 border-b-2 border-l-2 border-yellow-400 rounded-bl-md" />
          <span className="absolute bottom-3 right-3 h-6 w-6 border-b-2 border-r-2 border-yellow-400 rounded-br-md" />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] opacity-80" style={{ color: GOLD }}>
              Welcome to
            </p>
            <p
              className="text-2xl font-bold tracking-wide drop-shadow-md"
              style={{ color: GOLD, fontFamily: "Georgia, 'Times New Roman', serif", textShadow: "0 1px 8px rgba(212,175,55,0.4)" }}
            >
              Shanghai Apex Modular Construction
            </p>
          </div>
        </div>
      </div>

      {/* ── Avatar / Name Card ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="px-6 py-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className="h-16 w-16 rounded-2xl flex items-center justify-center shadow-md flex-shrink-0"
              style={{ backgroundColor: PURPLE }}
            >
              <Building className="h-7 w-7 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">{profile.businessName || "Your Business Name"}</h2>
              <p className="text-sm text-gray-500">{profile.email || "business@example.com"}</p>
            </div>
          </div>

          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90 flex-shrink-0"
              style={{ backgroundColor: PURPLE, border: `1.5px solid ${GOLD}` }}
            >
              <Edit2 className="h-4 w-4" /> Edit Profile
            </button>
          ) : (
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={handleSave}
                disabled={isPending}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                style={{ backgroundColor: PURPLE, border: `1.5px solid ${GOLD}` }}
              >
                <Save className="h-4 w-4" /> {isPending ? "Saving..." : "Save"}
              </button>
              <button
                onClick={handleCancel}
                disabled={isPending}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <X className="h-4 w-4" /> Cancel
              </button>
            </div>
          )}
        </div>
        {error && (
          <div className="mx-6 mb-4 px-4 py-2.5 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">
            {error}
          </div>
        )}
      </div>

      {/* ── Business Information Form ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-sm font-bold uppercase tracking-widest" style={{ color: PURPLE }}>
            Business Information
          </h3>
        </div>
        <div className="p-6 space-y-5">
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Business Name</label>
              {isEditing ? (
                <input type="text" value={editProfile.businessName}
                  onChange={(e) => setEditProfile({ ...editProfile, businessName: e.target.value })}
                  className={inputClass} />
              ) : (
                <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 rounded-xl text-sm text-gray-900">
                  <Building className="h-4 w-4 flex-shrink-0" style={{ color: PURPLE }} />
                  {profile.businessName || <span className="text-gray-400">—</span>}
                </div>
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Email Address</label>
              {isEditing ? (
                <input type="email" value={editProfile.email}
                  onChange={(e) => setEditProfile({ ...editProfile, email: e.target.value })}
                  className={inputClass} />
              ) : (
                <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 rounded-xl text-sm text-gray-900">
                  <Mail className="h-4 w-4 flex-shrink-0" style={{ color: PURPLE }} />
                  {profile.email || <span className="text-gray-400">—</span>}
                </div>
              )}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Phone Number</label>
              {isEditing ? (
                <input type="tel" value={editProfile.phone}
                  onChange={(e) => setEditProfile({ ...editProfile, phone: e.target.value })}
                  className={inputClass} />
              ) : (
                <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 rounded-xl text-sm text-gray-900">
                  <Phone className="h-4 w-4 flex-shrink-0" style={{ color: PURPLE }} />
                  {profile.phone || <span className="text-gray-400">—</span>}
                </div>
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Business Address</label>
              {isEditing ? (
                <input type="text" value={editProfile.address}
                  onChange={(e) => setEditProfile({ ...editProfile, address: e.target.value })}
                  className={inputClass} />
              ) : (
                <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 rounded-xl text-sm text-gray-900">
                  <MapPin className="h-4 w-4 flex-shrink-0" style={{ color: PURPLE }} />
                  {profile.address || <span className="text-gray-400">—</span>}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Business Description</label>
            {isEditing ? (
              <textarea value={editProfile.description}
                onChange={(e) => setEditProfile({ ...editProfile, description: e.target.value })}
                rows={4} className={`${inputClass} resize-none`} />
            ) : (
              <div className="flex items-start gap-2 px-4 py-2.5 bg-gray-50 rounded-xl text-sm text-gray-900">
                <User className="h-4 w-4 flex-shrink-0 mt-0.5" style={{ color: PURPLE }} />
                {profile.description || <span className="text-gray-400">—</span>}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Verification Status ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-sm font-bold uppercase tracking-widest" style={{ color: PURPLE }}>
            Verification Status
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            {verifications.map(({ label, status }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-2 p-4 rounded-xl border text-center"
                style={{
                  borderColor: status === "verified" ? "#bbf7d0" : "#fde68a",
                  backgroundColor: status === "verified" ? "#f0fdf4" : "#fefce8",
                }}
              >
                {status === "verified"
                  ? <CheckCircle className="h-5 w-5 text-green-600" />
                  : <Clock className="h-5 w-5 text-yellow-600" />}
                <p className="text-xs font-semibold text-gray-700">{label}</p>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${status === "verified" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                  {status === "verified" ? "Verified" : "Pending"}
                </span>
              </div>
            ))}
          </div>
          <div className="p-3 rounded-xl text-sm" style={{ backgroundColor: "#EDE9F6", color: PURPLE }}>
            Complete all verifications to unlock premium features and increase buyer trust.
          </div>
        </div>
      </div>

    </div>
  );
}
