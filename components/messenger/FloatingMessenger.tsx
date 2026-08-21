"use client";

import { useState, useEffect, useCallback } from "react";
import { MessageSquare, X } from "lucide-react";
import {
  getMyConversations,
  getTotalUnreadCount,
  type Conversation,
} from "@/app/actions/direct-messages";
import { ConversationList } from "./ConversationList";
import { ConversationThread } from "./ConversationThread";
import { NewChatPicker } from "./NewChatPicker";
import { createBrowserClient } from "@/lib/supabase/client";

type Panel = "list" | "thread" | "new";

export function FloatingMessenger() {
  const [open, setOpen] = useState(false);
  const [panel, setPanel] = useState<Panel>("list");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [unread, setUnread] = useState(0);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Get current user id once
  useEffect(() => {
    const supabase = createBrowserClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setCurrentUserId(data.user.id);
    });
  }, []);

  const loadConversations = useCallback(async () => {
    const [convResult, count] = await Promise.all([
      getMyConversations(),
      getTotalUnreadCount(),
    ]);
    setConversations(convResult.data);
    setUnread(count);
  }, []);

  // Initial load — deferred so it doesn't block navigation
  useEffect(() => {
    const timer = setTimeout(loadConversations, 500);
    return () => clearTimeout(timer);
  }, [loadConversations]);

  // Supabase Realtime — subscribe to new direct_messages for this user
  useEffect(() => {
    if (!currentUserId) return;
    const supabase = createBrowserClient();

    const channel = supabase
      .channel("direct-messages-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "direct_messages",
        },
        () => {
          // Refresh conversations + unread count on any new message
          loadConversations();
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [currentUserId, loadConversations]);

  // Refresh when panel opens
  useEffect(() => {
    if (open) loadConversations();
  }, [open, loadConversations]);

  function handleSelectConversation(conv: Conversation) {
    setActiveConv(conv);
    setPanel("thread");
  }

  function handleNewConversationReady(conv: Conversation) {
    setConversations((prev) => {
      const exists = prev.find((c) => c.id === conv.id);
      if (exists) return prev;
      return [conv, ...prev];
    });
    setActiveConv(conv);
    setPanel("thread");
  }

  function handleBack() {
    setPanel("list");
    setActiveConv(null);
    loadConversations();
  }

  if (!currentUserId) return null;

  return (
    <>
      {/* Floating bubble */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-xl transition-transform hover:scale-105 focus:outline-none"
        style={{ background: "linear-gradient(135deg, #4B1D8F, #3A1570)", border: "2px solid #D4AF37" }}
        aria-label="Open messenger"
      >
        {open ? (
          <X className="h-6 w-6" />
        ) : (
          <>
            <MessageSquare className="h-6 w-6" />
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-black border-2 border-white">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </>
        )}
      </button>

      {/* Panel */}
      {open && (
        <div
          className="fixed bottom-24 right-6 z-50 w-80 rounded-2xl bg-white overflow-hidden flex flex-col"
          style={{
            height: 480,
            boxShadow: "0 8px 40px rgba(75,29,143,0.22), 0 0 0 1px rgba(75,29,143,0.12)",
          }}
        >
          {/* Panel header */}
          <div
            className="flex items-center justify-between px-4 py-3 shrink-0"
            style={{ background: "linear-gradient(135deg, #4B1D8F, #3A1570)" }}
          >
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-yellow-300" />
              <p className="text-sm font-bold text-white">Messenger</p>
            </div>
            <button onClick={() => setOpen(false)} className="text-purple-200 hover:text-white transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Panel body */}
          <div className="flex-1 overflow-hidden">
            {panel === "list" && (
              <ConversationList
                conversations={conversations}
                activeId={activeConv?.id ?? null}
                onSelect={handleSelectConversation}
                onNewChat={() => setPanel("new")}
              />
            )}
            {panel === "thread" && activeConv && (
              <ConversationThread
                conversation={activeConv}
                currentUserId={currentUserId}
                onBack={handleBack}
                onMessageSent={loadConversations}
              />
            )}
            {panel === "new" && (
              <NewChatPicker
                onBack={() => setPanel("list")}
                onConversationReady={handleNewConversationReady}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}
