"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Eye, Pencil, Trash2, Download, FileSpreadsheet, X, MessageSquare, Upload, CheckCircle, Loader2 } from "lucide-react";
import {
  getMyEngineeringProjects,
  updateEngineeringProject,
  deleteEngineeringProject,
  type EngineeringProjectRow,
  type SubmitEngineeringProjectInput,
} from "@/app/actions/engineering";
import {
  getProjectMessages,
  sendCustomerMessage,
  markMessagesRead,
} from "@/app/actions/engineering-messages";
import { ProjectForm } from "./ProjectForm";
import { ChatDrawer } from "@/components/engineering/ChatDrawer";

// ─── helpers ────────────────────────────────────────────────────────────────

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
const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

function badge(status: string) {
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_COLORS[status] ?? "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
}

// ─── PDF export ─────────────────────────────────────────────────────────────

async function exportPDF(p: EngineeringProjectRow) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF();
  const line = (label: string, value: string | number | null | undefined, y: number) => {
    doc.setFont("helvetica", "bold"); doc.text(label + ":", 14, y);
    doc.setFont("helvetica", "normal"); doc.text(String(value ?? "—"), 80, y);
  };
  doc.setFontSize(16); doc.text("Engineering Project", 14, 16);
  doc.setFontSize(10);
  let y = 28;
  const rows: [string, string | number | null | undefined][] = [
    ["Project Name", p.project_name],
    ["City", p.project_location_city],
    ["Province", p.project_location_province],
    ["Type", TYPE_LABELS[p.project_type] ?? p.project_type],
    ["Total Area", p.total_area + " sqft/m²"],
    ["Floors", p.number_of_floors],
    ["Length", p.building_length + " m"],
    ["Width", p.building_width + " m"],
    ["Height", p.building_height ? p.building_height + " m" : "—"],
    ["Structure", p.structure_type],
    ["Delivery Location", p.delivery_location],
    ["Budget", BUDGET_LABELS[p.budget_range] ?? p.budget_range],
    ["Full Name", p.full_name],
    ["Company", p.company_name],
    ["Email", p.email],
    ["Phone", p.phone],
    ["Status", p.status],
    ["Submitted", new Date(p.created_at).toLocaleDateString()],
    ["Description", p.project_description ?? "—"],
  ];
  rows.forEach(([label, val]) => { line(label, val, y); y += 8; });
  doc.save(`project-${p.project_name.replace(/\s+/g, "-")}.pdf`);
}

// ─── CSV export (replaces xlsx — no vulnerable dependency needed) ─────────────

function exportExcel(p: EngineeringProjectRow) {
  const rows: Record<string, string | number> = {
    "Project Name": p.project_name,
    "City": p.project_location_city,
    "Province": p.project_location_province,
    "Type": TYPE_LABELS[p.project_type] ?? p.project_type,
    "Total Area": p.total_area,
    "Floors": p.number_of_floors,
    "Length (m)": p.building_length,
    "Width (m)": p.building_width,
    "Height (m)": p.building_height ?? "",
    "Structure": p.structure_type,
    "Delivery Location": p.delivery_location,
    "Budget": BUDGET_LABELS[p.budget_range] ?? p.budget_range,
    "Full Name": p.full_name,
    "Company": p.company_name,
    "Email": p.email,
    "Phone": p.phone,
    "Status": p.status,
    "Submitted": new Date(p.created_at).toLocaleDateString(),
    "Description": p.project_description ?? "",
  };

  const escape = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  const headers = Object.keys(rows);
  const values = Object.values(rows);
  const csv = [headers.map(escape).join(","), values.map(escape).join(",")].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `project-${p.project_name.replace(/\s+/g, "-")}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── View Modal ──────────────────────────────────────────────────────────────

function ViewModal({ project, onClose }: { project: EngineeringProjectRow; onClose: () => void }) {
  const Row = ({ label, value }: { label: string; value: string | number | null | undefined }) => (
    <div className="flex gap-2 py-2 border-b border-gray-100 last:border-0">
      <span className="w-44 shrink-0 text-xs font-medium text-gray-500">{label}</span>
      <span className="text-sm text-gray-900">{value ?? "—"}</span>
    </div>
  );
  return (
    <Overlay onClose={onClose}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">{project.project_name}</h2>
        <div className="flex items-center gap-2">
          {badge(project.status)}
          <button onClick={onClose}><X className="h-5 w-5 text-gray-400 hover:text-gray-600" /></button>
        </div>
      </div>
      <div className="space-y-0 max-h-[60vh] overflow-y-auto pr-1">
        <Row label="City" value={project.project_location_city} />
        <Row label="Province" value={project.project_location_province} />
        <Row label="Project Type" value={TYPE_LABELS[project.project_type]} />
        <Row label="Total Area" value={project.total_area + " sqft/m²"} />
        <Row label="Floors" value={project.number_of_floors} />
        <Row label="Length" value={project.building_length + " m"} />
        <Row label="Width" value={project.building_width + " m"} />
        <Row label="Height" value={project.building_height ? project.building_height + " m" : null} />
        <Row label="Structure" value={project.structure_type} />
        <Row label="Drawings" value={project.no_drawings_flag ? "No drawings provided" : "Uploaded"} />
        <Row label="Delivery Location" value={project.delivery_location} />
        <Row label="Budget" value={BUDGET_LABELS[project.budget_range]} />
        <Row label="Full Name" value={project.full_name} />
        <Row label="Company" value={project.company_name} />
        <Row label="Email" value={project.email} />
        <Row label="Phone" value={project.phone} />
        <Row label="Description" value={project.project_description} />
        <Row label="Submitted" value={new Date(project.created_at).toLocaleDateString()} />
      </div>
      <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
        <button onClick={() => exportPDF(project)} className="flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
          <Download className="h-4 w-4" /> PDF
        </button>
        <button onClick={() => exportExcel(project)} className="flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
          <FileSpreadsheet className="h-4 w-4" /> Excel
        </button>
      </div>
    </Overlay>
  );
}

// ─── Edit Modal ──────────────────────────────────────────────────────────────

function EditModal({ project, onClose, onSaved }: { project: EngineeringProjectRow; onClose: () => void; onSaved: () => void }) {
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true); setErr(null);
    const fd = new FormData(e.currentTarget);
    const get = (k: string) => (fd.get(k) as string) || "";
    const result = await updateEngineeringProject(project.id, {
      project_name: get("project_name"),
      project_location_city: get("project_location_city"),
      project_location_province: get("project_location_province"),
      project_type: get("project_type") as any,
      total_area: parseFloat(get("total_area")),
      number_of_floors: parseInt(get("number_of_floors")),
      building_length: parseFloat(get("building_length")),
      building_width: parseFloat(get("building_width")),
      building_height: get("building_height") ? parseFloat(get("building_height")) : null,
      structure_type: get("structure_type"),
      delivery_location: get("delivery_location"),
      budget_range: get("budget_range") as any,
      full_name: get("full_name"),
      company_name: get("company_name"),
      email: get("email"),
      phone: get("phone"),
      project_description: get("project_description") || null,
    });
    setSaving(false);
    if (result.error) { setErr(result.error); return; }
    onSaved();
  }

  return (
    <Overlay onClose={onClose} wide>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">Edit Project</h2>
        <button onClick={onClose}><X className="h-5 w-5 text-gray-400 hover:text-gray-600" /></button>
      </div>
      {err && <div className="mb-3 p-3 bg-red-50 text-red-700 text-sm rounded-lg">{err}</div>}
      <form onSubmit={handleSubmit} className="space-y-3 max-h-[65vh] overflow-y-auto pr-1">
        <EF label="Project Name" name="project_name" defaultValue={project.project_name} required />
        <div className="grid grid-cols-2 gap-3">
          <EF label="City" name="project_location_city" defaultValue={project.project_location_city} required />
          <EF label="Province" name="project_location_province" defaultValue={project.project_location_province} required />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-600">Project Type *</label>
          <select name="project_type" defaultValue={project.project_type} required className={inp}>
            <option value="residential">Residential</option>
            <option value="commercial">Commercial</option>
            <option value="industrial">Industrial</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <EF label="Total Area" name="total_area" type="number" defaultValue={project.total_area} required />
          <EF label="Floors" name="number_of_floors" type="number" defaultValue={project.number_of_floors} required />
          <EF label="Length (m)" name="building_length" type="number" defaultValue={project.building_length} required />
          <EF label="Width (m)" name="building_width" type="number" defaultValue={project.building_width} required />
          <EF label="Height (m)" name="building_height" type="number" defaultValue={project.building_height ?? ""} />
        </div>
        <EF label="Delivery Location" name="delivery_location" defaultValue={project.delivery_location} required />
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-600">Budget Range *</label>
          <select name="budget_range" defaultValue={project.budget_range} required className={inp}>
            <option value="under_100k">Under $100k</option>
            <option value="100k_300k">$100k – $300k</option>
            <option value="300k_plus">$300k+</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <EF label="Full Name" name="full_name" defaultValue={project.full_name} required />
          <EF label="Company" name="company_name" defaultValue={project.company_name} required />
          <EF label="Email" name="email" type="email" defaultValue={project.email} required />
          <EF label="Phone" name="phone" defaultValue={project.phone} required />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-600">Description</label>
          <textarea name="project_description" rows={3} defaultValue={project.project_description ?? ""} className={inp + " resize-none"} />
        </div>
        <div className="pt-2 flex gap-2">
          <button type="submit" disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />} Save Changes
          </button>
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
        </div>
      </form>
    </Overlay>
  );
}

// ─── Shared overlay wrapper ──────────────────────────────────────────────────

function Overlay({ children, onClose, wide }: { children: React.ReactNode; onClose: () => void; wide?: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className={`relative bg-white rounded-xl shadow-xl w-full ${wide ? "max-w-2xl" : "max-w-lg"} p-6`}>
        {children}
      </div>
    </div>
  );
}

// ─── Small edit field helper ─────────────────────────────────────────────────

function EF({ label, name, type = "text", defaultValue, required }: {
  label: string; name: string; type?: string; defaultValue?: string | number | null; required?: boolean;
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-gray-600">{label}{required && " *"}</label>
      <input name={name} type={type} defaultValue={defaultValue ?? ""} required={required} step="any" className={inp} />
    </div>
  );
}

const inp = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white";

// ─── Main Page ───────────────────────────────────────────────────────────────

type View = "table" | "form";

export default function EngineeringPage() {
  const [view, setView] = useState<View>("table");
  const [projects, setProjects] = useState<EngineeringProjectRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewProject, setViewProject] = useState<EngineeringProjectRow | null>(null);
  const [editProject, setEditProject] = useState<EngineeringProjectRow | null>(null);
  const [chatProject, setChatProject] = useState<EngineeringProjectRow | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  const load = useCallback(async () => {
    setLoading(true);
    const result = await getMyEngineeringProjects();
    setProjects(result.data);
    // Fetch unread counts per project
    const counts: Record<string, number> = {};
    await Promise.all(result.data.map(async (p) => {
      const msgs = await getProjectMessages(p.id);
      counts[p.id] = msgs.data.filter((m) => m.sender_role === "partner" && !m.is_read).length;
    }));
    setUnreadCounts(counts);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleDelete(id: string) {
    if (!confirm("Delete this project? This cannot be undone.")) return;
    setDeleting(id);
    await deleteEngineeringProject(id);
    setDeleting(null);
    load();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{projects.length} project{projects.length !== 1 ? "s" : ""} submitted</p>
        </div>
        <button
          onClick={() => setView(view === "form" ? "table" : "form")}
          className="flex items-center gap-2 px-4 py-2.5 text-white text-sm font-semibold rounded-xl transition-colors shadow-md"
          style={{ background: "linear-gradient(135deg, #4B1D8F, #3A1570)", border: "1px solid #D4AF37" }}
        >
          {view === "form" ? <><X className="h-4 w-4" /> Cancel</> : <><Plus className="h-4 w-4" /> New Project</>}
        </button>
      </div>

      {/* Guidance banner */}
      {view === "table" && (
        <div className="rounded-2xl overflow-hidden border border-[#4B1D8F]/20" style={{ background: "linear-gradient(135deg, #f9f7ff 0%, #fdf8ec 100%)", boxShadow: "0 2px 12px rgba(75,29,143,0.08)" }}>
          <div className="px-6 py-4 flex items-center gap-3 border-b border-[#4B1D8F]/10" style={{ background: "linear-gradient(135deg, #4B1D8F, #3A1570)" }}>
            <span className="text-yellow-300 text-lg">✦</span>
            <p className="text-sm font-bold uppercase tracking-widest text-white">How It Works</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-[#4B1D8F]/10">
            <div className="bg-white/90 p-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full text-white text-base font-black shrink-0" style={{ background: "linear-gradient(135deg, #4B1D8F, #D4AF37)" }}>1</span>
                <p className="text-base font-bold text-gray-900">Submit Your Project</p>
              </div>
              <p className="text-sm font-semibold text-gray-700 leading-relaxed">
                Fill in your project details — dimensions, structure type, location, and budget. Our engineering team will review your submission and get back to you promptly with a tailored quote and next steps.
              </p>
            </div>
            <div className="bg-white/90 p-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full text-white text-base font-black shrink-0" style={{ background: "linear-gradient(135deg, #4B1D8F, #D4AF37)" }}>2</span>
                <p className="text-base font-bold text-gray-900">We Handle the Rest</p>
              </div>
              <p className="text-sm font-semibold text-gray-700 leading-relaxed">
                Already have drawings or a preferred supplier? Attach your files and reference links directly to your project. We'll coordinate procurement, fabrication, and delivery — consolidating everything into one seamless process.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Form view */}
      {view === "form" && (
        <ProjectForm onSubmitted={() => { setView("table"); load(); }} />
      )}

      {/* Table view */}
      {view === "table" && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-400 text-sm">No projects yet.</p>
              <button onClick={() => setView("form")} className="mt-3 text-sm text-blue-600 hover:underline">Submit your first project</button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {["Project Name", "Location", "Type", "Budget", "Status", "Submitted", "Actions"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {projects.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900 max-w-[180px] truncate">{p.project_name}</td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{p.project_location_city}, {p.project_location_province}</td>
                      <td className="px-4 py-3 text-gray-600 capitalize">{TYPE_LABELS[p.project_type] ?? p.project_type}</td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{BUDGET_LABELS[p.budget_range] ?? p.budget_range}</td>
                      <td className="px-4 py-3">{badge(p.status)}</td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{new Date(p.created_at).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <ActionBtn title="View" onClick={() => setViewProject(p)}><Eye className="h-4 w-4" /></ActionBtn>
                          <ActionBtn title="Edit" onClick={() => setEditProject(p)}><Pencil className="h-4 w-4" /></ActionBtn>
                          {/* Chat button with unread badge */}
                          <div className="relative">
                            <ActionBtn title="Messages" onClick={() => setChatProject(p)}>
                              <MessageSquare className="h-4 w-4" />
                            </ActionBtn>
                            {(unreadCounts[p.id] ?? 0) > 0 && (
                              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold">
                                {unreadCounts[p.id]}
                              </span>
                            )}
                          </div>
                          <ActionBtn title="Export PDF" onClick={() => exportPDF(p)}><Download className="h-4 w-4" /></ActionBtn>
                          <ActionBtn title="Export Excel" onClick={() => exportExcel(p)}><FileSpreadsheet className="h-4 w-4" /></ActionBtn>
                          <ActionBtn title="Delete" onClick={() => handleDelete(p.id)} danger loading={deleting === p.id}>
                            {deleting === p.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                          </ActionBtn>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {viewProject && <ViewModal project={viewProject} onClose={() => setViewProject(null)} />}
      {editProject && <EditModal project={editProject} onClose={() => setEditProject(null)} onSaved={() => { setEditProject(null); load(); }} />}
      {chatProject && (
        <ChatDrawer
          projectName={chatProject.project_name}
          projectId={chatProject.id}
          currentRole="customer"
          onClose={() => { setChatProject(null); load(); }}
          fetchMessages={getProjectMessages}
          sendMessage={sendCustomerMessage}
          markRead={markMessagesRead}
        />
      )}
    </div>
  );
}

function ActionBtn({ children, onClick, title, danger, loading }: {
  children: React.ReactNode; onClick: () => void; title: string; danger?: boolean; loading?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      title={title}
      className={`p-1.5 rounded-lg transition-colors ${danger ? "text-gray-400 hover:text-red-500 hover:bg-red-50" : "text-gray-400 hover:text-blue-600 hover:bg-blue-50"}`}
    >
      {children}
    </button>
  );
}
