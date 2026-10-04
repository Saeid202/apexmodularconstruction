"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import React from "react";
import Link from "next/link";
import { MessageSquare, Eye, Loader2, FolderOpen, CheckCircle2, Clock, Download, Send, X, Paperclip, FileText } from "lucide-react";
import { getAllProjectsForPartner, type PartnerProjectRow } from "@/app/actions/partner";
import {
  getPartnerProjectMessages,
  sendPartnerMessage,
  markPartnerMessagesRead,
  type ProjectMessage,
} from "@/app/actions/engineering-messages";

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

// ── Inline notes panel ────────────────────────────────────────────────────────
function InlineNotes({ project, onClose }: { project: PartnerProjectRow; onClose: () => void }) {
  const [messages, setMessages] = useState<ProjectMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    const result = await getPartnerProjectMessages(project.id);
    if (!result.error) {
      setMessages(result.data);
      await markPartnerMessagesRead(project.id);
    }
    setLoading(false);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  }, [project.id]);

  useEffect(() => { load(); }, [load]);

  async function handleSend() {
    if (!text.trim() && files.length === 0) return;
    setSending(true);

    const attachments: { name: string; base64: string; type: string }[] = [];
    for (const file of files) {
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(",")[1]);
        reader.readAsDataURL(file);
      });
      attachments.push({ name: file.name, base64, type: file.type });
    }

    await sendPartnerMessage(project.id, text.trim() || null, attachments);
    setText("");
    setFiles([]);
    setSending(false);
    load();
  }

  return (
    <tr>
      <td colSpan={8} className="p-0">
        <div className="bg-gradient-to-br from-amber-50 via-blue-50 to-amber-50 border-t border-b border-amber-100 px-6 py-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-gray-800" />
              <span className="text-sm font-semibold text-gray-900">Notes — {project.project_name}</span>
            </div>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-amber-100 text-amber-400 hover:text-gray-800 transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="max-h-64 overflow-y-auto space-y-2 mb-3 pr-1">
            {loading ? (
              <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-amber-400" /></div>
            ) : messages.length === 0 ? (
              <p className="text-center text-xs text-gray-400 py-6">No notes yet. Start the conversation.</p>
            ) : (
              messages.map((msg) => {
                const isPartner = msg.sender_role === "partner";
                return (
                  <div key={msg.id} className={`flex ${isPartner ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                      isPartner
                        ? "bg-gradient-to-br from-blue-600 to-gray-800 text-white rounded-br-sm shadow-md shadow-blue-500/20"
                        : "bg-white text-gray-800 rounded-bl-sm shadow-sm border border-gray-100"
                    }`}>
                      <p className={`text-[10px] font-semibold mb-1 ${isPartner ? "text-blue-200" : "text-gray-400"}`}>
                        {isPartner ? "You" : "Customer"}
                      </p>
                      {msg.message && <p className="whitespace-pre-wrap leading-relaxed">{msg.message}</p>}
                      {msg.files.length > 0 && (
                        <div className="mt-1.5 space-y-1">
                          {msg.files.map((f) => (
                            <a key={f.id} href={f.signed_url} target="_blank" rel="noopener noreferrer"
                              className={`flex items-center gap-1.5 text-xs underline ${isPartner ? "text-blue-200" : "text-blue-500"}`}>
                              <FileText className="h-3 w-3" />{f.file_name}
                            </a>
                          ))}
                        </div>
                      )}
                      <p className={`text-[10px] mt-1 ${isPartner ? "text-blue-300" : "text-gray-400"}`}>
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={bottomRef} />
          </div>

          {/* Attached files */}
          {files.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {files.map((f, i) => (
                <div key={i} className="flex items-center gap-1 bg-white border border-amber-200 rounded-lg px-2 py-1 text-xs text-gray-800">
                  <FileText className="h-3 w-3" />
                  <span className="max-w-[100px] truncate">{f.name}</span>
                  <button onClick={() => setFiles((p) => p.filter((_, j) => j !== i))} className="ml-1 text-amber-400 hover:text-red-500">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="flex items-end gap-2">
            <div className="flex-1 flex items-end gap-2 bg-white border border-amber-200 rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-amber-400 shadow-sm">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                rows={1}
                placeholder="Write a note… (Enter to send)"
                className="flex-1 resize-none text-sm outline-none bg-transparent max-h-24 text-gray-800 placeholder-gray-400"
              />
              <label className="cursor-pointer text-gray-400 hover:text-gray-800 shrink-0">
                <Paperclip className="h-4 w-4" />
                <input type="file" multiple className="hidden"
                  onChange={(e) => { if (e.target.files) setFiles((p) => [...p, ...Array.from(e.target.files!)]); }} />
              </label>
            </div>
            <button
              onClick={handleSend}
              disabled={sending || (!text.trim() && files.length === 0)}
              className="h-10 w-10 flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-800 text-white rounded-xl hover:from-gray-800 hover:to-gray-800 disabled:opacity-40 shadow-md shadow-amber-500/30 transition-all shrink-0"
            >
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </td>
    </tr>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function PartnerProjectsPage() {
  const [projects, setProjects] = useState<PartnerProjectRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [openNoteId, setOpenNoteId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const result = await getAllProjectsForPartner();
    setProjects(result.data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const quoted = projects.filter((p) => p.has_quote).length;
  const pending = projects.filter((p) => !p.has_quote).length;

  return (
    <div className="space-y-6">

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="relative overflow-hidden bg-gradient-to-br from-amber-500 to-blue-600 rounded-2xl p-5 text-white shadow-lg shadow-amber-500/20">
          <div className="absolute -right-3 -top-3 h-20 w-20 rounded-full bg-white/10" />
          <FolderOpen className="h-5 w-5 text-amber-200 mb-2" />
          <p className="text-3xl font-bold">{projects.length}</p>
          <p className="text-amber-100 text-xs font-medium mt-0.5">Total Projects</p>
        </div>
        <div className="relative overflow-hidden bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl p-5 text-white shadow-lg shadow-amber-500/20">
          <div className="absolute -right-3 -top-3 h-20 w-20 rounded-full bg-white/10" />
          <Clock className="h-5 w-5 text-amber-100 mb-2" />
          <p className="text-3xl font-bold">{pending}</p>
          <p className="text-amber-100 text-xs font-medium mt-0.5">Awaiting Quote</p>
        </div>
        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-5 text-white shadow-lg shadow-emerald-500/20">
          <div className="absolute -right-3 -top-3 h-20 w-20 rounded-full bg-white/10" />
          <CheckCircle2 className="h-5 w-5 text-emerald-100 mb-2" />
          <p className="text-3xl font-bold">{quoted}</p>
          <p className="text-emerald-100 text-xs font-medium mt-0.5">Quoted</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">All Submissions</h2>
          <span className="text-xs text-gray-400">{projects.length} project{projects.length !== 1 ? "s" : ""}</span>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-blue-500" /></div>
        ) : projects.length === 0 ? (
          <div className="text-center py-20">
            <FolderOpen className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-400">No projects submitted yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {["Project", "Company", "Location", "Type", "Budget", "Status", "Date", "Actions"].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {projects.map((p) => {
                  const status = STATUS_CONFIG[p.status] ?? { label: p.status, className: "bg-gray-100 text-gray-600" };
                  const noteOpen = openNoteId === p.id;
                  return (
                    <React.Fragment key={p.id}>
                      <tr key={p.id} className={`hover:bg-blue-50/20 transition-colors border-b border-gray-50 ${noteOpen ? "bg-amber-50/30" : ""}`}>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-900 text-sm">{p.project_name}</span>
                            {p.has_quote && (
                              <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-green-100 text-green-700 border border-green-200">QUOTED</span>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-600">{p.company_name}</td>
                        <td className="px-5 py-4 text-sm text-gray-600 whitespace-nowrap">{p.project_location_city}, {p.project_location_province}</td>
                        <td className="px-5 py-4 text-sm text-gray-600">{TYPE_LABELS[p.project_type] ?? p.project_type}</td>
                        <td className="px-5 py-4 text-sm text-gray-600 whitespace-nowrap">{BUDGET_LABELS[p.budget_range] ?? p.budget_range}</td>
                        <td className="px-5 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${status.className}`}>{status.label}</span>
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-400 whitespace-nowrap">{new Date(p.created_at).toLocaleDateString()}</td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5">
                            <Link href={`/partner/projects/${p.id}`}
                              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors">
                              <Eye className="h-3.5 w-3.5" /> View
                            </Link>
                            <Link href={`/partner/projects/${p.id}`}
                              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">
                              <Download className="h-3.5 w-3.5" /> Download
                            </Link>
                            <button
                              onClick={() => setOpenNoteId(noteOpen ? null : p.id)}
                              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                noteOpen
                                  ? "bg-gray-800 text-white"
                                  : "text-gray-800 bg-amber-50 hover:bg-amber-100"
                              }`}>
                              <MessageSquare className="h-3.5 w-3.5" /> Note
                            </button>
                          </div>
                        </td>
                      </tr>
                      {noteOpen && <InlineNotes key={`notes-${p.id}`} project={p} onClose={() => setOpenNoteId(null)} />}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
