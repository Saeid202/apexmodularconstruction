"use client";

import { MessageSquarePlus } from "lucide-react";
import type { Conversation, Contact } from "@/app/actions/direct-messages";

interface Props {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (conv: Conversation) => void;
  onNewChat: () => void;
}

function roleLabel(role: string) {
  if (role === "agent") return "Agent";
  if (role === "partner") return "Partner";
  return "Buyer";
}

function roleBadgeColor(role: string) {
  if (role === "agent") return "bg-blue-100 text-blue-700";
  if (role === "partner") return "bg-amber-100 text-amber-700";
  return "bg-amber-100 text-gray-800";
}

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

function timeAgo(iso: string | null) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

export function ConversationList({ conversations, activeId, onSelect, onNewChat }: Props) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <p className="text-sm font-bold text-gray-900">Messages</p>
        <button
          onClick={onNewChat}
          title="New conversation"
          className="flex items-center justify-center h-7 w-7 rounded-lg hover:bg-amber-50 transition-colors"
          style={{ color: "#1F2937" }}
        >
          <MessageSquarePlus className="h-4 w-4" />
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full px-4 text-center">
            <p className="text-xs text-gray-400 mt-2">No conversations yet.</p>
            <button
              onClick={onNewChat}
              className="mt-3 text-xs font-semibold underline"
              style={{ color: "#1F2937" }}
            >
              Start one
            </button>
          </div>
        ) : (
          conversations.map((conv) => {
            const isActive = conv.id === activeId;
            return (
              <button
                key={conv.id}
                onClick={() => onSelect(conv)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-b border-gray-50 ${
                  isActive ? "bg-amber-50" : "hover:bg-gray-50"
                }`}
              >
                {/* Avatar */}
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-full text-white text-xs font-bold shrink-0"
                  style={{ background: "linear-gradient(135deg, #1F2937, #D4AF37)" }}
                >
                  {initials(conv.other_user_name)}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <p className="text-xs font-bold text-gray-900 truncate">{conv.other_user_name}</p>
                    <span className="text-[10px] text-gray-400 shrink-0">{timeAgo(conv.last_message_at)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-1 mt-0.5">
                    <p className="text-[11px] text-gray-500 truncate">{conv.last_message ?? "No messages yet"}</p>
                    {conv.unread_count > 0 && (
                      <span className="flex h-4 w-4 items-center justify-center rounded-full text-white text-[9px] font-bold shrink-0"
                        style={{ background: "#1F2937" }}>
                        {conv.unread_count > 9 ? "9+" : conv.unread_count}
                      </span>
                    )}
                  </div>
                  <span className={`inline-block mt-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide ${roleBadgeColor(conv.other_user_role)}`}>
                    {roleLabel(conv.other_user_role)}
                  </span>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
