"use client";

import { useEffect } from "react";
import "@n8n/chat/style.css";
import { createChat } from "@n8n/chat";

const N8N_CHAT_WEBHOOK_URL =
  "https://jebixn8n.reelsblocker.online/webhook/367b54ab-3ccb-462b-9877-5ec5c6e0f247/chat";

export default function N8nChatWidget() {
  useEffect(() => {
    const app = createChat({
      webhookUrl: N8N_CHAT_WEBHOOK_URL,
      target: "#n8n-chat-widget",
      mode: "window",
      showWelcomeScreen: false,
      initialMessages: ["Hi there! 👋", "How can I help you today?"],
      i18n: {
        en: {
          title: "Revlik Agent",
          subtitle: "Ask me anything.",
          footer: "",
          getStarted: "New conversation",
          inputPlaceholder: "Type your question…",
          closeButtonTooltip: "Close",
        },
      },
    });

    // createChat mounts a Vue app into the target element; unmount on
    // cleanup so React StrictMode's double-invoke (and route changes)
    // don't mount a second instance onto the same container.
    return () => app.unmount();
  }, []);

  return <div id="n8n-chat-widget" />;
}
