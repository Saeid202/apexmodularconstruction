"use client";

import { useState, useEffect } from "react";
import { updateArchitectProfile } from "@/app/actions/architect";
import { User, Phone, Globe, MapPin, Briefcase, Award, GraduationCap, FileText, CheckCircle2, AlertCircle } from "lucide-react";

interface ArchitectProfileFormProps {
  initialProfile: {
    id: string;
    full_name: string;
    email: string;
    phone: string | null;
    firm_name: string | null;
    bio: string | null;
    website?: string | null;
    address?: string | null;
    professional_role?: string | null;
    experience_years?: number | null;
    specialization?: string | null;
  } | null;
}

export default function ArchitectProfileForm({ initialProfile }: ArchitectProfileFormProps) {
  // Split full_name
  const names = (initialProfile?.full_name || "").trim().split(/\s+/);
  const initialFirstName = names[0] || "";
  const initialLastName = names.slice(1).join(" ") || "";

  // Parse database columns directly
  const dbWebsite = initialProfile?.website || "";
  const dbAddress = initialProfile?.address || "";
  const dbRole = initialProfile?.professional_role || "Architect";
  const dbExperienceYears = initialProfile?.experience_years?.toString() || "";
  const dbSpecialization = initialProfile?.specialization || "Modular Construction";
  const dbBioText = initialProfile?.bio || "";

  // Parse bio properties as a fallback for legacy support
  let initialBioData = {
    website: dbWebsite,
    address: dbAddress,
    role: dbRole,
    experienceYears: dbExperienceYears,
    specialization: dbSpecialization,
    bioText: dbBioText,
  };

  if (initialProfile?.bio && !dbWebsite && !dbAddress) {
    try {
      const parsed = JSON.parse(initialProfile.bio);
      initialBioData = { ...initialBioData, ...parsed };
    } catch {
      initialBioData.bioText = initialProfile.bio;
    }
  }

  // States
  const [firstName, setFirstName] = useState(initialFirstName);
  const [lastName, setLastName] = useState(initialLastName);
  const [email, setEmail] = useState(initialProfile?.email || "");
  const [phone, setPhone] = useState(initialProfile?.phone || "");
  const [firmName, setFirmName] = useState(initialProfile?.firm_name || "");
  
  const [website, setWebsite] = useState(initialBioData.website);
  const [address, setAddress] = useState(initialBioData.address);
  const [role, setRole] = useState(initialBioData.role);
  const [experienceYears, setExperienceYears] = useState(initialBioData.experienceYears);
  const [specialization, setSpecialization] = useState(initialBioData.specialization);
  const [bioText, setBioText] = useState(initialBioData.bioText);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load from localStorage as fallback
  useEffect(() => {
    const localDataStr = localStorage.getItem("architect_profile_data");
    if (localDataStr) {
      try {
        const localData = JSON.parse(localDataStr);
        if (localData.firstName) setFirstName(localData.firstName);
        if (localData.lastName) setLastName(localData.lastName);
        if (localData.phone) setPhone(localData.phone);
        if (localData.firmName) setFirmName(localData.firmName);
        if (localData.website) setWebsite(localData.website);
        if (localData.address) setAddress(localData.address);
        if (localData.role) setRole(localData.role);
        if (localData.experienceYears) setExperienceYears(localData.experienceYears);
        if (localData.specialization) setSpecialization(localData.specialization);
        if (localData.bioText) setBioText(localData.bioText);
      } catch (e) {
        console.error("Failed to load local profile data", e);
      }
    }
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
    
    // Save to local storage first
    const localPayload = {
      firstName,
      lastName,
      phone,
      firmName,
      website,
      address,
      role,
      experienceYears,
      specialization,
      bioText,
    };
    localStorage.setItem("architect_profile_data", JSON.stringify(localPayload));

    // Call server action
    const result = await updateArchitectProfile({
      fullName,
      phone: phone || null,
      firmName: firmName || null,
      bio: bioText || null,
      website: website || null,
      address: address || null,
      professionalRole: role || null,
      experienceYears: experienceYears ? parseInt(experienceYears, 10) : null,
      specialization: specialization || null,
    });

    setLoading(false);

    if (result.success) {
      setSuccess("Profile successfully updated and synchronized.");
      // Auto dismiss success
      setTimeout(() => setSuccess(null), 4000);
    } else {
      setError(result.error || "Failed to save profile. Progress saved locally.");
    }
  };

  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || "A";

  const inputStyle = "w-full pl-10 pr-3.5 py-2.5 border border-gray-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all placeholder:text-gray-400";
  const selectStyle = "w-full pl-10 pr-8 py-2.5 border border-gray-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all appearance-none";

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Top Notification Alerts */}
      {success && (
        <div className="flex items-center gap-3 p-4 rounded-xl text-emerald-800 bg-emerald-50 border border-emerald-200 shadow-sm animate-fade-in">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <p className="text-sm font-medium">{success}</p>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl text-rose-800 bg-rose-50 border border-rose-200 shadow-sm animate-fade-in">
          <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Main Profile Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Banner Decoration */}
        <div className="h-32 bg-gradient-to-r from-slate-800 to-slate-950 flex items-end p-6">
          <div className="flex items-center gap-4 translate-y-10">
            <div className="w-20 h-20 rounded-full bg-emerald-500 text-white font-bold text-2xl flex items-center justify-center border-4 border-white shadow-md">
              {initials}
            </div>
            <div className="mb-2">
              <h2 className="text-lg font-bold text-gray-900 leading-tight">
                {firstName || lastName ? `${firstName} ${lastName}` : "Architect Profile"}
              </h2>
              <p className="text-xs text-gray-500 font-medium">{role || "Architect"}</p>
            </div>
          </div>
        </div>

        <div className="p-6 pt-14 space-y-8">
          {/* Section: Personal Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">First Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First name"
                    className={inputStyle}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">Last Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last name"
                    className={inputStyle}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">Email Address</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-gray-400" />
                  <input
                    type="email"
                    disabled
                    value={email}
                    placeholder="Email address"
                    className={`${inputStyle} bg-gray-50 text-gray-500 cursor-not-allowed`}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-gray-400" />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Phone number"
                    className={inputStyle}
                  />
                </div>
              </div>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Section: Company Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Company Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">Company / Studio Name</label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-gray-400" />
                  <input
                    type="text"
                    value={firmName}
                    onChange={(e) => setFirmName(e.target.value)}
                    placeholder="Studio or firm name"
                    className={inputStyle}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">Website URL</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-gray-400" />
                  <input
                    type="text"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://..."
                    className={inputStyle}
                  />
                </div>
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-semibold text-gray-700">Studio Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-gray-400" />
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Full business address"
                    className={inputStyle}
                  />
                </div>
              </div>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Section: Professional Profile */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Professional Qualifications</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">Professional Role</label>
                <div className="relative">
                  <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-gray-400 z-10" />
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className={selectStyle}
                  >
                    <option value="Architect">Architect</option>
                    <option value="Designer">Designer</option>
                    <option value="Engineer">Engineer</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">Years of Experience</label>
                <div className="relative">
                  <Award className="absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-gray-400" />
                  <input
                    type="number"
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(e.target.value)}
                    placeholder="Years"
                    min="0"
                    className={inputStyle}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">Specialization</label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-gray-400 z-10" />
                  <select
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    className={selectStyle}
                  >
                    <option value="Modular Construction">Modular Construction</option>
                    <option value="Residential">Residential</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Interior Design">Interior Design</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5 md:col-span-3">
                <label className="text-xs font-semibold text-gray-700">Professional Bio / Summary</label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 h-4.5 w-4.5 text-gray-400" />
                  <textarea
                    rows={4}
                    value={bioText}
                    onChange={(e) => setBioText(e.target.value)}
                    placeholder="Tell us about your architectural approach, design philosophy, or projects..."
                    className="w-full pl-10 pr-3.5 py-2.5 border border-gray-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all placeholder:text-gray-400 resize-y"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Panel */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-semibold text-sm hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-60 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {loading ? "Saving Changes..." : "Save Profile"}
          </button>
        </div>
      </div>
    </form>
  );
}
