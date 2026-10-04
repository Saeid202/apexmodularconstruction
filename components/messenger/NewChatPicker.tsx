"use client";

import { useState, useEffect } from "react";
import { Loader2, ArrowLeft, Search } from "lucide-react";
import { getAvailableContacts, getOrCreateConversation, type Contact, type Conversation } from "@/app/actions/direct-messages";

interface Props {
  onBack: () => void;
  onConversationReady: (conv: Conversation) => void;
}

function roleLabel(role: string) {
  if (role === "agent") return "Your Agent";
  if (role === "partner") return "Your Partner";
  return "Buyer";
}

function roleBadgeColor(role: string) {
  if (role === "agent") return "bg-blue-100 text-blue-700";
  if (role === "partner") return "bg-amber-100 text-amber-700";
  return "bg-amber-100 text-gray-800";
}

export function NewChatPicker({ onBack, onConversationReady }: Props) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getAvailableContacts().then((res) => {
      setContacts(res.data);
      setLoading(false);
    });
  }, []);

  async function handleSelect(contact: Contact) {
    setStarting(contact.id);
    const result = await getOrCreateConversation(contact.id, contact.role);
    setStarting(null);
    if (result.data) onConversationReady(result.data);
  }

  const filtered = contacts.filter((c) =>
    c.full_name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  // Group by role
  const agents = filtered.filter((c) => c.role === "agent");
  const partners = filtered.filter((c) => c.role === "partner");

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
        <button onClick={onBack} className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
          <ArrowLeft className="h-4 w-4 text-gray-500" />
        </button>
        <p className="text-sm font-bold text-gray-900">New Conversation</p>
      </div>

      {/* Search */}
      <div className="px-4 py-2 border-b border-gray-100">
        <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-1.5">
          <Search className="h-3.5 w-3.5 text-gray-400 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search…"
            className="flex-1 text-xs outline-none bg-transparent placeholder-gray-400"
          />
        </div>
      </div>

      {/* Contacts */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center pt-8">
            <Loader2 className="h-5 w-5 animate-spin text-amber-400" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-xs text-gray-400 pt-8">No contacts found.</p>
        ) : (
          <>
            {agents.length > 0 && (
              <div>
                <p className="px-4 pt-3 pb-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Your Agent</p>
                {agents.map((c) => <ContactRow key={c.id} contact={c} starting={starting} onSelect={handleSelect} />)}
              </div>
            )}
            {partners.length > 0 && (
              <div>
                <p className="px-4 pt-3 pb-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Your Partner</p>
                {partners.map((c) => <ContactRow key={c.id} contact={c} starting={starting} onSelect={handleSelect} />)}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function ContactRow({ contact, starting, onSelect }: {
  contact: Contact;
  starting: string | null;
  onSelect: (c: Contact) => void;
}) {
  const isStarting = starting === contact.id;
  return (
    <button
      onClick={() => onSelect(contact)}
      disabled={!!starting}
      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 disabled:opacity-60"
    >
      <div
        className="flex h-9 w-9 items-center justify-center rounded-full text-white text-xs font-bold shrink-0"
        style={{ background: "linear-gradient(135deg, #1F2937, #D4AF37)" }}
      >
        {contact.full_name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)}
      </div>
      <div className="flex-1 min-w-0 text-left">
        <p className="text-xs font-bold text-gray-900 truncate">{contact.full_name}</p>
        <p className="text-[10px] text-gray-400 truncate">{contact.email}</p>
      </div>
      {isStarting && <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-400 shrink-0" />}
    </button>
  );
}
