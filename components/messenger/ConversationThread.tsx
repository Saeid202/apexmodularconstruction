"use client";

import { useState, useEffect, useRef } from "react";
import { Send, Loader2, ArrowLeft } from "lucide-react";
import {
  getConversationMessages,
  sendDirectMessage,
  markConversationRead,
  type DirectMessage,
  type Conversation,
} from "@/app/actions/direct-messages";
import { createBrowserClient } from "@/lib/supabase/client";

interface Props {
  conversation: Conversation;
  currentUserId: string;
  onBack: () => void;
  onMessageSent: () => void;
}

function groupByDate(messages: DirectMessage[]) {
  const map = new Map<string, DirectMessage[]>();
  for (const msg of messages) {
    const date = new Date(msg.created_at).toLocaleDateString(undefined, {
      month: "short", day: "numeric", year: "numeric",
    });
    if (!map.has(date)) map.set(date, []);
    map.get(date)!.push(msg);
  }
  return Array.from(map.entries()).map(([date, msgs]) => ({ date, msgs }));
}

export function ConversationThread({ conversation, currentUserId, onBack, onMessageSent }: Props) {
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  async function load() {
    const result = await getConversationMessages(conversation.id);
    if (!result.error) {
      setMessages(result.data);
      await markConversationRead(conversation.id);
    }
    setLoading(false);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  }

  useEffect(() => {
    setLoading(true);
    setMessages([]);
    load();

    // Supabase Realtime — listen for new messages in this conversation
    const supabase = createBrowserClient();
    const channel = supabase
      .channel(`thread-${conversation.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "direct_messages",
          filter: `conversation_id=eq.${conversation.id}`,
        },
        () => { load(); }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [conversation.id]);

  async function handleSend() {
    if (!text.trim()) return;
    setSending(true);
    setError(null);
    const result = await sendDirectMessage(conversation.id, text.trim());
    setSending(false);
    if (result.error) { setError(result.error); return; }
    setText("");
    onMessageSent();
    load();
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }

  const grouped = groupByDate(messages);

  return (
    <div className="flex flex-col h-full">
      {/* Thread header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-white">
        <button onClick={onBack} className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
          <ArrowLeft className="h-4 w-4 text-gray-500" />
        </button>
        <div
          className="flex h-8 w-8 items-center justify-center rounded-full text-white text-xs font-bold shrink-0"
          style={{ background: "linear-gradient(135deg, #4B1D8F, #D4AF37)" }}
        >
          {conversation.other_user_name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)}
        </div>
        <div>
          <p className="text-sm font-bold text-gray-900 leading-tight">{conversation.other_user_name}</p>
          <p className="text-[10px] text-gray-400 capitalize">{conversation.other_user_role}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {loading ? (
          <div className="flex justify-center pt-8">
            <Loader2 className="h-5 w-5 animate-spin text-purple-400" />
          </div>
        ) : messages.length === 0 ? (
          <p className="text-center text-xs text-gray-400 pt-8">
            No messages yet. Say hello 👋
          </p>
        ) : (
          grouped.map(({ date, msgs }) => (
            <div key={date}>
              {/* Date divider */}
              <div className="flex items-center gap-2 my-3">
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-[10px] text-gray-400 font-medium">{date}</span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>

              {msgs.map((msg) => {
                const isMe = msg.sender_id === currentUserId;
                return (
                  <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"} mb-1.5`}>
                    <div
                      className={`max-w-[78%] px-3 py-2 rounded-2xl text-sm ${
                        isMe
                          ? "text-white rounded-br-sm"
                          : "bg-gray-100 text-gray-900 rounded-bl-sm"
                      }`}
                      style={isMe ? { background: "linear-gradient(135deg, #4B1D8F, #3A1570)" } : {}}
                    >
                      <p className="whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                      <p className={`text-[10px] mt-1 ${isMe ? "text-purple-200 text-right" : "text-gray-400"}`}>
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Error */}
      {error && <p className="px-4 py-1 text-xs text-red-600 bg-red-50">{error}</p>}

      {/* Input */}
      <div className="px-3 py-3 border-t border-gray-100 bg-white">
        <div className="flex items-end gap-2">
          <div className="flex-1 border-2 border-[#4B1D8F]/40 rounded-2xl px-3 py-2 focus-within:border-[#4B1D8F] transition-colors">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKey}
              rows={1}
              placeholder="Type a message…"
              className="w-full resize-none text-sm outline-none bg-transparent max-h-24 placeholder-gray-400"
            />
          </div>
          <button
            onClick={handleSend}
            disabled={sending || !text.trim()}
            className="flex items-center justify-center h-9 w-9 rounded-xl text-white disabled:opacity-40 shrink-0 transition-opacity"
            style={{ background: "linear-gradient(135deg, #4B1D8F, #3A1570)" }}
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </div>
        <p className="text-[10px] text-gray-400 mt-1 pl-1">Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  );
}
