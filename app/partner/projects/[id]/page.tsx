import { notFound } from "next/navigation";
import Link from "next/link";
import { Download, ArrowLeft, MapPin, Building2, DollarSign, User, Phone, Mail, FileText } from "lucide-react";
import { getProjectDetailForPartner } from "@/app/actions/partner";
import { QuoteForm } from "./QuoteForm";

const BUDGET_LABELS: Record<string, string> = {
  under_100k: "Under $100k",
  "100k_300k": "$100k – $300k",
  "300k_plus": "$300k+",
};
const TYPE_LABELS: Record<string, string> = {
  residential: "Residential",
  commercial: "Commercial",
  industrial: "Industrial",
};
const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  pending:   { label: "Pending",   className: "bg-amber-100 text-amber-700 border border-amber-200" },
  in_review: { label: "In Review", className: "bg-blue-100 text-blue-700 border border-blue-200" },
  approved:  { label: "Approved",  className: "bg-green-100 text-green-700 border border-green-200" },
  rejected:  { label: "Rejected",  className: "bg-red-100 text-red-700 border border-red-200" },
};

function InfoRow({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-gray-100 last:border-0">
      <span className="w-40 shrink-0 text-xs font-semibold text-gray-400 uppercase tracking-wide pt-0.5">{label}</span>
      <span className="text-sm text-gray-800 font-medium">{value ?? "—"}</span>
    </div>
  );
}

export default async function PartnerProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getProjectDetailForPartner(id);

  if (result.error || !result.data) notFound();

  const { project: p, drawings, existing_quote } = result.data;
  const status = STATUS_CONFIG[p.status] ?? { label: p.status, className: "bg-gray-100 text-gray-600" };

  return (
    <div className="space-y-6 max-w-5xl">

      {/* Back + header */}
      <div>
        <Link href="/partner/projects" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 transition-colors mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to Projects
        </Link>

        {/* Hero card */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 via-slate-900 to-gray-900 p-7 text-white shadow-xl">
          <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/5" />
          <div className="absolute right-16 bottom-0 h-32 w-32 rounded-full bg-blue-500/10" />
          <div className="relative flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="h-4 w-4 text-blue-400" />
                <span className="text-blue-300 text-xs font-medium uppercase tracking-widest">Engineering Project</span>
              </div>
              <h1 className="text-2xl font-bold mb-2">{p.project_name}</h1>
              <div className="flex items-center gap-1.5 text-slate-300 text-sm">
                <MapPin className="h-3.5 w-3.5" />
                {p.project_location_city}, {p.project_location_province}
              </div>
            </div>
            <span className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold ${status.className}`}>
              {status.label}
            </span>
          </div>
        </div>
      </div>

      {/* Two column info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Project specs */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-blue-100 flex items-center gap-2">
            <Building2 className="h-4 w-4 text-blue-600" />
            <h2 className="text-sm font-bold text-blue-900 uppercase tracking-wide">Project Specifications</h2>
          </div>
          <div className="px-6 py-2">
            <InfoRow label="Type" value={TYPE_LABELS[p.project_type] ?? p.project_type} />
            <InfoRow label="Total Area" value={`${p.total_area} sqft/m²`} />
            <InfoRow label="Floors" value={p.number_of_floors} />
            <InfoRow label="Length" value={`${p.building_length} m`} />
            <InfoRow label="Width" value={`${p.building_width} m`} />
            <InfoRow label="Height" value={p.building_height ? `${p.building_height} m` : null} />
            <InfoRow label="Structure" value={p.structure_type} />
            <InfoRow label="Delivery" value={p.delivery_location} />
            <InfoRow label="Budget" value={BUDGET_LABELS[p.budget_range] ?? p.budget_range} />
            <InfoRow label="Submitted" value={new Date(p.created_at).toLocaleDateString()} />
            {p.project_description && <InfoRow label="Description" value={p.project_description} />}
          </div>
        </div>

        {/* Customer contact */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-amber-50 to-pink-50 border-b border-amber-100 flex items-center gap-2">
            <User className="h-4 w-4 text-gray-800" />
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Customer Contact</h2>
          </div>
          <div className="px-6 py-5 space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-amber-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                {p.full_name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">{p.full_name}</p>
                <p className="text-xs text-gray-500">{p.company_name}</p>
              </div>
            </div>
            <div className="space-y-3">
              <a href={`mailto:${p.email}`} className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors">
                <Mail className="h-4 w-4 text-blue-500 shrink-0" />
                <span className="text-sm text-blue-700 font-medium">{p.email}</span>
              </a>
              <a href={`tel:${p.phone}`} className="flex items-center gap-3 p-3 rounded-xl bg-green-50 hover:bg-green-100 transition-colors">
                <Phone className="h-4 w-4 text-green-500 shrink-0" />
                <span className="text-sm text-green-700 font-medium">{p.phone}</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Drawings */}
      {drawings.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100 flex items-center gap-2">
            <FileText className="h-4 w-4 text-amber-600" />
            <h2 className="text-sm font-bold text-amber-900 uppercase tracking-wide">Project Drawings</h2>
            <span className="ml-auto text-xs text-amber-600 font-medium">{drawings.length} file{drawings.length !== 1 ? "s" : ""}</span>
          </div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
            {drawings.map((d) =>
              d.signed_url ? (
                <a
                  key={d.id}
                  href={d.signed_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-xl border border-amber-100 bg-amber-50 hover:bg-amber-100 transition-colors group"
                >
                  <div className="h-8 w-8 rounded-lg bg-amber-200 flex items-center justify-center shrink-0">
                    <Download className="h-4 w-4 text-amber-700 group-hover:scale-110 transition-transform" />
                  </div>
                  <span className="text-sm text-amber-800 font-medium truncate">{d.file_name}</span>
                </a>
              ) : (
                <div key={d.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50 opacity-50">
                  <div className="h-8 w-8 rounded-lg bg-gray-200 flex items-center justify-center shrink-0">
                    <Download className="h-4 w-4 text-gray-400" />
                  </div>
                  <span className="text-sm text-gray-500 truncate">{d.file_name} (unavailable)</span>
                </div>
              )
            )}
          </div>
        </div>
      )}

      {/* Quote form */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100 flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-emerald-600" />
          <h2 className="text-sm font-bold text-emerald-900 uppercase tracking-wide">
            {existing_quote ? "Update Your Quote" : "Submit a Quote"}
          </h2>
          {existing_quote && (
            <span className="ml-auto px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200">
              Quote submitted
            </span>
          )}
        </div>
        <div className="p-6">
          <QuoteForm projectId={p.id} existingQuote={existing_quote} />
        </div>
      </div>
    </div>
  );
}
