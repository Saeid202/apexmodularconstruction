"use client";

import { useState } from "react";
import { submitContactInquiry } from "@/app/actions/inquiries";
import { 
  Building2, 
  Mail, 
  User, 
  Phone, 
  DollarSign, 
  MapPin, 
  FileText, 
  Send, 
  CheckCircle2, 
  Loader2 
} from "lucide-react";

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    companyName: "",
    phone: "",
    subject: "Global Sourcing (Steel/Prefab/Modular)",
    projectBudget: "",
    projectLocation: "",
    message: "",
  });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await submitContactInquiry({
        name: formData.name,
        email: formData.email,
        companyName: formData.companyName || undefined,
        phone: formData.phone || undefined,
        subject: formData.subject,
        projectBudget: formData.projectBudget || undefined,
        projectLocation: formData.projectLocation || undefined,
        message: formData.message,
      });

      if (!response.success) {
        setErrorMessage(response.error || "Failed to submit. Please try again.");
      } else {
        setIsSubmitted(true);
      }
    } catch (err) {
      setErrorMessage("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-gray-200 bg-white/70 px-4 py-2.5 pl-10 text-sm placeholder:text-gray-400 focus:border-[#4B1D8F] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4B1D8F]/20 transition-all duration-300 backdrop-blur-sm";

  const labelClass = "block text-xs font-bold text-gray-700 uppercase tracking-widest mb-1.5";

  if (isSubmitted) {
    return (
      <div 
        className="rounded-3xl p-10 text-center shadow-xl border border-[#D4AF37]/30 bg-gradient-to-br from-white to-[#EDE9F6]/20 transition-all duration-500 animate-in fade-in zoom-in"
        style={{ boxShadow: "0 20px 40px -15px rgba(75, 29, 143, 0.1)" }}
      >
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 border-2 border-emerald-500/20 mb-6 shadow-inner">
          <CheckCircle2 className="h-8 w-8 text-emerald-600" />
        </div>
        <h3 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">Inquiry Secured Successfully</h3>
        <p className="text-gray-600 text-sm max-w-md mx-auto mb-8 leading-relaxed">
          Your request has been routed to our corporate modular engineering desk. A managing partner or senior compliance officer will review your project scope and contact you within <span className="font-extrabold text-[#4B1D8F]">4 business hours</span>.
        </p>
        <button
          onClick={() => {
            setIsSubmitted(false);
            setFormData({
              name: "",
              email: "",
              companyName: "",
              phone: "",
              subject: "Global Sourcing (Steel/Prefab/Modular)",
              projectBudget: "",
              projectLocation: "",
              message: "",
            });
          }}
          className="inline-flex h-11 items-center justify-center rounded-xl bg-gray-900 hover:bg-gray-800 text-white px-6 text-sm font-extrabold uppercase tracking-widest hover:scale-105 transition-all shadow-md active:scale-95"
        >
          Submit Another Request
        </button>
      </div>
    );
  }

  return (
    <div 
      className="rounded-3xl bg-white/80 backdrop-blur-md p-8 lg:p-10 shadow-2xl border border-white/40"
      style={{ boxShadow: "0 20px 50px rgba(75, 29, 143, 0.08)" }}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Name and Corporate Email */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="relative">
            <label htmlFor="name" className={labelClass}>
              Full Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={inputClass}
                placeholder="Alexander Wright"
              />
            </div>
          </div>

          <div className="relative">
            <label htmlFor="email" className={labelClass}>
              Corporate Email <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="email"
                id="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={inputClass}
                placeholder="a.wright@firmname.com"
              />
            </div>
          </div>
        </div>

        {/* Company & Phone */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="relative">
            <label htmlFor="companyName" className={labelClass}>
              Company / Firm Name
            </label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                id="companyName"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className={inputClass}
                placeholder="Wright Development Group"
              />
            </div>
          </div>

          <div className="relative">
            <label htmlFor="phone" className={labelClass}>
              Direct Telephone
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="tel"
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className={inputClass}
                placeholder="+1 (555) 019-2834"
              />
            </div>
          </div>
        </div>

        {/* Subject & Budget */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="relative">
            <label htmlFor="subject" className={labelClass}>
              Primary Department / Inquiry <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              <select
                id="subject"
                required
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className={`${inputClass} appearance-none pr-10`}
              >
                <option value="Global Sourcing (Steel/Prefab/Modular)">Global Sourcing (Steel/Prefab/Modular)</option>
                <option value="Structural Customization/Configurator Inquiry">Custom House / Configurator Inquiry</option>
                <option value="CSA Certification & Canadian Compliance">CSA Certification & Compliance</option>
                <option value="Partnership & Development Projects">Partnership & Development Projects</option>
                <option value="General Corporate Inquiry">General Corporate Inquiry</option>
              </select>
              <div className="absolute right-4 top-4.5 pointer-events-none border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-500 h-0 w-0" />
            </div>
          </div>

          <div className="relative">
            <label htmlFor="projectBudget" className={labelClass}>
              Estimated Project Budget
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              <select
                id="projectBudget"
                value={formData.projectBudget}
                onChange={(e) => setFormData({ ...formData, projectBudget: e.target.value })}
                className={`${inputClass} appearance-none pr-10`}
              >
                <option value="">Select Est. Capital Allocation</option>
                <option value="$100k - $500k">$100,000 to $500,000</option>
                <option value="$500k - $2M">$500,000 to $2,000,000</option>
                <option value="$2M - $10M">$2,000,000 to $10,000,000</option>
                <option value="$10M+">$10,000,000+</option>
              </select>
              <div className="absolute right-4 top-4.5 pointer-events-none border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-500 h-0 w-0" />
            </div>
          </div>
        </div>

        {/* Project Location */}
        <div className="relative">
          <label htmlFor="projectLocation" className={labelClass}>
            Intended Construction Site Location
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              id="projectLocation"
              value={formData.projectLocation}
              onChange={(e) => setFormData({ ...formData, projectLocation: e.target.value })}
              className={inputClass}
              placeholder="e.g. Vaughan, ON, Canada"
            />
          </div>
        </div>

        {/* Message */}
        <div className="relative">
          <label htmlFor="message" className={labelClass}>
            Detailed Scope of Work / Request Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="message"
            required
            rows={5}
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            className="w-full rounded-xl border border-gray-200 bg-white/70 px-4 py-3 text-sm placeholder:text-gray-400 focus:border-[#4B1D8F] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4B1D8F]/20 transition-all duration-300 backdrop-blur-sm shadow-inner resize-none leading-relaxed"
            placeholder="Please outline the structural design, compliance timeline, manufacturing requirements, or any customization parameters..."
          />
        </div>

        {errorMessage && (
          <div className="p-4 rounded-xl bg-red-50 border-2 border-red-500/10 text-red-700 text-sm font-semibold animate-shake">
            {errorMessage}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full min-h-[52px] rounded-xl flex items-center justify-center gap-2 text-white font-extrabold uppercase tracking-widest text-xs transition-all duration-300 shadow-lg cursor-pointer hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] disabled:opacity-75 disabled:pointer-events-none"
          style={{ 
            background: "linear-gradient(135deg, #4B1D8F 0%, #351368 100%)",
            boxShadow: "0 10px 25px -5px rgba(75, 29, 143, 0.4)"
          }}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Securing Inquiry Connection...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Submit Secure Corporate Inquiry
            </>
          )}
        </button>
      </form>
    </div>
  );
}
