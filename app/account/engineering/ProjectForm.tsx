"use client";

import { useState } from "react";
import { Upload, X, CheckCircle } from "lucide-react";
import { submitEngineeringProject } from "@/app/actions/engineering";

const inp = "w-full px-3 py-2.5 border-2 border-[#4B1D8F]/60 rounded-xl text-sm font-bold focus:outline-none focus:border-[#4B1D8F] bg-white transition-colors placeholder-gray-300";
const inputStyle = { color: "#1a0a3c", boxShadow: "0 0 0 3px rgba(75,29,143,0.08)" };

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border-2 border-[#4B1D8F]/30 p-6 space-y-4" style={{ boxShadow: "0 0 0 3px rgba(75,29,143,0.06)" }}>
      <h2 className="text-xs font-extrabold text-gray-700 uppercase tracking-wider">{title}</h2>
      {children}
    </div>
  );
}

function Field({ label, required, hint, children }: {
  label: string; required?: boolean; hint?: string; children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wider">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
        {hint && <span className="text-gray-400 font-normal normal-case ml-1">({hint})</span>}
      </label>
      {children}
    </div>
  );
}

export function ProjectForm({ onSubmitted }: { onSubmitted: () => void }) {
  const [noDrawings, setNoDrawings] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) setFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const fd = new FormData(e.currentTarget);
    const get = (k: string) => (fd.get(k) as string) || "";

    const drawings: { name: string; base64: string; type: string }[] = [];
    for (const file of files) {
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(",")[1]);
        reader.readAsDataURL(file);
      });
      drawings.push({ name: file.name, base64, type: file.type });
    }

    const result = await submitEngineeringProject({
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
      no_drawings_flag: noDrawings,
      delivery_location: get("delivery_location"),
      budget_range: get("budget_range") as any,
      full_name: get("full_name"),
      company_name: get("company_name"),
      email: get("email"),
      phone: get("phone"),
      project_description: get("project_description") || null,
      drawings,
    });

    setSubmitting(false);
    if (result.error) { setError(result.error); return; }
    onSubmitted();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}

      <Section title="Project Basics">
        <Field label="Project Name" required>
          <input name="project_name" type="text" required placeholder="e.g. Downtown Warehouse Build" className={inp} style={inputStyle} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="City" required><input name="project_location_city" type="text" required placeholder="Vancouver" className={inp} style={inputStyle} /></Field>
          <Field label="Province" required><input name="project_location_province" type="text" required placeholder="BC" className={inp} style={inputStyle} /></Field>
        </div>
        <Field label="Project Type" required>
          <select name="project_type" required className={inp} style={inputStyle}>
            <option value="">Select type</option>
            <option value="residential">Residential</option>
            <option value="commercial">Commercial</option>
            <option value="industrial">Industrial</option>
          </select>
        </Field>
      </Section>

      <Section title="Building Specifications">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Total Area (sqft / m²)" required><input name="total_area" type="number" required min={0} step="any" placeholder="5000" className={inp} style={inputStyle} /></Field>
          <Field label="Number of Floors" required><input name="number_of_floors" type="number" required min={1} placeholder="2" className={inp} style={inputStyle} /></Field>
          <Field label="Building Length (m)" required><input name="building_length" type="number" required min={0} step="any" placeholder="30" className={inp} style={inputStyle} /></Field>
          <Field label="Building Width (m)" required><input name="building_width" type="number" required min={0} step="any" placeholder="20" className={inp} style={inputStyle} /></Field>
          <Field label="Building Height (m)" hint="optional"><input name="building_height" type="number" min={0} step="any" placeholder="6" className={inp} style={inputStyle} /></Field>
        </div>
      </Section>

      <Section title="Structure">
        <Field label="Structure Type" required>
          <select name="structure_type" required className={inp} style={inputStyle}>
            <option value="light_steel_structure">Light Steel Structure</option>
          </select>
        </Field>
      </Section>

      <Section title="Drawings">
        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input type="checkbox" checked={noDrawings} onChange={(e) => { setNoDrawings(e.target.checked); if (e.target.checked) setFiles([]); }} className="rounded border-gray-300" />
          I don't have drawings yet
        </label>
        {!noDrawings && (
          <div>
            <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
              <Upload className="h-5 w-5 text-gray-400 mb-1" />
              <span className="text-sm text-gray-500">Click to upload drawings</span>
              <span className="text-xs text-gray-400">PDF, DWG, PNG, JPG — multiple allowed</span>
              <input type="file" multiple accept=".pdf,.dwg,.png,.jpg,.jpeg" onChange={handleFiles} className="hidden" />
            </label>
            {files.length > 0 && (
              <ul className="mt-2 space-y-1">
                {files.map((f, i) => (
                  <li key={i} className="flex items-center justify-between text-sm bg-gray-50 px-3 py-2 rounded-lg">
                    <span className="truncate text-gray-700">{f.name}</span>
                    <button type="button" onClick={() => setFiles((p) => p.filter((_, j) => j !== i))} className="ml-2 text-gray-400 hover:text-red-500"><X className="h-4 w-4" /></button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </Section>

      <Section title="Logistics">
        <Field label="Delivery Location" required><input name="delivery_location" type="text" required placeholder="123 Site Ave, Calgary, AB" className={inp} style={inputStyle} /></Field>
      </Section>

      <Section title="Budget">
        <Field label="Budget Range" required>
          <select name="budget_range" required className={inp} style={inputStyle}>
            <option value="">Select range</option>
            <option value="under_100k">Under $100,000</option>
            <option value="100k_300k">$100,000 – $300,000</option>
            <option value="300k_plus">$300,000+</option>
          </select>
        </Field>
      </Section>

      <Section title="Contact Information">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Full Name" required><input name="full_name" type="text" required placeholder="John Smith" className={inp} style={inputStyle} /></Field>
          <Field label="Company Name" required><input name="company_name" type="text" required placeholder="Acme Construction Ltd." className={inp} style={inputStyle} /></Field>
          <Field label="Email" required><input name="email" type="email" required placeholder="john@acme.com" className={inp} style={inputStyle} /></Field>
          <Field label="Phone" required><input name="phone" type="tel" required placeholder="+1 (604) 555-0100" className={inp} style={inputStyle} /></Field>
        </div>
      </Section>

      <Section title="Additional">
        <Field label="Project Description" hint="optional">
          <textarea name="project_description" rows={4} placeholder="Any additional details..." className={inp + " resize-none"} style={inputStyle} />
        </Field>
      </Section>

      <button type="submit" disabled={submitting}
        className="w-full py-3 text-white font-bold rounded-xl transition-all shadow-lg disabled:opacity-50"
        style={{ background: "linear-gradient(135deg, #4B1D8F, #3A1570)", border: "2px solid #D4AF37" }}>
        {submitting ? "Submitting…" : "🚀 Submit Project"}
      </button>
    </form>
  );
}
