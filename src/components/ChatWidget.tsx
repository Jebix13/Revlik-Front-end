"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type ChatMessage = { role: "user" | "assistant"; content: string };

const STORAGE_KEY = "revlik_assistant_thread";

function loadThread(): ChatMessage[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveThread(messages: ChatMessage[]) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  } catch {
    // ignore - per-viewer convenience only
  }
}

export default function ChatWidget() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages(loadThread());
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, open]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending) return;

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    saveThread(nextMessages);
    setInput("");
    setSending(true);
    setError(null);

    const res = await fetch("/api/assistant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: nextMessages }),
    });

    setSending(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong");
      return;
    }

    const data = await res.json();
    const withReply: ChatMessage[] = [...nextMessages, { role: "assistant", content: data.reply }];
    setMessages(withReply);
    saveThread(withReply);

    if (data.changed) {
      router.refresh();
    }
  }

  function handleClear() {
    setMessages([]);
    saveThread([]);
    setError(null);
  }

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open && (
        <div className="mb-3 flex h-[480px] w-[360px] flex-col overflow-hidden rounded-xl border border-black/10 bg-[#fcfcfb] shadow-lg dark:border-white/10 dark:bg-[#1a1a19]">
          <div className="flex items-center justify-between border-b border-black/10 px-4 py-3 dark:border-white/10">
            <div>
              <p className="text-sm font-semibold text-[#0b0b0b] dark:text-white">Assistant</p>
              <p className="text-xs text-[#898781]">Update deals by chatting</p>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleClear}
                className="rounded-md px-2 py-1 text-xs text-[#52514e] hover:bg-black/5 dark:text-[#c3c2b7] dark:hover:bg-white/5"
              >
                Clear
              </button>
              <button
                onClick={() => setOpen(false)}
                className="rounded-md px-2 py-1 text-xs text-[#52514e] hover:bg-black/5 dark:text-[#c3c2b7] dark:hover:bg-white/5"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3">
            {messages.length === 0 && (
              <p className="text-xs text-[#898781]">
                Try: &ldquo;move Acme to negotiation&rdquo;, &ldquo;bump Globex to $70k&rdquo;, or
                &ldquo;what&rsquo;s my biggest open deal?&rdquo;
              </p>
            )}
            <div className="flex flex-col gap-2">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                    m.role === "user"
                      ? "ml-auto bg-[#2a78d6] text-white"
                      : "bg-black/5 text-[#0b0b0b] dark:bg-white/10 dark:text-white"
                  }`}
                >
                  {m.content}
                </div>
              ))}
              {sending && (
                <div className="max-w-[85%] rounded-lg bg-black/5 px-3 py-2 text-sm text-[#898781] dark:bg-white/10">
                  Thinking…
                </div>
              )}
            </div>
          </div>

          {error && (
            <p className="px-4 pb-1 text-xs text-[#d03b3b]" role="alert">
              {error}
            </p>
          )}

          <form onSubmit={handleSend} className="flex gap-2 border-t border-black/10 p-3 dark:border-white/10">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Move Acme to negotiation…"
              className="flex-1 rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm text-[#0b0b0b] outline-none focus:border-[#2a78d6] dark:border-white/10 dark:text-white"
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              className="rounded-lg bg-[#2a78d6] px-3 py-2 text-sm font-medium text-white hover:bg-[#1c5cab] disabled:opacity-50"
            >
              Send
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[#2a78d6] text-white shadow-lg hover:bg-[#1c5cab]"
        aria-label={open ? "Close assistant" : "Open assistant"}
      >
        {open ? (
          <span className="text-xl">✕</span>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"
            />
          </svg>
        )}
      </button>
    </div>
  );
}
