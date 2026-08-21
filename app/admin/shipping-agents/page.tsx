"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Plus, X, Loader2, Truck, Pencil, Trash2, Eye, EyeOff, Check } from "lucide-react";
import {
  createShippingAgent, listShippingAgents,
  updateShippingAgent, deleteShippingAgent,
} from "@/app/actions/shipping-agent";

const inp = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4B1D8F] bg-white";

interface Agent {
  id: string;
  full_name: string | null;
  email: string;
  phone: string | null;
  created_at: string;
}

export default function AdminShippingAgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  // Create form
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [showNewPw, setShowNewPw] = useState(false);

  // Edit state
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [showEditPw, setShowEditPw] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Delete state
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const result = await listShippingAgents();
    setAgents(result.data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  function resetCreate() {
    setNewName(""); setNewEmail(""); setNewPassword(""); setNewPhone("");
    setCreateError(null); setShowNewPw(false);
  }

  function startEdit(agent: Agent) {
    setEditId(agent.id);
    setEditName(agent.full_name ?? "");
    setEditPhone(agent.phone ?? "");
    setEditPassword("");
    setEditError(null);
    setShowEditPw(false);
  }

  function cancelEdit() {
    setEditId(null); setEditError(null);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true); setCreateError(null);
    const result = await createShippingAgent({
      email: newEmail, password: newPassword,
      full_name: newName, phone: newPhone || null,
    });
    setCreating(false);
    if (result.error) { setCreateError(result.error); return; }
    resetCreate(); setShowCreate(false); load();
  }

  async function handleSaveEdit(id: string) {
    setSaving(true); setEditError(null);
    const result = await updateShippingAgent(id, {
      full_name: editName,
      phone: editPhone || null,
      password: editPassword || null,
    });
    setSaving(false);
    if (result.error) { setEditError(result.error); return; }
    setEditId(null); load();
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    await deleteShippingAgent(id);
    setDeletingId(null);
    setConfirmDeleteId(null);
    load();
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Shipping Agents</h1>
          <p className="text-sm text-gray-500 mt-0.5">{agents.length} agent{agents.length !== 1 ? "s" : ""}</p>
        </div>
        <button
          onClick={() => { setShowCreate(!showCreate); resetCreate(); }}
          className="flex items-center gap-2 px-4 py-2 text-white text-sm font-semibold rounded-lg transition-colors"
          style={{ backgroundColor: "#4B1D8F" }}
        >
          {showCreate ? <><X className="h-4 w-4" /> Cancel</> : <><Plus className="h-4 w-4" /> Create Shipping Agent</>}
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900 mb-4">New Shipping Agent Account</h2>
          {createError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{createError}</div>
          )}
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">Full Name *</label>
                <input type="text" required value={newName} onChange={(e) => setNewName(e.target.value)} className={inp} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">Email *</label>
                <input type="email" required value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className={inp} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">Password *</label>
                <div className="relative">
                  <input type={showNewPw ? "text" : "password"} required minLength={6}
                    value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                    className={inp + " pr-10"} />
                  <button type="button" onClick={() => setShowNewPw(!showNewPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showNewPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">Phone</label>
                <input type="tel" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} className={inp} />
              </div>
            </div>
            <button type="submit" disabled={creating}
              className="flex items-center gap-2 px-5 py-2 text-white text-sm font-semibold rounded-lg disabled:opacity-50 transition-colors"
              style={{ backgroundColor: "#4B1D8F" }}>
              {creating && <Loader2 className="h-4 w-4 animate-spin" />} Create Agent
            </button>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin" style={{ color: "#4B1D8F" }} />
          </div>
        ) : agents.length === 0 ? (
          <div className="text-center py-16">
            <Truck className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-400">No shipping agents yet.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {["Name", "Email", "Phone", "Created", "Actions"].map((h) => (
                  <th key={h} className={`px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide ${h === "Actions" ? "text-right" : "text-left"}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {agents.map((agent) => (
                <React.Fragment key={agent.id}>
                  {/* Normal row */}
                  <tr className={`hover:bg-gray-50 transition-colors ${editId === agent.id ? "bg-purple-50" : ""}`}>
                    <td className="px-4 py-3 font-semibold text-gray-900">{agent.full_name ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-600">{agent.email}</td>
                    <td className="px-4 py-3 text-gray-600">{agent.phone ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {new Date(agent.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {/* Edit */}
                        <button
                          onClick={() => editId === agent.id ? cancelEdit() : startEdit(agent)}
                          title={editId === agent.id ? "Cancel edit" : "Edit"}
                          className={`p-1.5 rounded-lg transition-colors ${editId === agent.id ? "bg-purple-100 text-[#4B1D8F]" : "text-gray-400 hover:text-[#4B1D8F] hover:bg-purple-50"}`}
                        >
                          {editId === agent.id ? <X className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
                        </button>
                        {/* Delete */}
                        <button
                          onClick={() => confirmDeleteId === agent.id ? handleDelete(agent.id) : setConfirmDeleteId(agent.id)}
                          onBlur={() => setTimeout(() => setConfirmDeleteId(null), 200)}
                          disabled={deletingId === agent.id}
                          title={confirmDeleteId === agent.id ? "Click again to confirm" : "Delete"}
                          className={`p-1.5 rounded-lg transition-colors ${confirmDeleteId === agent.id ? "bg-red-100 text-red-600" : "text-gray-400 hover:text-red-500 hover:bg-red-50"}`}
                        >
                          {deletingId === agent.id
                            ? <Loader2 className="h-4 w-4 animate-spin" />
                            : <Trash2 className="h-4 w-4" />
                          }
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Inline edit row */}
                  {editId === agent.id && (
                    <tr className="bg-purple-50 border-b border-purple-100">
                      <td colSpan={5} className="px-4 py-4">
                        {editError && (
                          <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{editError}</div>
                        )}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="space-y-1">
                            <label className="text-xs font-medium text-gray-600">Full Name</label>
                            <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className={inp} />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-medium text-gray-600">Phone</label>
                            <input type="tel" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} className={inp} />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-medium text-gray-600">New Password <span className="text-gray-400 font-normal">(leave blank to keep)</span></label>
                            <div className="relative">
                              <input
                                type={showEditPw ? "text" : "password"}
                                value={editPassword}
                                onChange={(e) => setEditPassword(e.target.value)}
                                placeholder="Min 6 characters"
                                className={inp + " pr-10"}
                              />
                              <button type="button" onClick={() => setShowEditPw(!showEditPw)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                {showEditPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-3">
                          <button
                            onClick={() => handleSaveEdit(agent.id)}
                            disabled={saving}
                            className="flex items-center gap-2 px-4 py-2 text-white text-sm font-semibold rounded-lg disabled:opacity-50 transition-colors"
                            style={{ backgroundColor: "#4B1D8F" }}
                          >
                            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                            Save Changes
                          </button>
                          <button onClick={cancelEdit}
                            className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                            Cancel
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
