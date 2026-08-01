"use client";

import { useState } from "react";
import type { BespokeMessageData } from "@/lib/types";

type BespokeConversationThreadProps = {
  messages: BespokeMessageData[];
  onSendMessage: (message: string) => Promise<any>;
  role?: "buyer" | "designer";
  className?: string;
};

export function BespokeConversationThread({
  messages = [],
  onSendMessage,
  role = "buyer",
  className = "",
}: BespokeConversationThreadProps) {
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sending) return;
    setSending(true);
    try {
      await onSendMessage(input.trim());
      setInput("");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className={`rounded-xl bg-white border border-[#E8E4DC] p-4 flex flex-col h-80 ${className}`}>
      <span className="font-sans text-[10px] font-extrabold uppercase tracking-widest text-[#C5A059] mb-3 block">
        💬 Bespoke Consultation Thread
      </span>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-none">
        {messages.length === 0 ? (
          <p className="font-sans text-xs text-[#7A7A7A] italic text-center py-8">
            No messages in this thread yet. Send a note to the atelier master weaver.
          </p>
        ) : (
          messages.map((msg) => {
            const isMe = (role === "buyer" && msg.senderRole === "buyer") || (role === "designer" && msg.senderRole === "designer");
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-xl font-sans text-xs leading-relaxed ${
                    isMe
                      ? "bg-[#101010] text-white rounded-br-none"
                      : "bg-[#F9F7F2] text-[#2B2B2B] border border-[#E8E4DC] rounded-bl-none"
                  }`}
                >
                  <p className="font-bold text-[9px] text-[#C5A059] uppercase mb-0.5">
                    {msg.senderName || (msg.senderRole === "buyer" ? "Client" : "Maison Weaver")}
                  </p>
                  <p>{msg.message}</p>
                </div>
                <span className="font-sans text-[9px] text-[#A0A0A0] mt-1">
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* Input form */}
      <form onSubmit={handleSubmit} className="mt-3 pt-3 border-t border-[#E8E4DC] flex gap-2">
        <input
          type="text"
          placeholder="Type update or notes for atelier..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 px-3 py-2 rounded-lg border border-[#E8E4DC] text-xs outline-none focus:border-[#2B2B2B]"
        />
        <button
          type="submit"
          disabled={sending || !input.trim()}
          className="px-4 py-2 bg-[#101010] text-white rounded-lg font-sans text-xs font-bold uppercase tracking-wider disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}
